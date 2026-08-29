# shared/ui

本目录由 [shadcn](https://ui.shadcn.com) CLI 生成，属于生成物。

- 手工修改前请先确认不会被 `shadcn add` 覆盖；确需调整时优先在业务组件里包一层，而不是改这里。
- 新增组件请用仓库根目录的 `pnpm --filter web dlx shadcn@latest add <name>`，`components.json` 的 `aliases.ui` 已指向本目录。
- ESLint 对本目录放宽了 `react-refresh/only-export-components`，避免为了 lint 而拆分生成物。
