# dextea-store

**DexTea（德贤茶）店铺端** —— 面向门店的登录与运营服务，采用前后端分离的 pnpm monorepo。

## 项目介绍

店铺端为各门店提供日常运营能力：

- **门店登录**：JWT 认证登录（argon2 密码哈希）
- **门店信息**：门店信息查询、营业状态更新、密码重置
- **商品查看**：查询全局在售商品列表

## 技术栈

| 端 | 技术栈 |
| --- | --- |
| `apps/api` | Node.js + **Fastify 5** + TypeScript（ESM）+ Zod、**Drizzle ORM**（MySQL）、Redis（ioredis，分布式锁）、argon2、JWT；DDD 四层架构（domain / application / infrastructure / interfaces） |
| `apps/web` | **React 19** + **Vite** + TypeScript + **Tailwind CSS v4** + shadcn/ui（@base-ui/react）+ react-router-dom 7 |
| `packages/constraints` | 共享约束包 `@dextea/constraints`：跨端复用的 zod 请求/响应 schema 与枚举 |

## 目录结构

```
dextea-store/
├── apps/
│   ├── api/                  # 后端 API 服务（Fastify，DDD 分层）
│   │   ├── .env.example      # 环境变量模板
│   │   ├── drizzle/          # 迁移 SQL（含初始迁移）+ schema.ts
│   │   ├── drizzle.config.ts
│   │   └── src/
│   │       ├── index.ts / composition-root.ts
│   │       ├── auth/         # 认证基础设施
│   │       ├── product/      # 商品模块（domain/application/infrastructure/interfaces）
│   │       ├── store/        # 门店模块（同上分层）
│   │       └── shared/       # config、错误处理、Redis 锁、JWT、日志
│   └── web/                  # 前端 SPA（React + Vite）
│       └── src/
│           ├── App.tsx       # 路由
│           ├── components/   # admin-layout、route-guard、theme-provider、ui（shadcn）
│           ├── lib/          # api、session、toast、logger
│           └── pages/        # home、login、admin/products、admin/settings
└── packages/
    └── constraints/          # 共享约束包 @dextea/constraints（zod schema + 枚举）
```

## 本地开发

要求：Node.js ≥ 18、pnpm（项目固定 `pnpm@11.17.0`）。

```bash
pnpm install
pnpm dev          # 并行启动 api 与 web
```

- API 服务：默认端口 `8296`，监听 `0.0.0.0`
- Web 前端：默认 API 地址 `http://localhost:8296`（可用 `VITE_API_BASE_URL` 覆盖）

首次运行前配置环境变量：

```bash
cp apps/api/.env.example apps/api/.env
```

API 启动时会强校验以下必需变量（缺失即拒绝启动）：`DB_HOST`、`DB_PORT`、`DB_NAME`、`DB_USER`、`DB_PASSWORD`、`REDIS_HOST`、`REDIS_PORT`、`REDIS_PASSWORD`、`JWT_SECRET`。数据库需先执行 `apps/api/drizzle/` 下的迁移 SQL。

## 构建

```bash
pnpm -r run build     # 递归构建 packages/constraints、apps/api、apps/web
```

构建产物：

- `apps/api/dist/` —— 后端编译产物（`node dist/index.js` 启动）
- `apps/web/dist/` —— 前端静态资源（`tsc -b && vite build`）
- `packages/constraints/dist/` —— 约束包编译产物（依赖它需先构建，或直接 `pnpm -C packages/constraints build`）

## 部署

### 1. 后端 API（`apps/api`）

```bash
pnpm --filter api build
node apps/api/dist/index.js
```

- 生产配置通过环境变量注入：`PORT`、`DB_*`（MySQL）、`REDIS_*`、`JWT_SECRET`（必须设置为强随机值）、`JWT_EXPIRES_IN`。
- 建议以 systemd / PM2 / 容器方式常驻运行，示例（systemd）：

```ini
[Unit]
Description=dextea-store-api
After=network.target

[Service]
WorkingDirectory=/opt/dextea-store/apps/api
EnvironmentFile=/opt/dextea-store/apps/api/.env
ExecStart=/usr/bin/node dist/index.js
Restart=always

[Install]
WantedBy=multi-user.target
```

### 2. 前端 SPA（`apps/web`）

```bash
pnpm --filter web build
```

- 将 `apps/web/dist/` 部署到任意静态托管（nginx / CDN / OSS）。
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
    }
}
```

### 3. 注意事项

- 构建顺序：`packages/constraints` 需先于 `apps/api`、`apps/web` 构建。
- 前端为 SPA，nginx 需配置 `try_files ... /index.html` 回退。
- 与 `dextea-admin` 共享同一套 MySQL/Redis 数据（门店、商品、订单等表）。
