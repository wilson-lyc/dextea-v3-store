# 后端代码改进建议（`apps/api`）

> 审查范围：`apps/api/src`（51 个 TS 文件）、`apps/api/package.json`、`apps/api/drizzle.config.ts`，并交叉核对 `apps/web/src/lib/api/*` 与 `README.md`
> 结论：**确实乱，但"乱"不只是目录摆放问题**。目录只是表象，真正影响交付的是三类更严重的问题——前后端接口契约已经对不上、鉴权形同虚设、错误处理语义错配。建议按本文的优先级处理，而不是先做目录搬家。
> 与 `docs/backend-refactor-plan.md` 的关系：那份文档只覆盖"目录结构迁移"，且未涉及本文 P0/P1 中的契约、鉴权、错误、校验、死代码等问题；本文是它的超集，以本文为准。

---

## 实施状态：已完成 ✅

本文列出的 16 项问题已全部落地修复，当前代码以本文为准。主要变更：

| 项 | 结果 |
| --- | --- |
| P0-1 接口契约断裂 | 全部路由统一到 `/api/v1` 前缀并与前端对齐；路径常量收敛到 `@dextea/constraints` 的 `apiRoutes`，新增契约测试遍历前端实际调用的全部路径并断言非 404 |
| P0-2 鉴权与租户隔离 | 新增 `interfaces/http/auth-guard.ts`：鉴权默认开启、仅 `publicRoute` 放行；门店身份只取自 JWT，客户端自带的 `X-Store-Id` 在钩子中被删除；`?storeId=` 越权入口已移除 |
| P0-3 错误语义 | 业务码改为字符串（`STORE_NOT_FOUND` 等），HTTP 状态由 `interfaces/http/error-handler.ts` 映射并显式 `reply.code()`；统一包络 `{ code, message, data }` |
| P1-4 目录结构 | 已重构为 `config/`、`modules/{auth,store,product,customization,order}`、`infrastructure/`、`interfaces/http/`、`shared/` |
| P1-5 校验 | 全部入参改由路由级 zod schema 校验（`fastify-type-provider-zod`），controller 内零手写校验 |
| P1-6 分层渗透 | `FastifyRequest` 已移出服务层（订单服务改为接收 `{ storeId, authToken }`）；服务返回领域对象，视图转换上提到 presenter；仓储改为接口 + Drizzle 实现 |
| P1-7 装配 | `app.ts` 只维护模块列表；业务模块注册在独立封装作用域内，鉴权钩子不再影响 `/health`、`/docs` 与 404 |
| P1-8 竞态与重复 | 更新类操作改为单条条件更新 + `affectedRows` 判定（不再"先查后改"）；重复的默认状态映射抽取为 `shared/store-status.ts` |
| P1-9 死代码 | 删除 nacos 客户端、redis 客户端、6 个 barrel、重复的 `config/index.ts` 等；移除 5 个未使用依赖（`nacos`、`ioredis`、`@fastify/env`、`@fastify/jwt`、`@fastify/sensible`） |
| P1-10 shared 混杂 | 拆分为 `infrastructure`（纯技术）与 `interfaces/http`（横切 HTTP）；数据库连接改为惰性创建并由生命周期托管；schema 按限界上下文拆分 |
| P1-11 类型安全 | 枚举 `schema()` 改为字面量联合校验，DB 出口也用 zod 解析；移除状态码 `as` 强转；开启 `noUncheckedIndexedAccess` |
| P2-12 测试 | 新增 22 个 Vitest 用例（契约 / 鉴权 / 错误处理 / 服务单测） |
| P2-13 可观测性 | 接入 pino 结构化日志（脱敏 authorization 与密码字段）、启用请求日志与 OpenAPI 文档 |
| P2-14 文档 | README 已同步（环境变量、路由、响应约定、迁移注意事项） |
| P2-15 API 文档 | 启用 `@fastify/swagger` + Swagger UI，非生产环境提供 `/docs` |
| P2-16 版本控制 | `apps/api/drizzle/` 改为入库；`*.tsbuildinfo` 加入忽略并清理已提交产物 |

验证结果：`typecheck`、`lint`、`test`（22 passed）、`build` 全部通过，并已完成构建产物冒烟测试（健康检查、401/404 包络、OpenAPI 路由清单）。

---

## 一、现状快照

### 1.1 当前目录结构

```
apps/api/src/
├── index.ts                  # 启动入口：MQ、优雅关闭、listen
├── app.ts                    # 手工 new 出全部依赖并注册路由
├── config.ts                 # 配置加载 + 校验（模块加载时 process.exit）
├── config/index.ts           # 仅一行 re-export '../config.js'（与 config.ts 重复）
├── controller/               # 4 个控制器（路由注册也写在里面）
├── service/                  # 5 个服务（含 auth、外部微服务代理 order）
├── repository/               # 3 个仓储
├── model/                    # 3 个领域模型
├── mapper/                   # 3 个 model -> view 映射
├── error/                    # 4 个业务错误码表
└── shared/                   # database / errors / interfaces / mq / nacos / redis / security / types / utils
    ├── database/schema.ts    # 29 张表的全库定义（17KB，drizzle-kit pull 产物）
    └── index.ts              # 混合再导出 config + errors + mq + nacos + http
```

### 1.2 几个必须先知道的事实

| 事实 | 证据 |
| --- | --- |
| 后端路由全部注册在根路径，无 `/api` 前缀、无版本 | `app.ts:48-51` + 各 controller 的 `registerRoutes` |
| 前端全部请求都带 `/api/v1/...` 前缀 | `apps/web/src/lib/api/auth.ts:7`、`store.ts:23,26,29`、`product.ts:40,43,46,49,52`、`orders.ts:56,60` |
| 除 `/login` 外没有任何鉴权钩子 | `app.ts:44-51` 只注册了错误处理和 store-id 拦截器 |
| `X-Store-Id` 请求头可被客户端直接伪造并生效 | `store-id-interceptor.ts:9-11` 无 Authorization 时直接 return |
| 全库 29 张表，本服务只用到 6 张 | `shared/database/schema.ts` vs 三个 repository 的引用 |
| 零测试文件、无 ESLint / Prettier、无 CI 配置 | 仓库内检索结果为空 |
| 已安装但完全未使用的依赖：6 个 | `package.json:22-27`（见 2.9 节清单） |

---

## 二、问题清单（按优先级）

### P0-1 前后端接口契约不一致：所有请求都会 404

前端调用路径与后端注册路径**没有一条能对上**：

| 前端调用 | 后端注册 | 差异 |
| --- | --- | --- |
| `POST /api/v1/auth/login` | `POST /login` | 前缀 + 路径 |
| `GET /api/v1/store/` | `GET /stores/:id` | 前缀 + 后端强制要 id |
| `PUT /api/v1/store/status` | `PATCH /stores/:id/status` | 前缀 + 方法 + id |
| `PUT /api/v1/store/password` | `POST /stores/:id/reset-password` | 前缀 + 方法 + id |
| `GET /api/v1/products/` | `GET /` | 前缀 |
| `PATCH /api/v1/products/:id/store-status` | `PATCH /:id/store-status` | 前缀 |
| `POST /api/v1/products/batch/store-status` | `POST /batch/store-status` | 前缀 |
| `GET /api/v1/products/:productId/customizations` | `GET /:productId/customizations` | 前缀 |
| `PATCH /api/v1/products/customizations/options/:optionId/store-status` | `PATCH /customizations/options/:optionId/store-status` | 前缀 + 归属层级不同 |
| `GET /api/v1/store/orders/window` | `GET /orders/window` | 前缀 |

**影响**：除非网关做了前缀剥离，否则整个店铺端前端是不可用的。`README.md` 里的 nginx 示例是 `proxy_pass` 原样转发带 `/api/` 的路径，不会剥离前缀，因此按 README 部署同样是 404。

**建议**：
1. 后端统一加 `/api/v1` 前缀和版本化路由注册（见 3.4）；
2. 以 `@dextea/constraints` 为唯一契约源，把路径常量也纳入该包（前后端共用一份 path builder），从机制上杜绝漂移；
3. 前端视图类型与后端 `mapper` 输出目前是各写一份（`apps/web/src/lib/api/product.ts:3-13` 里甚至多了后端没有的 `image` 字段），应把 `StoreView` / `ProductView` / `CustomizationItemView` 全部下沉到 `packages/constraints`；
4. 补一条契约测试：用 `app.inject()` 遍历前端实际调用的 10 个路径，断言返回非 404。

### P0-2 鉴权与租户隔离失效

三处叠加导致"登录形同虚设、还能看别人的数据"：

1. **无鉴权钩子**：`app.ts` 只注册了 `preHandler` 的 store-id 拦截器，没有任何路由要求登录。未带 Token 的请求照样能访问商品、客制化、订单接口。
2. **`X-Store-Id` 可伪造**：`store-id-interceptor.ts:9-11` 在没有 `Authorization` 头时直接 return，客户端自送的 `X-Store-Id` 原样保留，随后被 `product-controller.ts:19`、`order-controller.ts:12` 等 `Number()` 后当作门店身份使用。**任意人可以伪造任意门店身份读写数据。**
3. **query 参数可覆盖门店身份**：`customization-controller.ts:36` 使用 `query.storeId ?? request.headers['x-store-id']`，即便修好了 2，攻击者仍可用 `?storeId=<他人门店>` 越权（IDOR）。

**建议**：
- 把"解析 Token"和"注入 storeId"拆成两个职责，并让注入逻辑**无条件覆盖**客户端传入值，绝不接受客户端自报身份；
- 删除 `storeId` 的 query 入参，门店身份只允许来自令牌；
- 增加显式鉴权：Fastify `preHandler`（或 `@fastify/jwt` 的 `onRequest` 钩子）按路由声明，公开路由放入白名单（`/login`、`/health`）；
- 订单转发链路同理：`order-service.ts:16` 只在有 Authorization 时才转发，未登录请求会以"无身份"打到订单微服务，应在网关层就拦截。

### P0-3 错误响应语义错配，前端登出逻辑失效

- 业务错误码把 HTTP 状态码硬编码进领域层：`error/store-error.ts:4` 是 `new BizErrorCode(404, '门店不存在')`，`biz-error-code.ts:1-5` 只有 `code` + `message` 两个字段；
- 但错误处理器 **没有设置 HTTP 状态码**：`error-handler.ts:17-22` 直接 `reply.send({ code: error.code, ... })`，真实 HTTP 状态恒为 200；
- 成功响应又是另一套约定：`api-response.ts:12-20` 的 `success()` 返回 `code: 0`。

**影响**：前端 `request.ts:58` 依赖 `response.status === 401` 清 Token 并跳登录页，实际永远收不到 401，令牌过期后用户会卡在异常状态。`code` 字段同时承担"业务码"和"HTTP 码"两种语义，长期必然混乱。

**建议**：三层分离——领域错误只带**业务码**（如 `STORE_NOT_FOUND`）+ 消息；HTTP 状态由 interfaces 层的映射表决定；统一响应包络为 `{ code, message, data }`，其中 `code` 恒为业务码（成功为 `0`），HTTP 状态另行设置。同时补上 `reply.code(...)`，并让 `toApiResponse`（`api-response.ts:22`，目前无人调用）成为唯一的错误序列化入口，避免 `error-handler` 里手写对象字面量。

### P1-4 目录按技术职能切分，业务内聚度为零

改一个"商品"需求要同时动 `controller/`、`service/`、`repository/`、`model/`、`mapper/`、`error/` 六个目录；新增一个领域要新建 6 个文件、改 6 个 barrel。跨文件跳转成本远高于业务本身的复杂度。

这与 `docs/backend-refactor-plan.md` 的判断一致，不重复论证，迁移方案见本文第 3 节。

### P1-5 参数校验三种写法并存，共享 schema 没接线

`@dextea/constraints` 已经为**每一个**请求提供了 zod schema，但用得很随意：

| 接口 | 校验方式 |
| --- | --- |
| `/login`、`/stores/:id/*` | **完全不校验**，只 `import type`（`store-controller.ts:5`） |
| `/batch/store-status` | 手写 `Array.isArray` + 硬编码中文错误（`product-controller.ts:40-49`） |
| 客制化两个接口 | 在 controller 里手写 `safeParse` + 手写 400（`customization-controller.ts:39-41`） |
| `/:id/store-status`、`orders/*` | 无校验 |

**后果举例**：`PATCH /stores/1/status` 不带 body 时 `request.body` 为 `undefined`，`store-service.ts:23` 读 `input.status` 直接 TypeError → 500；`Number(request.headers['x-store-id'])` 在头缺失时得到 `NaN`，会带着 `NaN` 去查库。

**建议**：用 Fastify 原生的 schema 校验（`fastify-type-provider-zod` 已是依赖，且 `error-handler.ts:2,8` 已经为它写了分支，只差接线），在路由上声明 `schema: { body, params, querystring, response }`，得到三件事：一次声明同时完成运行时校验、编译期类型推导、以及 OpenAPI 文档。controller 里不再出现任何手写 if 校验。

### P1-6 分层依赖渗透与倒置

- **HTTP 框架渗透进领域层**：`order-service.ts:1` 直接 `import type { FastifyRequest }`，服务层方法签名里出现 `request` 对象（`order-service.ts:36,40,44,53`）。
- **服务层依赖展示层**：`store-service.ts:7`、`product-service.ts:1`、`customization-service.ts:1-6` 都 import `mapper`，领域逻辑与视图序列化耦合。
- **领域层里出现 HTTP 状态码**：见 P0-3。
- **仓储是具体类而非接口**：只有 `AuthService` 定义了接口（`auth-service.ts:19-23`），其余服务注入的都是具体类，单测无法替换。
- **枚举值 bypass**：`product-repository.ts:15` 用魔法数字 `eq(products.status, 1)` 而不是 `productGlobalStatusCode.GLOBAL_ACTIVE`；`model/product.ts:14` 已经写好的 `isGloballyActive()` 反而没人用。

**建议**：明确依赖方向 `interfaces → application → domain ← infrastructure`，领域层不 import 任何 fastify/drizzle 类型；仓储改为接口（port）+ drizzle 实现（adapter）；服务层返回领域模型，视图转换统一上提到 controller 或独立的 presenter。

### P1-7 手工装配，模块边界靠自觉

`app.ts:29-51` 手工 new 出 3 个仓储、5 个服务、4 个控制器，再逐个 `registerRoutes`。新增一个领域要改 `app.ts`，且没有任何机制阻止 A 模块直接 import B 模块的内部文件。

**建议**：每个模块导出自己的装配函数（`<domain>.module.ts` 或 Fastify 插件），`app.ts` 只做 `app.register(...)` 列表；配合 ESLint `import/no-restricted-paths` 或 `dependency-cruiser` 把"禁止跨模块 import 内部文件"变成可执行的规则，而不是口头约定。

### P1-8 重复代码与事务缺失

- **先查后改，无事务**：`store-service.ts:21-34`（更新状态）、`store-service.ts:36-59`（改密码）都是 `findById` → 校验 → `update`，存在并发竞态，且改密码时"校验旧密码 + 写入新密码"非原子。
- **状态默认值逻辑复制两份**：`product-repository.ts:20-49` 与 `customization-repository.ts:54-82` 是同一段"先塞默认禁用值，再查表覆盖"的逻辑。
- **`Number(row.x)` 遍地**：三个仓储的 `toModel` 里重复做 decimal/bigint 转换，应沉淀为通用 row 转换工具或在 drizzle schema 层用 `{ mode: 'number' }` 统一。
- **密码校验逻辑重复**：`auth-service.ts:67-77` 与 `store-service.ts:42-52` 是同一段 argon2 校验 + 异常兜底。

### P1-9 死代码、未使用依赖、重复的 barrel

已确认**无人引用**的代码：

| 项 | 位置 |
| --- | --- |
| `toApiResponse` | `shared/types/api-response.ts:22` |
| `ProductErrorCode`（整个错误码表） | `error/product-error.ts` |
| `STORE_STATUS_UPDATE_BUSY` | `error/store-error.ts:9` |
| 三个 `isGloballyActive()` | `model/product.ts:14`、`model/customization.ts:19,36` |
| `publishOrderMakingMessage` | `shared/mq/order-making.ts:45` |
| `getNacosConfig` / `createNacosConfigClient` | `shared/nacos/config-client.ts:23,36` |
| Redis 客户端（连接建了但从不使用） | `shared/redis/index.ts` |
| `shared/index.ts` 整个文件 | `shared/index.ts` |
| 6 个 barrel：`controller/index.ts`、`service/index.ts`、`repository/index.ts`、`model/index.ts`、`mapper/index.ts`、`error/index.ts` | 各目录 |
| 模块级单例 `orderService` | `service/order-service.ts:63`（`app.ts:42` 另 new 了一个） |

**未使用的依赖**（`package.json:22-27`）：`@fastify/env`、`@fastify/helmet`、`@fastify/jwt`、`@fastify/sensible`、`@fastify/swagger`、`@fastify/swagger-ui` —— 实际只用到了 `@fastify/cors`。其中 `@fastify/helmet` 未启用意味着没有任何安全响应头，`@fastify/swagger*` 未启用意味着没有 API 文档。

**其他**：`config.ts` 与 `config/index.ts` 并存（后者只有一行 re-export），属于典型的重构残留；`README.md` 声称"Redis 用于分布式锁"，实际锁逻辑已不存在。

### P1-10 `shared` 职责混杂 + import 副作用 + 全库 schema

- **职责混杂**：`shared/` 里既有纯基础设施（database/redis/security），也有横切 HTTP（interfaces/error-handler），还有业务无关的工具（utils/logger）；`shared/index.ts` 把 config、errors、mq、nacos、http 混在一起再导出，等于取消了所有边界。
- **import 副作用**：`shared/database/index.ts:7-15` 在模块加载时创建连接池，`shared/redis/index.ts:7` 在模块加载时建立 Redis 连接。而 `database/index.ts:18` 又 `export * from './schema.js'`，导致**只是想 import 一个表定义也会建连接池**，测试环境和 drizzle-kit 都被拖累。
- **全库 schema**：`schema.ts` 是 `drizzle-kit pull` 出来的 29 张表（含 `customers` 的密码、微信/支付宝 openId 等敏感表），本服务只用 6 张。这既扩大了认知负担，也在诱导跨限界上下文直接查表，并把别的服务的敏感表结构铺在本仓库里。
- **命名冲突**：`schema.ts:4` 导出名为 `config` 的表，与全局 `config` 同名，经 `database/index.ts:18` 再导出后极易误引。

**建议**：拆成 `infrastructure/`（纯技术）+ `interfaces/http/`（横切 HTTP）；连接改为显式 `createDatabasePool()` / `closeDatabasePool()` 惰性创建，由 `app.ts` 生命周期托管；schema 按限界上下文拆分（至少把未使用的表移出本服务），配合 drizzle 的 `mysqlSchema` 或按模块文件组织。

### P1-11 类型安全缺口

- `product-service.ts:17` 与 `customization-service.ts:37` 都有 `storeStatusMap.get(id) as ProductStoreStatusCode` —— `Map.get` 可能返回 `undefined`，被强转成状态码后静默传给前端。
- 三个 `toModel` 里大量 `row.status as XxxStatusCode`，把数据库任意数字当成合法枚举。
- `Number(request.headers['x-store-id'])` 在头缺失时得到 `NaN` 且类型上不报错。
- **空值约定不统一**：`store-repository.ts:12` 返回 `null`，`customization-repository.ts:91` 返回 `undefined`。
- `customization-controller.ts:71` 有 `parsed.data.status as CustomizationOptionStoreStatusCode` 的二次强转。

**建议**：用 zod 在边界（HTTP 入口、DB 出口）做解析，领域内部不再出现 `as`；统一"查不到返回 `null`"约定；开启 `noUncheckedIndexedAccess`。

### P2-12 零测试、无静态检查、无 CI 门禁

`package.json:11` 有 `test: vitest`、`typecheck: tsc --noEmit`，但仓库里没有任何 `*.test.ts`，`tsconfig.json:21` 还把 `test` 目录排除在编译之外。没有 ESLint / Prettier 配置，也没有 CI 流水线。这意味着上面所有"分层规则""禁止跨模块引用"的约定都无法被机器校验，会随时间腐化。

**建议**：先补三类高性价比测试——契约测试（路由存在性，防 P0-1 复发）、鉴权测试（防 P0-2 复发）、服务层单测（仓储用接口 mock）；再加 ESLint（含 import 边界规则）+ Prettier + CI 上跑 `typecheck / lint / test / build`。

### P2-13 可观测性薄弱

`Fastify({ logger: false })`（`app.ts:22`）关掉了内置 pino，改用自研的 console 包装（`shared/utils/logger.ts`）。结果是：没有请求日志、没有 requestId / traceId、无法串联一次请求内的多条日志、生产环境无法接日志采集。日志级别切换靠环境变量但 `detail` 模式下直接 `console.log` 打对象，结构化程度为零。

**建议**：启用 Fastify 内置 pino（`logger: { redact: ['req.headers.authorization'] }`），自研 logger 退居为领域层日志门面或直接移除；加 requestId（` @fastify/request-context` 或 pino 的 `genReqId`）；`/health` 增加依赖探活（DB、Redis、订单微服务）。

### P2-14 文档与实现漂移

`README.md` 与代码有多处不一致，会持续误导新人：

| README 说法 | 实际情况 |
| --- | --- |
| "DDD 四层架构（domain / application / infrastructure / interfaces）" | 实际是 controller/service/repository/model/mapper 的技术分层 |
| "门店信息查询"（隐含无需 id） | 后端 `/stores/:id` 强制要 id，前端未传 |
| "数据库需先执行 `apps/api/drizzle/` 下的迁移 SQL" | 该目录不存在，且已被 `.gitignore` 忽略 |
| 必需环境变量含 `DB_PASSWORD`、`REDIS_PASSWORD` | `config.ts:125-147` 实际未校验这两项 |
| 未提及 `ORDER_SERVICE_BASE_URL` | `config.ts:138` 实际是启动必需项 |
| `pnpm -r run build` | 根 `package.json` 没有 `build` 脚本 |
| "Redis（ioredis，分布式锁）" | Redis 连接建立后从未使用 |

### P2-15 无 API 版本策略与契约文档

路由无版本前缀，`@fastify/swagger` / `@fastify/swagger-ui` 已安装却未启用，前后端只能靠口头对账——这正是 P0-1 发生的根因。建议启用 Swagger（复用 P1-5 的 zod schema 自动生成），并把 OpenAPI 产物作为前后端联调的唯一依据。

### P2-16 版本控制卫生

- `apps/api/drizzle/` 被 `.gitignore` 忽略：**数据库迁移不入库**，schema 变更没有可追溯、可回滚的历史，各环境靠人工保证一致。建议把迁移 SQL 纳入版本控制，改为"生成即提交"。
- `apps/api/tsconfig.node.tsbuildinfo`（37KB 构建产物）被提交进仓库。建议加入 `.gitignore`。

---

## 三、目标架构

### 3.1 目标目录结构

```
apps/api/src/
├── main.ts                        # 仅做启动：listen、信号处理、MQ 生命周期
├── app.ts                         # 构建 Fastify 实例 + 注册模块列表
├── config/
│   ├── index.ts                   # 配置加载（惰性、可注入、不 process.exit）
│   └── schema.ts                  # 配置项的 zod 校验
│
├── modules/                       # 业务领域：一切按领域聚合
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── token.service.ts
│   ├── store/
│   │   ├── store.module.ts
│   │   ├── store.controller.ts
│   │   ├── store.service.ts
│   │   ├── store.repository.ts    # 接口（port）
│   │   ├── store.model.ts
│   │   ├── store.presenter.ts     # 原 mapper
│   │   └── store.error.ts
│   ├── product/                   # 同构：controller / service / repository / model / presenter / error
│   ├── customization/             # 同构
│   └── order/                     # 外部微服务代理：controller / service / gateway / error
│
├── infrastructure/                # 纯技术能力，不依赖任何业务
│   ├── database/
│   │   ├── pool.ts                # createPool / closePool，惰性
│   │   └── schema/                # 按限界上下文拆分的表定义
│   ├── cache/redis.ts
│   ├── security/password.ts
│   ├── mq/
│   └── external/order-service.client.ts
│
├── interfaces/http/               # 横切 HTTP 关注点
│   ├── error-handler.ts
│   ├── response.ts                # success / toApiResponse 唯一入口
│   ├── auth-guard.ts              # 显式鉴权钩子
│   └── store-context.ts           # 门店身份注入（覆盖式，不接受客户端自报）
│
└── shared/                        # 仅放无争议的通用工具（logger、时间、断言）
```

每个模块内部若文件超过 6~8 个，再按 `domain / application / infrastructure / interfaces` 细分，避免重新退化成扁平文件堆。

### 3.2 依赖方向

```
interfaces/http  →  modules/<domain>  →  domain model
                          ↓
                    infrastructure（实现模块定义的 port）
                          ↓
                      MySQL / Redis / MQ / 外部 HTTP
```

规则：箭头只能从左指向右；`modules/A` 不得 import `modules/B` 的内部文件，跨模块协作走 B 暴露的 port 或领域事件。

### 3.3 分层职责表

| 层 | 允许依赖 | 禁止 |
| --- | --- | --- |
| `interfaces/http` | fastify、zod、modules | 直接写 SQL |
| `modules/*/controller` | 本模块 service、presenter | 业务逻辑、手写参数校验 |
| `modules/*/service` | 本模块 repository 接口、domain | fastify 类型、HTTP 状态码、mapper |
| `modules/*/repository` | drizzle、schema | 业务逻辑 |
| `modules/*/model` | constraints 枚举 | 框架、基础设施 |
| `infrastructure` | 驱动、配置 | 任何 `modules/*` |

### 3.4 统一路由与鉴权

```ts
export const storeModule: AppModule = {
  name: 'store',
  prefix: '/api/v1/store',
  routes: [
    { method: 'POST', path: '/login', public: true, schema: { body: loginRequestSchema }, handler: ... },
    { method: 'GET', path: '/', auth: true, handler: ... },
    { method: 'PATCH', path: '/status', auth: true, schema: { body: updateStoreStatusRequestSchema }, handler: ... },
  ],
}
```

路由声明自带三要素：版本前缀、鉴权标记、校验 schema。`app.ts` 只做 `for (const m of modules) app.register(m)`。鉴权默认开启，仅 `public: true` 的路由放行；门店身份**只能**来自令牌解析结果，并强制覆盖同名请求头。

### 3.5 统一校验

所有入参校验收敛到路由 schema（复用 `@dextea/constraints` 的 zod schema + `fastify-type-provider-zod`），controller 内不再出现 `safeParse` 和手写 if；`response` schema 一并声明，顺带产出 OpenAPI。

### 3.6 统一响应与错误

```ts
interface ApiEnvelope<T> { code: number; message: string; data: T }
```

- `code` 是业务码（成功 `0`），与 HTTP 状态正交；
- 领域错误只声明业务码，HTTP 状态由 `interfaces/http/error-handler.ts` 的映射表决定，并显式 `reply.code(status)`；
- `success()` 与 `toApiResponse()` 是唯一的序列化入口，禁止在 controller / handler 里手写对象字面量（当前 `product-controller.ts:45,48`、`order-controller.ts:14` 都在手写）。

---

## 四、落地路线

| 阶段 | 内容 | 验收标准 |
| --- | --- | --- |
| 第 0 阶段（先止血，1~2 天） | ① 后端加 `/api/v1` 前缀并对齐前端 10 条路径与方法；② 门店身份改为强制覆盖 + 删除 `storeId` query 入参；③ 错误处理器补 `reply.code(status)` | 前端登录→查询→改状态全链路跑通；未登录访问受保护路由返回 401；Token 过期能触发前端登出 |
| 第 1 阶段（校验与契约） | 路由 schema 全量接入 zod；视图类型下沉 `packages/constraints`；启用 Swagger；补契约测试 | controller 内零手写校验；`pnpm --filter api test` 覆盖全部路由 |
| 第 2 阶段（目录迁移） | 按 3.1 建 `modules/` 与 `infrastructure/`，逐领域迁移（store → product → customization → order → auth） | 每迁移一个领域跑一次 `typecheck` + `test`；`app.ts` 只剩模块注册 |
| 第 3 阶段（分层治理） | 仓储接口化、服务层剥离 mapper 与 fastify 类型、错误码去 HTTP 化、清理死代码与未使用依赖 | ESLint import 边界规则开启且零报错；依赖数下降 6 个 |
| 第 4 阶段（工程保障） | ESLint + Prettier + CI 门禁；pino 接入；迁移 SQL 入库；README 同步 | CI 上 `lint / typecheck / test / build` 全绿 |

每个阶段单独 commit，便于回滚；第 0 阶段必须与第 2 阶段解耦——**先修对错，再修好看**。

---

## 五、预期收益与风险

**收益**

- 修复后店铺端才真正可用（当前契约断裂是不可用的，不是"不够优雅"）；
- 堵住越权漏洞，门店数据不再可被任意身份读写；
- 新增业务的改动面从 6 个目录降到 1 个目录 + 0 行 `app.ts`；
- 入参校验集中后，500 类崩溃与手写校验的重复代码同时消失；
- 分层规则由 ESLint 强制执行，架构不再靠自觉。

**风险**

| 风险 | 应对 |
| --- | --- |
| 路由前缀变更影响联调中的前端 | 第 0 阶段一次性改完，配契约测试锁死；如需平滑过渡可临时双前缀注册，稳定后移除 |
| 目录迁移易漏改 import | 逐领域迁移、每步 `typecheck`；依赖 `@/` 别名 + `tsc-alias`，不做一次性大改 |
| 仓储接口化增加样板代码 | 仅对需要单测的模块接口化，其余保持具体类 |
| 迁移中遗漏行为变更 | 先补契约测试再动结构，用测试守护"对外行为不变"这一前提 |

---

## 六、问题速查表

| 编号 | 问题 | 严重度 | 关键位置 |
| --- | --- | --- | --- |
| 1 | 前后端路径/方法全部对不上 | P0 | `app.ts:48-51` vs `web/src/lib/api/*` |
| 2 | 无鉴权 + `X-Store-Id` 可伪造 + `?storeId=` 越权 | P0 | `store-id-interceptor.ts:9-11`、`customization-controller.ts:36` |
| 3 | HTTP 状态恒为 200，前端 401 处理失效 | P0 | `error-handler.ts:17-22`、`web/src/lib/api/request.ts:58` |
| 4 | 按技术分层，业务内聚度为零 | P1 | `src/` 六个平级目录 |
| 5 | 校验三种写法并存，共享 schema 未接线 | P1 | `store-controller.ts:5`、`product-controller.ts:40-49` |
| 6 | `FastifyRequest` / mapper 渗透进服务层 | P1 | `order-service.ts:1`、`product-service.ts:1` |
| 7 | 手工装配，无模块边界约束 | P1 | `app.ts:29-51` |
| 8 | 先查后改无事务、逻辑重复 | P1 | `store-service.ts:21-59` |
| 9 | 死代码 + 6 个未使用依赖 + `config` 双份 | P1 | 见 2.9 清单 |
| 10 | `shared` 混杂、import 副作用、29 张表全库 schema | P1 | `shared/database/index.ts:7-18` |
| 11 | `as` 强转与空值约定不统一 | P1 | `product-service.ts:17`、`customization-repository.ts:91` |
| 12 | 零测试、无 lint、无 CI | P2 | 仓库检索为空 |
| 13 | 自研 console logger，无 requestId | P2 | `app.ts:22`、`shared/utils/logger.ts` |
| 14 | README 与实现 7 处漂移 | P2 | 见 2.14 表格 |
| 15 | 无版本策略、无 API 文档 | P2 | `package.json:26-27` 未启用 |
| 16 | 迁移 SQL 不入库、构建产物入库 | P2 | `.gitignore`、`tsconfig.node.tsbuildinfo` |
