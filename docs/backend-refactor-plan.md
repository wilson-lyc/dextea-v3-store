# 后端代码目录结构重构方案

> **⚠️ 本文档已被 [`backend-improvement-proposals.md`](./backend-improvement-proposals.md) 取代，且其中的方案已实施完成。**
>
> 该文档只覆盖"目录结构迁移"这一项，未涉及接口契约断裂、鉴权缺失、错误处理语义错配等更严重的问题；目标结构也已按新文档落地为
> `config/`、`modules/`、`infrastructure/`、`interfaces/http/`、`shared/` 五层。
> **请以 `backend-improvement-proposals.md` 为准，本文仅作历史存档。**

> 适用范围：`apps/api/src`
> 目标：在不改变对外接口行为（API 路由、配置项、数据库表结构）的前提下，将现有“按技术类型分层”的扁平目录，重构为“按业务领域（DDD 风格的 module/feature 结构）”，提升可维护性、可扩展性与可读性。

---

## 一、现状分析

### 1.1 当前目录结构

```
src/
├── index.ts                      # 应用入口：装配插件、路由、MQ、优雅关闭
├── config.ts                     # 全局配置加载与校验
├── controller/                   # 控制器（按业务分文件）
│   ├── store-controller.ts
│   ├── product-controller.ts
│   ├── customization-controller.ts
│   └── order-controller.ts
├── service/                      # 业务服务（按业务分文件）
│   ├── auth-service.ts
│   ├── store-service.ts
│   ├── product-service.ts
│   ├── customization-service.ts
│   └── order-service.ts
├── repository/                   # 数据访问（按业务分文件）
│   ├── store-repository.ts
│   ├── product-repository.ts
│   └── customization-repository.ts
├── model/                        # 领域模型（按业务分文件）
│   ├── store.ts
│   ├── product.ts
│   └── customization.ts
├── mapper/                       # 模型 <-> 视图转换（按业务分文件）
│   ├── store-mapper.ts
│   ├── product-mapper.ts
│   └── customization-mapper.ts
├── error/                        # 各业务错误码（按业务分文件）
│   ├── store-error.ts
│   ├── product-error.ts
│   ├── customization-error.ts
│   └── order-error.ts
└── shared/                       # 跨领域基础设施
    ├── index.ts
    ├── database/                 # db 连接 + drizzle schema
    ├── errors/                   # BizError、错误码基类
    ├── interfaces/               # 错误处理、store-id 拦截器
    ├── mq/                       # RocketMQ 客户端与订单消息
    ├── nacos/                    # Nacos 配置中心客户端
    ├── redis/                    # Redis 连接
    ├── security/                 # 密码哈希
    ├── types/                    # 统一 API 响应封装
    └── utils/                    # 日志等工具
```

### 1.2 主要问题

1. **横向分层 + 业务维度交叉，文件散落**：同一个业务（如 store）的代码被拆到 `controller/`、`service/`、`repository/`、`model/`、`mapper/`、`error/` 六个目录，新增一个业务领域需要同时改动 6 个目录，跨文件追踪成本高。
2. **`shared` 边界模糊**：`shared/index.ts` 既导出 `config`、又导出 `nacos`、`mq`、`errors`，缺乏分层；`shared` 与顶层 `error/`、`config.ts` 之间存在职责重叠（全局 `BizError` 在 `shared`，业务错误码在顶层 `error/`）。
3. **入口装配臃肿**：`index.ts` 直接 `import` 大量 controller 并逐条 `register`，每新增业务都要改入口，违反开闭原则。
4. **基础设施与业务耦合**：`auth-service` 放在 `service/` 顶层，但它同时又承担登录等“应用服务”角色；`order-service` 实则是调用外部微服务的代理，与本地 DB 驱动的 service 性质不同，却混在一起。
5. **缺少 `dto` / `router` 显式分层**：路由注册函数（`registerXxxRoutes`）与 controller 函数混在同一文件，schema 校验逻辑散布。

---

## 二、重构目标

1. **按业务领域聚合代码（feature / module 优先）**：每个领域的 controller、service、repository、model、mapper、error、schema 收敛到同一目录。
2. **清晰的基础设施层（infrastructure）**：数据库、MQ、Redis、Nacos、安全、错误、日志等全部归入 `infrastructure/`，与业务解耦。
3. **自动/集中式路由注册**：入口通过业务模块自描述的方式注册路由，减少 `index.ts` 的改动。
4. **保持渐进式迁移**：支持新旧结构并存过渡，不影响现有运行与测试。

---

## 三、目标目录结构

```
src/
├── main.ts                       # 原 index.ts 改名，仅做装配
├── app.ts                        # 新增：Fastify 实例构建（server factory），便于测试
├── config/
│   ├── index.ts                  # 配置加载与校验（原 config.ts 移入）
│   └── env.ts                    # 环境变量读取辅助
│
├── modules/                      # 业务领域模块（核心改动点）
│   ├── store/
│   │   ├── store.module.ts       # 模块装配：导出 registerStoreModule(fastify)
│   │   ├── store.controller.ts
│   │   ├── store.service.ts
│   │   ├── store.repository.ts
│   │   ├── store.model.ts
│   │   ├── store.mapper.ts
│   │   └── store.error.ts
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   └── auth.service.ts        # 原 auth-service.ts，登录等应用服务
│   ├── product/
│   │   ├── product.module.ts
│   │   ├── product.controller.ts
│   │   ├── product.service.ts
│   │   ├── product.repository.ts
│   │   ├── product.model.ts
│   │   ├── product.mapper.ts
│   │   └── product.error.ts
│   ├── customization/
│   │   ├── customization.module.ts
│   │   ├── customization.controller.ts
│   │   ├── customization.service.ts
│   │   ├── customization.repository.ts
│   │   ├── customization.model.ts
│   │   ├── customization.mapper.ts
│   │   └── customization.error.ts
│   └── order/
│       ├── order.module.ts
│       ├── order.controller.ts
│       ├── order.service.ts       # 外部微服务代理（性质标注清晰）
│       └── order.error.ts
│
├── infrastructure/               # 跨领域基础设施（原 shared/ 重组）
│   ├── database/
│   │   ├── index.ts               # db 连接
│   │   └── schema.ts              # drizzle schema
│   ├── errors/
│   │   ├── biz-error.ts
│   │   ├── biz-error-code.ts
│   │   └── index.ts
│   ├── http/
│   │   ├── error-handler.ts       # 原 interfaces/error-handler
│   │   ├── store-id.interceptor.ts
│   │   └── api-response.ts        # 原 shared/types/api-response
│   ├── mq/
│   │   ├── client.ts
│   │   ├── order-making.ts
│   │   ├── types.ts
│   │   └── index.ts
│   ├── nacos/
│   │   └── config-client.ts
│   ├── redis/
│   │   └── index.ts
│   ├── security/
│   │   └── password.ts
│   └── logging/
│       └── logger.ts
│
└── shared/
    └── index.ts                  # 仅做对上兼容的再导出（过渡期保留，最终废弃）
```

---

## 四、关键设计说明

### 4.1 模块自描述（Module 模式）

每个 `modules/<domain>/<domain>.module.ts` 聚合该领域的路由注册：

```ts
import type { FastifyInstance } from 'fastify'
import { registerStoreRoutes } from './store.controller.js'

export function registerStoreModule(fastify: FastifyInstance): void {
  fastify.register(registerStoreRoutes, { prefix: '/api/v1/store' })
}
```

入口 `main.ts` 变为：

```ts
import { registerStoreModule } from '@/modules/store/store.module.js'
import { registerProductModule } from '@/modules/product/product.module.js'
// ... 其他模块

await registerStoreModule(app)
await registerProductModule(app)
// 新增业务只需加一行
```

### 4.2 `shared` 与 `infrastructure` 的分层

- **`infrastructure/`**：纯技术能力，可被任何业务模块依赖，自身不依赖任何业务代码。
- **`shared/index.ts`**：过渡期保留，仅做再导出（如 `export * from '@/infrastructure/...'`），待所有引用迁移完后再删除，避免一次性大规模改 import。
- 原顶层 `error/` 中业务错误码下沉到各自 `modules/<domain>/<domain>.error.ts`；全局 `BizError` 体系归入 `infrastructure/errors/`。

### 4.3 业务错误码归位

- `store-error.ts` → `modules/store/store.error.ts`
- `product-error.ts` → `modules/product/product.error.ts`
- `customization-error.ts` → `modules/customization/customization.error.ts`
- `order-error.ts` → `modules/order/order.error.ts`
- 通用 `BizError` / `BizErrorCode` → `infrastructure/errors/`

### 4.4 `auth` 单独成模块

`auth-service` 当前与 `store` 强相关但职责是“登录鉴权”，单独拆为 `modules/auth`，与 `store` 解耦，更符合限界上下文。

### 4.5 `order` 模块的性质标注

`order-service` 是外部订单微服务的 HTTP 代理（非本地 DB），其 `repository/model/mapper` 不存在属正常现象，保持最小集合即可。

---

## 五、迁移步骤（建议渐进式）

1. **建立 `infrastructure/`**：将 `shared/` 下各子目录整体平移（database / errors / mq / nacos / redis / security / utils），仅改目录名 + 内部相对路径，逻辑不变。
2. **建立 `config/`**：`config.ts` 移入 `config/index.ts`，更新 `tsconfig` 路径别名与新引用。
3. **逐领域迁移模块**：每次迁移一个领域（store → product → customization → order → auth），将该领域的 controller/service/repository/model/mapper/error 移入 `modules/<domain>/`，并新建 `<domain>.module.ts`。
4. **更新 `main.ts`**：用模块注册替换原有的逐条 `import + register`。
5. **保留 `shared/index.ts` 过渡**：通过再导出兼容旧 import，待全量迁移后删除。
6. **校验**：`pnpm -C apps/api typecheck` + `pnpm -C apps/api build` 通过，跑通现有测试。

---

## 六、影响面与风险

| 项 | 说明 |
| --- | --- |
| 文件路径变更 | 所有源文件移动，需批量更新 import（可用 `tsc-alias` + 路径别名 `@/` 简化） |
| 运行行为 | 路由 prefix、请求/响应结构、DB/Redis/Nacos/MQ 行为均不变 |
| 测试 | `vitest` 用例无需改逻辑，仅需确保 import 路径正确 |
| 风险点 | 迁移过程中易漏改 import，建议每迁移一个模块即跑一次 typecheck |
| 回滚 | 每次仅迁移一个模块并 commit，便于逐步回滚 |

---

## 七、预期收益

- 新增业务只需在 `modules/` 下新建一个目录 + 在 `main.ts` 加一行，复杂度从 O(6) 降到 O(1)。
- 基础设施与业务解耦，单测可独立 mock `infrastructure`。
- 目录即文档，领域边界一目了然，降低新人上手成本。
