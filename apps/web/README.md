# web（门店端前端）

React 19 + Vite + TypeScript + Tailwind CSS v4 + shadcn/ui（@base-ui/react）+ react-router-dom 7。

## 命令

```bash
pnpm --filter web dev        # 开发服务器（端口 8295）
pnpm --filter web build      # tsc -b && vite build
pnpm --filter web typecheck  # tsc --noEmit
pnpm --filter web lint       # ESLint（含分层依赖约束）
pnpm --filter web format     # prettier
```

`VITE_API_BASE_URL` 指定后端地址，默认 `http://localhost:8296`。

## 目录约定

```
src/
├── main.tsx        # 仅挂载 router
├── router/         # 路由真相源：paths 常量、路由表、守卫
├── app/            # 应用级横切 Provider 的组合点（主题、门店、Toaster）
├── shared/         # 与业务无关的通用能力
│   ├── api/        # http 客户端、ApiError、错误文案解析、401 事件总线
│   ├── hooks/      # useAsyncData / useMutation / useNow
│   ├── lib/        # cn、日期、日志
│   ├── components/ # 通用业务无关组件（如 ConfirmDialog）
│   └── ui/         # shadcn 生成物，只允许通过 CLI 修改
├── features/<领域>/ # 按后端 modules 对齐：api / model / hooks / components
├── layouts/        # 页面外壳（admin 布局等），通过 <Outlet /> 承接
└── pages/          # 只做装配，单文件目标 ≤ 120 行
```

命名：文件与目录一律 kebab-case；组件标识符 PascalCase；hook 标识符 `use` + PascalCase；只有 `pages/**/index.tsx` 使用 default 导出，其余一律命名导出。

## 分层规则

```
pages/  ──▶  features/<领域>  ──▶  shared/{api,hooks,lib}
   └────────▶  layouts/  ──▶  shared/ui
```

| 层 | 允许依赖 | 禁止依赖 |
| --- | --- | --- |
| `shared/**` | `shared/**`、第三方 | `features/**`、`pages/**`、`layouts/**`、`app/**` |
| `features/<A>/**` | `shared/**`、`features/<A>/**` | 其他 `features/<B>/**`、`pages/**`、`layouts/**` |
| `layouts/**` | `shared/**`、`router/paths` | `features/**`、`pages/**` |
| `pages/**` | 以上全部 | 被任何层反向依赖 |

规则由 `eslint.config.js` 的 `no-restricted-imports` 强制。跨领域依赖（如订单页要显示门店名）优先走 `app/store-provider.tsx` 这类应用级 Provider；确需直接调用的，在 `eslint.config.js` 的 `featureLayer(name, [允许领域])` 中显式加白名单并在评审里说明理由。

## 约定用法

- **取数**用 `useAsyncData`，不要手写 `useEffect + fetch`；提交用 `useMutation`，它会统一处理 `logger` 与错误 toast，不要手写 `catch { logger + toast }`。
- **错误文案**用 `resolveErrorMessage(err, fallback)`，业务码到文案的映射集中在 `shared/api/errors.ts`。
- **状态判断**一律走 `@dextea/constraints` 的枚举（`keyMap` / `getLabel` / `getColor`），禁止裸数字、禁止用 label 字符串做映射 key、禁止 `items[0]` 下标访问。契约包缺失的取值先补 `packages/constraints`，不允许前端单方面承认契约外的值。
- **路由路径**一律引用 `router/paths.ts`，不写字面量。

## 新增一个 feature 模块

1. 建 `src/features/<领域>/`，按需要放 `api.ts`（接口调用）、`model.ts`（纯函数：类型、映射、规则）、`hooks/`（状态与副作用）、`components/`（领域内复用 UI）。
2. `model.ts` 必须是纯函数，可零依赖单测。
3. 在 `pages/` 下建页面，只做三件事：调用 feature hooks、把数据传给 feature 组件、处理页面级布局。
4. 需要路由时，在 `router/paths.ts` 加常量，再在 `router/index.tsx` 加一条路由记录。

## 添加 shadcn 组件

```bash
pnpm --filter web dlx shadcn@latest add button
```

组件会落在 `src/shared/ui/`（由 `components.json` 的 `aliases.ui` 决定）。该目录是生成物，手工修改前请先确认不会被 `shadcn add` 覆盖。
