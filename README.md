# dextea-store

**DexTea（德贤茶）店铺端** —— 面向门店的登录与运营服务，采用前后端分离的 pnpm monorepo。

## 项目介绍

店铺端为各门店提供日常运营能力：

- **门店登录**：JWT 认证登录（argon2 密码哈希）
- **门店信息**：查询当前门店信息、更新营业状态、重置密码
- **商品与客制化**：查询在售商品、切换/批量设置商品门店可售状态、维护客制化选项门店状态
- **订单制作**：订单看板与订单详情（转发至订单微服务）

## 技术栈

| 端 | 技术栈 |
| --- | --- |
| `apps/api` | Node.js + **Fastify 5** + TypeScript（ESM）+ **Zod 路由校验**（`fastify-type-provider-zod`）、**Drizzle ORM**（MySQL）、argon2、JWT、**pino** 结构化日志、`@fastify/swagger`（OpenAPI）；按业务领域分模块（modules / infrastructure / interfaces / shared） |
| `apps/web` | **React 19** + **Vite** + TypeScript + **Tailwind CSS v4** + shadcn/ui（@base-ui/react）+ react-router-dom 7 |
| `packages/constraints` | 共享约束包 `@dextea/constraints`：跨端复用的 zod 请求 schema、响应视图 schema、枚举、API 路由常量、统一响应包络类型 |

**前后端契约单一来源**：所有请求/响应结构与路由路径都定义在 `packages/constraints`，后端用它做运行时校验与 OpenAPI 生成，前端用它做类型与路径引用。修改接口只需改一处。

## 目录结构

```
dextea-store/
├── apps/
│   ├── api/                          # 后端 API 服务（Fastify）
│   │   ├── .env.example              # 环境变量模板
│   │   ├── drizzle/                  # 迁移 SQL（受版本控制）
│   │   ├── src/
│   │   │   ├── main.ts               # 启动入口：listen、信号处理、MQ 与连接池生命周期
│   │   │   ├── app.ts                # 组合根：装配依赖并注册业务模块
│   │   │   ├── config/               # 配置加载与 zod 校验（惰性、可注入）
│   │   │   ├── modules/              # 业务领域（每个领域自成一格）
│   │   │   │   ├── auth/             # 登录与令牌签发/校验
│   │   │   │   ├── store/            # 门店档案与状态、密码
│   │   │   │   ├── product/          # 商品与门店可售状态
│   │   │   │   ├── customization/    # 客制化项与选项的门店状态
│   │   │   │   └── order/            # 订单微服务网关（外部服务代理）
│   │   │   ├── infrastructure/       # 纯技术能力：database / mq / security / external
│   │   │   ├── interfaces/http/      # 横切 HTTP：鉴权守卫、错误处理、响应包络、插件
│   │   │   └── shared/               # 通用内核：错误体系、日志、状态映射工具
│   └── web/                          # 前端 SPA（React + Vite）
│       └── src/
│           ├── main.tsx              # 挂载入口（仅 RouterProvider）
│           ├── router/               # 路由真相源：paths 常量、路由表、守卫
│           ├── app/                  # 应用级 Provider 组合点（主题、门店、Toaster）
│           ├── shared/               # 与业务无关的通用能力
│           │   ├── api/              # http 客户端、错误文案解析、401 事件总线
│           │   ├── hooks/            # useAsyncData / useMutation / useNow
│           │   ├── lib/              # cn、日期、日志
│           │   └── ui/               # shadcn 生成物（由 CLI 维护）
│           ├── features/             # 按领域聚合，对齐后端 modules/
│           │   ├── auth/             # 登录、会话存储
│           │   ├── store/            # 门店档案（应用级共享）
│           │   ├── product/          # 商品与客制化
│           │   ├── order/            # 订单看板与详情
│           │   └── store-settings/   # 营业状态、重置密码
│           ├── layouts/              # admin 布局等页面外壳
│           └── pages/                # 只做装配，不含业务逻辑
└── packages/
    └── constraints/                  # 共享契约包 @dextea/constraints
```

### 分层与依赖方向

```
interfaces/http  ──▶  modules/<领域>  ──▶  domain model
                            │
                            ▼
                      infrastructure（实现领域定义的端口）
```

- `modules/<领域>` 内聚该领域的 controller / service / repository / model / presenter / error；
- 仓储以接口（port）+ Drizzle 实现（adapter）形式提供，便于单测替换；
- 领域层不依赖 Fastify 与 HTTP 状态码（由 `interfaces/http` 映射），ESLint 对此做了约束；
- `infrastructure/database/schema/external-tables.ts` 是与 `dextea-admin` 共享库的表目录，本服务不读写这些表。

## 本地开发

要求：Node.js ≥ 18、pnpm（项目固定 `pnpm@11.17.0`）。

```bash
pnpm install
pnpm -C packages/constraints build   # 首次运行或改动契约包后需要执行
pnpm dev                             # 并行启动 api 与 web
```

- API 服务：默认端口 `8296`，监听 `0.0.0.0`（可用 `HOST` 覆盖）
- Web 前端：默认 API 地址 `http://localhost:8296`（可用 `VITE_API_BASE_URL` 覆盖）

首次运行前配置环境变量：

```bash
cp apps/api/.env.example apps/api/.env
```

### 环境变量

启动时会用 Zod 强校验配置，缺失或非法即拒绝启动（不再静默降级）。

| 变量 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `NODE_ENV` | 否 | `development` | `development` / `test` / `production` |
| `PORT` | 否 | `8296` | 服务端口 |
| `HOST` | 否 | `0.0.0.0` | 监听地址 |
| `CORS_ORIGIN` | 否 | `http://localhost:8195` | CORS 允许的来源 |
| `CORS_CREDENTIALS` | 否 | `true` | 是否允许携带凭证 |
| `LOG_LEVEL` | 否 | `info` | `trace`/`debug`/`info`/`warn`/`error`/`fatal`/`silent` |
| `DB_HOST` `DB_PORT` `DB_USER` `DB_NAME` | **是** | — | MySQL 连接信息 |
| `DB_PASSWORD` | 否 | — | 数据库密码 |
| `JWT_SECRET` | **是** | — | 生产环境至少 16 位 |
| `JWT_EXPIRES_IN` | 否 | `7d` | 令牌有效期 |
| `ORDER_SERVICE_BASE_URL` | **是** | — | 订单微服务地址，如 `http://localhost:8300` |
| `ORDER_MAKING_MQ_*` | 否 | — | 制单 MQ，默认关闭 |

> 说明：旧版本中的 `REDIS_*` 与 `NACOS_*` 配置已移除——对应的客户端在本服务中从未被使用，却强制要求配置并占用连接。

## 接口约定

所有响应统一使用包络 `{ code, message, data }`：

- `code` 是**业务码**（字符串），成功为 `"OK"`，失败为具体错误码（如 `STORE_NOT_FOUND`、`VALIDATION_FAILED`）；
- HTTP 状态码与业务码正交：错误响应会同时设置正确的 HTTP 状态（401 / 403 / 404 / 400 / 502 / 500）；
- 成功示例：`{ "code": "OK", "message": "success", "data": { ... } }`。

门店身份**只来自 JWT**：未登录访问受保护路由返回 401；客户端自带的 `X-Store-Id` 请求头会在鉴权阶段被丢弃，无法越权访问其他门店数据。

非生产环境下提供 OpenAPI 文档：`http://localhost:8296/docs`，健康检查：`GET /health`。

### 主要路由

| 方法 | 路径 | 鉴权 | 说明 |
| --- | --- | --- | --- |
| `POST` | `/api/v1/auth/login` | 否 | 门店登录 |
| `GET` | `/api/v1/store/` | 是 | 当前门店信息 |
| `PUT` | `/api/v1/store/status` | 是 | 更新营业状态 |
| `PUT` | `/api/v1/store/password` | 是 | 重置密码 |
| `GET` | `/api/v1/products/` | 是 | 在售商品列表 |
| `PATCH` | `/api/v1/products/:productId/store-status` | 是 | 切换单个商品可售状态 |
| `POST` | `/api/v1/products/batch/store-status` | 是 | 批量设置可售状态 |
| `GET` | `/api/v1/products/:productId/customizations` | 是 | 商品客制化项 |
| `PATCH` | `/api/v1/products/customizations/options/:optionId/store-status` | 是 | 更新客制化选项门店状态 |
| `GET` | `/api/v1/store/orders/window` | 是 | 订单看板 |
| `GET` | `/api/v1/store/orders/:orderId` | 是 | 订单详情 |
| `POST` | `/api/v1/store/orders/:orderId/ready` | 是 | 标记制作完成 |
| `POST` | `/api/v1/store/orders/:orderId/collect` | 是 | 标记已取餐 |

路径常量统一由 `packages/constraints` 的 `apiRoutes` 导出，前端直接使用，避免手写字符串导致契约漂移。

## 质量保障

```bash
pnpm --filter api run typecheck   # tsc --noEmit（含 strict 与 noUncheckedIndexedAccess）
pnpm --filter api run lint        # ESLint（含分层依赖约束）
pnpm --filter web run lint        # 前端静态检查
```

前端调用的路径常量统一由 `packages/constraints` 的 `apiRoutes` 导出，前后端共用以避免契约漂移。

## 构建

```bash
pnpm build        # 等价于 pnpm -r run build，按依赖拓扑顺序构建
```

构建产物：

- `apps/api/dist/` —— 后端编译产物（`node dist/main.js` 启动）
- `apps/web/dist/` —— 前端静态资源
- `packages/constraints/dist/` —— 契约包编译产物（依赖它的包需先构建）

## 部署

### 1. 后端 API（`apps/api`）

```bash
pnpm --filter api build
node apps/api/dist/main.js
```

- 生产配置通过环境变量注入，务必设置 `NODE_ENV=production` 与足够强度的 `JWT_SECRET`；
- 生产环境下不挂载 Swagger 文档；
- 建议以 systemd / PM2 / 容器方式常驻运行，示例（systemd）：

```ini
[Unit]
Description=dextea-store-api
After=network.target

[Service]
WorkingDirectory=/opt/dextea-store/apps/api
EnvironmentFile=/opt/dextea-store/apps/api/.env
ExecStart=/usr/bin/node dist/main.js
Restart=always

[Install]
WantedBy=multi-user.target
```

### 2. 前端 SPA（`apps/web`）

```bash
pnpm --filter web build
```

- 将 `apps/web/dist/` 部署到任意静态托管（nginx / CDN / OSS）；
- 构建时设置 `VITE_API_BASE_URL` 指向生产 API，或用 nginx 同源反代：

```nginx
server {
    listen 80;
    server_name store.example.com;

    root /opt/dextea-store/apps/web/dist;
    index index.html;
    try_files $uri $uri/ /index.html;   # SPA 路由回退

    location /api/ {
        proxy_pass http://127.0.0.1:8296;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 3. 注意事项

- 构建顺序：`packages/constraints` 需先于 `apps/api`、`apps/web` 构建。
- 前端为 SPA，nginx 需配置 `try_files ... /index.html` 回退。
- 与 `dextea-admin` 共享同一套 MySQL 数据（门店、商品、订单等表）。
- **数据库迁移**：`apps/api/drizzle/` 已纳入版本控制。当前仓库尚无迁移文件——共享库的表结构由 `dextea-admin` 维护，切勿在本服务执行 `db:generate` 生成初始化迁移，否则会产出覆盖全库的建表语句。本服务仅维护自身所需的表结构定义。
