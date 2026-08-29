# 前端代码结构优化方案

> 适用范围：`apps/web/src`
> 目标：在不改变任何对外可见行为（路由路径、交互、视觉）的前提下，把"按技术类型分层 + 页面内堆逻辑"的现有结构，调整为"按领域聚合 + 页面只做装配"，消除重复样板与魔法数字，使新增业务模块的成本保持恒定。
> 配套已落地文档：[`backend-improvement-proposals.md`](./backend-improvement-proposals.md)

---

## 一、结论先行

### 1.1 现状定性

**不是"混乱"，而是"欠治理"**。现有代码的方向性判断大多是对的：

- 前后端契约走 `packages/constraints` 的 `apiRoutes`，没有手写 URL —— 正确；
- `pages/counter/data.ts` 做 `DTO → 视图模型` 映射，隔离了后端结构与 UI —— 正确；
- 401 统一在 `request.ts` 拦截、错误统一包络解析 —— 方向正确。

真正的问题在于：**这些正确的做法没有被制度化**，只有 1～2 处执行了，其余地方靠手抄。同时缺少"页面膨胀之后往哪拆"的既定路径。

### 1.2 规模基线

| 指标 | 当前值 |
| --- | --- |
| 源文件 | 37（24 `.tsx` + 12 `.ts` + 1 `.css`） |
| 代码行数 | 约 3220 |
| 页面数 | 6（home / login / admin·products / admin·settings / counter / placeholder） |
| 最大单文件 | `pages/admin/products/index.tsx` 513 行 |
| 最大单组件状态数 | `ProductsPage` 12 个 `useState` |

在这个量级下"能看懂"是理所当然的，但不能作为不治理的理由——**判断标准是：再加一个同规模模块（如"员工管理"）时，结构是变好还是变坏**。现状是变坏。

### 1.3 建议力度

**中等强度的定向重构，不推倒重来。** 预计 3 个阶段、每阶段可独立合并发版，累计改动约 40% 文件，但单阶段风险可控。详见 [第五章 迁移步骤](#五迁移步骤)。

---

## 二、现状结构

```
apps/web/src/
├── main.tsx                    # mount + ThemeProvider + Toaster
├── App.tsx                     # BrowserRouter + 手写 JSX 路由表
├── index.css
├── components/
│   ├── admin-layout.tsx        # 后台布局（属于 admin 领域，却放在全局）
│   ├── route-guard.tsx         # RequireAuth
│   ├── theme-provider.tsx      # 主题（230 行，含快捷键/跨标签同步）
│   └── ui/                     # shadcn 生成物（9 个）
├── lib/
│   ├── api/                    # request.ts / auth / store / product / orders
│   ├── logger.ts               # 日志
│   ├── session.ts              # sessionStorage 读写
│   ├── toast.ts                # 对 components/ui/toast 的门面（102 行）
│   ├── use-store.ts            # hook（文件名 camelCase）
│   └── utils.ts                # cn()
└── pages/
    ├── home/index.tsx                      104 行
    ├── login/index.tsx                      84 行
    ├── admin/products/index.tsx            513 行  ← 单文件承载全部逻辑
    ├── admin/settings/index.tsx            332 行
    ├── counter/
    │   ├── index.tsx                       190 行
    │   ├── data.ts                         108 行  ← 领域映射层，藏在 pages 里
    │   └── components/                     Order{ Card, Detail, StatusBadge }
    └── placeholder/index.tsx                17 行
```

---

## 三、问题清单（按严重度排序）

### P0 — 会持续产生 bug

#### 3.1 状态判断依赖魔法数字，与共享枚举脱钩

`@dextea/constraints` 已经导出了带 `keyMap` / `getLabel` / `getColor` 的完整枚举，但页面里仍在裸写数字：

```12:12:apps/web/src/pages/counter/index.tsx
const VISIBLE_MAKING_STATUS = [1, 2]
```

```46:54:apps/web/src/pages/counter/index.tsx
  const visibleOrders = useMemo(
    () =>
      allOrders.filter(
        (order) =>
          order.paymentStatus === 2 &&
          VISIBLE_MAKING_STATUS.includes(order.makingStatus)
      ),
    [allOrders]
  )
```

```85:107:apps/web/src/pages/counter/components/OrderDetail.tsx
        {order.paymentStatus === 2 && order.makingStatus === 0 && (
          <Button className="flex-1">
            <Loader2 />
            开始制作
          </Button>
        )}
```

`pages/counter/data.ts` 的 `mapDiningType` 里 `case 3`（外卖）在 `OrderDiningMethod` 枚举中**根本没有定义**（该枚举只有 `DINE_IN=1` / `TAKEOUT=2`）。也就是说前端已经在依赖一个契约包里不存在的取值，属于隐性契约漂移。

**同类问题**：`OrderStatusBadge` 用**中文标签字符串**做映射表的 key：

```1:10:apps/web/src/pages/counter/components/OrderStatusBadge.tsx
const statusStyles: Record<string, string> = {
  待制作: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  制作中: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  ...
}
```

枚举文案一改，这里静默降级为无样式，且 TypeScript 无法发现。

#### 3.2 枚举元数据用数组下标硬编码

```35:47:apps/web/src/pages/admin/settings/index.tsx
const statusLabelMap: Record<number, string> = {
  [StoreStatus.items[0].value]: StoreStatus.items[0].label,
  [StoreStatus.items[1].value]: StoreStatus.items[1].label,
  [StoreStatus.items[2].value]: StoreStatus.items[2].label,
  [StoreStatus.items[3].value]: StoreStatus.items[3].label,
}

const statusDescMap: Record<number, string> = {
  [StoreStatus.items[0].value]: "暂时关闭，不接新单",
  ...
}
```

`StoreStatus.items` 顺序一旦调整，标签与描述会错位；而 `StoreStatus.getLabel()` / `labelMap` 本就提供等价能力，属于重复造轮子。

#### 3.3 数据获取样板重复 4 份，且手写竞态控制

`useEffect` + `cancelled` 标志 + `try/catch` + `setLoading` 这套模式出现在 `counter/index.tsx`、`admin/products`、`admin/settings`、`lib/use-store.ts` 四处，每处细节都略有不同（有的用 `.then().catch().finally()`，有的用 `void (async () => {})()`）。

更麻烦的是弹窗场景的过期响应处理，需要手写 requestId：

```94:116:apps/web/src/pages/admin/products/index.tsx
  const customizeRequestId = useRef(0)

  async function openCustomize(product: ProductView): Promise<void> {
    const requestId = customizeRequestId.current + 1
    customizeRequestId.current = requestId
    ...
```

这段逻辑无法复用，下一个弹窗就再抄一遍——而且很容易抄漏。

#### 3.4 错误处理样板散落，文案与页面耦合

```77:80:apps/web/src/pages/admin/products/index.tsx
    } catch (err) {
      logger.error("获取商品列表失败", err)
      toast.error(err instanceof ApiError ? err.message : "获取商品列表失败")
    }
```

同一模式在代码库中出现 **8 次以上**，差异仅在中文字面量。错误文案无法统一维护，也无法按错误码做差异化处理（例如 `VALIDATION_FAILED` 不弹 toast 而是回填表单）。

#### 3.5 401 走 `window.location.replace`，绕过 React Router

```54:61:apps/web/src/lib/api/request.ts
  if (response.status === 401) {
    logger.warn(`[未授权] ${method} ${path}，清除登录状态并跳转登录页`)
    clearSession()
    if (window.location.pathname !== "/login") {
      window.location.replace("/login")
    }
    throw new ApiError(401, "登录已失效，请重新登录")
  }
```

`request.ts` 是纯网络层，却直接操作路由与全局跳转：整页刷新、丢失 SPA 状态、无法携带"从哪里被踢出"的上下文，也让这段逻辑无法单测。

---

### P1 — 影响可维护性

#### 3.6 页面组件承载全部职责

`ProductsPage` 一个组件里同时管理：列表数据、加载态、刷新态、筛选、批量模式、选中集合、批量目标状态、批量提交态、客制化弹窗目标、客制化列表、客制化加载态、单项切换中 ID —— **12 个 `useState`**：

```49:62:apps/web/src/pages/admin/products/index.tsx
  const [products, setProducts] = useState<ProductView[]>([])
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState<ProductView | null>(null)
  const [toggling, setToggling] = useState(false)
  const [filter, setFilter] = useState<StoreFilter>("ALL")
  const [refreshing, setRefreshing] = useState(false)
  const [batchMode, setBatchMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [batchTarget, setBatchTarget] = useState<ProductStoreStatusCode | null>(null)
  const [batchSubmitting, setBatchSubmitting] = useState(false)
  const [customizeTarget, setCustomizeTarget] = useState<ProductView | null>(null)
  const [customizationItems, setCustomizationItems] = useState<CustomizationItemView[]>([])
```

任何一处改动都要在 513 行里定位，且无法单独测试。

#### 3.7 `lib/` 职责混杂

`lib/` 里同时住了 5 类东西：网络客户端（`lib/api/`）、持久化（`session.ts`）、React hook（`use-store.ts`）、UI 工具（`utils.ts` 的 `cn`、`toast.ts` 的 UI 门面）、日志（`logger.ts`）。其中 `lib/toast.ts` 全文 102 行，本质上只是把 `components/ui/toast` 的 API 重新声明一遍类型再转发出去，多一层间接却没有带来任何收益。

#### 3.8 三种文件命名风格共存

| 风格 | 出现位置 |
| --- | --- |
| kebab-case | `components/admin-layout.tsx`、`route-guard.tsx`、`theme-provider.tsx` |
| camelCase | `lib/use-store.ts` |
| PascalCase | `pages/counter/components/OrderCard.tsx`、`OrderDetail.tsx`、`OrderStatusBadge.tsx` |

导出风格同样不一致：`admin-layout.tsx` 是命名导出 `{ AdminLayout }`，`pages/*` 全是 default 导出。

#### 3.9 路由路径三处硬编码，路由表非数据驱动

`/admin/settings` 同时写在 `App.tsx:19-23`、`components/admin-layout.tsx:14-23`、`pages/home/index.tsx:25` 三处。`App.tsx` 用 JSX 声明路由，无法静态导出、无法被 loader/guard 复用；`PlaceholderPage` 的标题通过 JSX props 传入（`<PlaceholderPage title="服务大屏" />`），页面配置与路由表分离。

#### 3.10 门店信息无共享，切换页面重复请求

`useStore()` 每次调用都独立发起 `GET /api/v1/store/`。Home → Counter → Home 一次往返就是三次相同请求，且三个组件各自持有 `store` 副本。

#### 3.11 生成物与手写代码未隔离

`components/ui/`（shadcn 生成物，应可随时被 CLI 覆写）与手写业务组件平级放在 `components/` 下，容易被误改；误改后下次 `shadcn add` 冲突。

#### 3.12 领域目录与后端不对应

后端是 `modules/{auth,store,product,customization,order}`，前端是 `pages/{home,login,admin/*,counter}` —— 按**页面**组织而非按**领域**组织。唯一的领域映射层 `pages/counter/data.ts` 只能委身在页面目录下。

---

## 四、目标结构

### 4.1 目录树

```
apps/web/src/
├── main.tsx                        # 仅 mount
├── router/
│   ├── index.tsx                   # createBrowserRouter（或路由配置数组）
│   ├── paths.ts                    # 路径常量单一来源
│   └── guards.tsx                  # requireAuth guard / loader
├── app/
│   ├── providers.tsx               # ThemeProvider + ToastProvider + StoreProvider 组合
│   ├── theme-provider.tsx          # 迁自 components/
│   └── store-provider.tsx          # 门店信息全局共享（新增，见 4.4.5）
├── shared/                         # 与业务无关的通用能力
│   ├── api/
│   │   ├── client.ts               # http + ApiError（不再感知路由）
│   │   ├── session-events.ts       # 401 事件总线（不再直接跳转）
│   │   └── errors.ts               # resolveErrorMessage(err, fallback)
│   ├── hooks/
│   │   ├── use-async-data.ts       # 统一请求状态机（替换 4 处手写样板）
│   │   ├── use-mutation.ts         # 统一提交态 + 错误 toast
│   │   └── use-now.ts              # 从 OrderCard 提取的计时 hook
│   ├── lib/
│   │   ├── cn.ts
│   │   └── datetime.ts             # formatDateTime / waitMinutes
│   └── ui/                         # shadcn 生成物（原 components/ui，原样迁移）
├── features/                       # 按领域聚合，对齐后端 modules/
│   ├── auth/
│   │   ├── api.ts
│   │   ├── session.ts              # sessionStorage 读写（原 lib/session.ts）
│   │   ├── use-login.ts
│   │   └── components/login-form.tsx
│   ├── store/
│   │   ├── api.ts                  # 原 lib/api/store.ts
│   │   ├── model.ts                # StoreView 类型再导出 + statusMeta
│   │   └── hooks/use-store.ts      # 原 lib/use-store.ts
│   ├── product/
│   │   ├── api.ts                  # 原 lib/api/product.ts
│   │   ├── model.ts                # 筛选、批量、状态字面量
│   │   ├── hooks/
│   │   │   ├── use-products.ts     # 列表 + 刷新 + 本地乐观更新
│   │   │   ├── use-product-status-mutation.ts
│   │   │   └── use-customizations.ts   # 含过期响应处理
│   │   └── components/
│   │       ├── product-card.tsx
│   │       ├── product-toolbar.tsx # 筛选 + 批量操作条
│   │       └── customize-dialog.tsx
│   ├── order/
│   │   ├── api.ts                  # 原 lib/api/orders.ts
│   │   ├── model.ts                # DTO→VM 映射（原 counter/data.ts）
│   │   │                           # + 可见性规则 + 状态机 + statusStyle
│   │   ├── hooks/
│   │   │   ├── use-order-window.ts
│   │   │   └── use-order-detail.ts
│   │   └── components/
│   │       ├── order-card.tsx
│   │       ├── order-detail.tsx
│   │       └── order-status-badge.tsx
│   └── store-settings/             # 营业状态 + 重置密码
│       ├── model.ts                # statusLabel/desc 元数据（元组化，见 4.4.4）
│       ├── hooks/
│       └── components/
├── layouts/
│   ├── admin-layout.tsx            # 迁自 components/
│   └── blank-layout.tsx
└── pages/                          # 只剩装配，单文件目标 ≤ 120 行
    ├── home/index.tsx
    ├── login/index.tsx
    ├── admin/products/index.tsx
    ├── admin/settings/index.tsx
    ├── counter/index.tsx
    └── placeholder/index.tsx
```

### 4.2 依赖方向

```
pages/      ──▶  features/<领域>   ──▶  shared/{api,hooks,lib}
   │                    │                      ▲
   │                    └──────────────────────┘
   └──────────▶  layouts/  ──▶  shared/ui
                    ▲
              features/<领域>/components  ──▶  shared/ui
```

规则（用 ESLint `no-restricted-imports` 强制，对齐后端的分层约束做法）：

| 层 | 允许依赖 | 禁止依赖 |
| --- | --- | --- |
| `shared/**` | `shared/**`、第三方 | `features/**`、`pages/**`、`layouts/**` |
| `features/<A>/**` | `shared/**`、`features/<A>/**` | 其他 `features/<B>/**`、`pages/**` |
| `layouts/**` | `shared/**`、`router/paths` | `features/**`（布局不感知业务） |
| `pages/**` | 以上全部 | 被任何层反向依赖 |

跨领域依赖（如订单页要显示门店名）通过 `app/store-provider.tsx` 这类**应用级 Provider** 下发，而不是 `order` 直接 import `store`。

### 4.3 各层职责

- **`router/`** —— 唯一的路由真相源。路径常量、路由表、守卫集中在此。
- **`app/`** —— 应用级横切 Provider 的组合点，不含业务逻辑。
- **`shared/`** —— 与业务无关的通用能力。`shared/ui` 是 shadcn 生成物，只允许通过 CLI 修改。
- **`features/<领域>/`** —— 一个领域自包含：`api.ts`（接口调用）、`model.ts`（类型、映射、规则、纯函数）、`hooks/`（状态与副作用）、`components/`（领域内复用 UI）。`model.ts` 必须是纯函数，可零依赖单测。
- **`layouts/`** —— 页面框架（导航、外壳），通过 `<Outlet />` 承接。
- **`pages/`** —— 只做三件事：调用 feature hooks、把数据传给 feature 组件、处理页面级布局。不写请求逻辑、不写业务判断。

---

## 五、关键设计决策

### 5.1 路由：从 JSX 声明改为数据驱动

```ts
// router/paths.ts
export const paths = {
  home: '/',
  login: '/login',
  admin: { root: '/admin', settings: '/admin/settings', products: '/admin/products' },
  counter: '/counter',
  screen: '/screen',
} as const
```

收益：路径不再散落三处；`admin-layout` 的 `navItems`、home 的 `sections`、`guards` 全部引用常量；后续可静态导出路由表做权限过滤、面包屑生成。

`PlaceholderPage` 的标题改为路由 `handle` 携带，回到"配置驱动"：

```ts
{ path: 'screen', element: <PlaceholderPage />, handle: { title: '服务大屏' } }
```

### 5.2 数据获取：统一两个 hook，消灭手写样板

自研零依赖方案（不引入 TanStack Query，理由见 [第八章](#八明确不做的事)）：

```ts
// shared/hooks/use-async-data.ts
interface AsyncData<T> {
  data: T | undefined
  loading: boolean
  error: unknown
  reload: () => void          // 替代各处手写的 handleRefresh
  setData: (updater: T | ((prev: T) => T)) => void   // 支持乐观更新
}
function useAsyncData<T>(fetcher: () => Promise<T>, options?: {
  immediate?: boolean
  deps?: unknown[]
  onError?: (err: unknown) => void
}): AsyncData<T>
```

内部统一处理：`cancelled` 标志（卸载/依赖变更）、过期响应丢弃（`deps` 变化时的 requestId）、错误捕获与 `logger`。

```ts
// shared/hooks/use-mutation.ts
function useMutation<A extends unknown[], R>(fn: (...args: A) => Promise<R>, options?: {
  successMessage?: string | ((result: R) => string)
  errorMessage?: string
}): { run: (...args: A) => Promise<R | undefined>; pending: boolean }
```

`useMutation` 内部统一 "`logger.error` + `toast.error` + 成功提示"，把 8 处重复样板收敛为 1 处。

改造后 `ProductsPage` 的 12 个 `useState` 收敛为：`useAsyncData`（含 `loading`）、`useMutation` × 3、`useState` × 3（筛选、批量模式、选中集合），且后三者可进一步下沉到 `use-product-batch` hook。

### 5.3 错误处理：集中文案与降级策略

```ts
// shared/api/errors.ts
export function resolveErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    if (err.status === 0) return '网络异常，请检查网络连接'
    if (err.code && ERROR_CODE_MESSAGES[err.code]) return ERROR_CODE_MESSAGES[err.code]
    return err.message || fallback
  }
  return fallback
}
```

所有 `catch` 只写 `onError: () => toast.error(resolveErrorMessage(err, '获取商品列表失败'))`，或直接交给 `useMutation`。后续要做"表单类错误不弹 toast"只需改一处。

### 5.4 401：改为事件驱动，由 router 响应

`shared/api/client.ts` 在 401 时只做两件事：`clearSession()` + `emit('auth:expired')`（一个极简的事件 emitter）。由 `app/providers.tsx` 订阅该事件并调用 `navigate('/login', { replace: true })`。

收益：网络层不再依赖路由与 `window`；不再整页刷新；可携带来源路径；`client.ts` 变成可单测的纯逻辑。

### 5.5 枚举与魔法数字：全部走 `@dextea/constraints`

硬性规则：

1. **禁止裸数字状态判断**，一律用 `Xxx.keyMap.YYY` 或 `Xxx.hasValue()`；
2. **禁止用 label 字符串做映射 key**，一律用 code（`number`）；
3. **禁止 `items[0]` 下标访问**，用 `keyMap` / `getLabel` / `getColor`；
4. 契约包缺失的取值（如 `diningMethod === 3` 外卖）**先补进 `packages/constraints` 的 `OrderDiningMethod`**，再在前端使用——不允许前端单方面承认契约外的值。

`OrderStatusBadge` 改为 code → Tailwind class 的映射（`Record<number, string>`），key 带类型约束，漏项即编译报错。

`settings` 的 `statusLabelMap`/`statusDescMap` 改用一个带类型的元组常量集中声明描述文案，label 仍取 `StoreStatus.getLabel()`：

```ts
const STORE_STATUS_META = [
  { code: StoreStatus.keyMap.CLOSED, description: '暂时关闭，不接新单' },
  { code: StoreStatus.keyMap.OPEN,   description: '门店正常营业，可接单' },
  { code: StoreStatus.keyMap.PENDING, description: '门店尚未开业' },
  { code: StoreStatus.keyMap.DEFUNCT, description: '门店已永久关闭' },
] as const satisfies ReadonlyArray<{ code: StoreStatusCode; description: string }>
```

订单可见性、状态机（下一步可执行什么动作）下沉到 `features/order/model.ts` 的纯函数：

```ts
export function isCounterVisible(order: Order): boolean
export function nextOrderAction(order: Order): { label: string; action: 'start' | 'ready' | 'collect' } | null
```

`OrderDetail` 里那 4 个 `paymentStatus === 2 && makingStatus === N` 分支随之消失。

### 5.6 门店信息：提升到应用级 Provider

`app/store-provider.tsx` 在 `RequireAuth` 之下挂载一次，`GET /api/v1/store/` 全局只发一次；`useStore()` 变为 `useContext` 读取。Home / Counter / Admin 三处共享同一份数据，切换页面零请求。

会话与门店状态合并管理，`features/auth/session.ts` 成为唯一读写 `sessionStorage` 的模块（便于后续换存储或加过期时间）。

### 5.7 命名规范（统一，写入 ESLint / 评审 checklist）

| 对象 | 规范 | 示例 |
| --- | --- | --- |
| 文件/目录名 | 一律 kebab-case | `order-status-badge.tsx`、`use-async-data.ts` |
| 组件（标识符） | PascalCase | `export function OrderStatusBadge` |
| hook（标识符） | `use` + PascalCase | `export function useOrderWindow` |
| React 组件默认导出 | 页面用 default，其余一律命名导出 | 见下 |
| `shared/ui/*` | 保持 shadcn 原样，不重命名 | `button.tsx` |

**导出风格统一**：只有 `pages/**/index.tsx` 使用 default 导出（便于路由懒加载），`features/`、`layouts/`、`shared/` 全部使用命名导出。消除现有 `AdminLayout`（命名）与 `HomePage`（默认）并存的割裂感。

### 5.8 生成物隔离

`components/ui/` → `shared/ui/`，并在 `shared/ui/README.md` 注明"本目录由 shadcn CLI 生成，手工修改前请先确认不会被 `shadcn add` 覆盖"。ESLint 对该目录放宽 `react-refresh/only-export-components` 等规则，避免为了 lint 而改动生成物。

### 5.9 删除 `lib/toast.ts`

`shared/ui/toast` 已提供完整 API（`promise` / `update` / `close`），现有 `lib/toast.ts` 的 102 行只是类型转发。迁移后各页面直接 `import { toast } from '@/shared/ui/toast'`，少一层间接、少一处需要同步维护的类型定义。

> 若后续需要"统一的错误 toast 降级文案"，那个能力放在 `shared/api/errors.ts`，而不是再包一层 toast 门面。

---

## 六、迁移步骤

每个阶段独立可合并、可发版，不引入长期分支。

### 阶段一：地基（低风险，纯移动 + 新增）

1. 新建 `shared/`，迁入 `lib/utils.ts` → `shared/lib/cn.ts`、`components/ui/*` → `shared/ui/*`、`lib/api/request.ts` → `shared/api/client.ts`。
2. 新建 `shared/api/errors.ts`、`shared/hooks/{use-async-data,use-mutation,use-now}.ts`。
3. 新建 `router/paths.ts`，替换 `App.tsx`、`admin-layout.tsx`、`home/index.tsx` 三处路径字面量。
4. 统一文件名命名：`lib/use-store.ts` → `features/store/hooks/use-store.ts`（顺带归位）；`pages/counter/components/Order*.tsx` → `kebab-case`。
5. 删除 `lib/toast.ts`，全局改为直接引用 `shared/ui/toast`。

**验收**：`pnpm --filter web run typecheck` 与 `lint` 通过；功能零变化（纯移动 + 别名替换）。

### 阶段二：领域下沉（中风险，逻辑重构）

1. `pages/counter/data.ts` → `features/order/model.ts`，补齐 `isCounterVisible` / `nextOrderAction` / `orderStatusStyle`；魔法数字全部替换为枚举引用。
2. 补 `OrderDiningMethod` 的 `TAKEAWAY_DELIVERY=3` 到 `packages/constraints`，前端改用 `OrderDiningMethod.getKeyByValue()`。
3. `lib/api/{auth,store,product,orders}.ts` → 各自 `features/*/api.ts`；`lib/session.ts` → `features/auth/session.ts`。
4. `lib/use-store.ts` → `app/store-provider.tsx` + `features/store/hooks/use-store.ts`（改 Context 读取）。
5. 401 改为事件驱动，`providers.tsx` 订阅并 `navigate`。
6. `pages/counter/*` 改用 `useAsyncData` / `use-mutation`，组件拆分到位。

**验收**：Counter 页面交互与现状逐项一致（可录屏对比）；`OrderStatusBadge` 的样式表 key 全部为数字 code。

### 阶段三：拆解大页面（收益最大）

1. `features/product/` 完整落地：`use-products` / `use-product-status-mutation` / `use-customizations`（内含过期响应处理）/ `use-product-batch`。
2. 拆出 `product-card.tsx`、`product-toolbar.tsx`、`customize-dialog.tsx`、`confirm-dialog` 复用件。
3. `pages/admin/products/index.tsx` 从 513 行降到 ≤ 120 行。
4. 同法处理 `pages/admin/settings/index.tsx`（332 行 → ≤ 100 行），枚举描述改元组常量。
5. 落地 ESLint 分层约束（`no-restricted-imports`）。

**验收**：单文件行数达标；`ProductsPage` 的 `useState` ≤ 3 个；ESLint 分层规则生效且 CI 通过。

### 阶段四（可选）：测试补齐

`features/*/model.ts` 是纯函数，优先补单测（订单可见性、状态机、DTO 映射、错误文案降级）。配置 Vitest + 一个 `*.test.ts` 覆盖 `features/order/model.ts` 作为样板。

---

## 七、规范与约束落地

### 7.1 ESLint 分层规则（对齐后端做法）

```js
// eslint.config.js（片段）
{
  files: ['src/shared/**'],
  rules: {
    'no-restricted-imports': ['error', {
      patterns: ['@/features/*', '@/pages/*', '@/layouts/*', '@/app/*'],
    }],
  },
},
{
  files: ['src/features/*/**'],
  rules: {
    'no-restricted-imports': ['error', {
      patterns: ['@/pages/*', '@/layouts/*'],
    }],
  },
},
```

跨领域（如 `features/order` 引用 `features/store`）用 `overrides` 显式白名单，每加一条都要在评审里说明理由。

### 7.2 代码评审 checklist（前端）

- [ ] 是否出现裸数字状态判断？应改用 `Xxx.keyMap` / `getLabel` / `getColor`。
- [ ] 是否有新的 `useEffect + fetch` 样板？应改用 `useAsyncData`。
- [ ] 是否有新的 `catch { logger + toast }`？应交给 `useMutation` 或 `resolveErrorMessage`。
- [ ] 新增文件命名是否 kebab-case？导出风格是否符合所在层约定？
- [ ] 页面文件是否超过 120 行？超出部分应下沉到 `features/<领域>/`。
- [ ] 是否引用了契约包中不存在的枚举取值？若是，先补 `packages/constraints`。
- [ ] `shared/ui/` 是否被手工修改？

### 7.3 同步更新

- 根 `README.md` 的目录结构小节（`apps/web` 分支）需同步为新结构；
- `apps/web/README.md` 目前仍是 shadcn 模板原文（"This is a template for a new Vite project…"），一并改写为真实项目说明，包含：目录约定、命令、分层规则、如何新增一个 feature 模块。

---

## 八、明确不做的事（避免过度设计）

1. **不引入 TanStack Query。** 当前只有 6 个页面、9 个接口，自研 `useAsyncData`（约 60 行）已能消除全部样板。引入后需处理 QueryClient 配置、devtools、缓存失效策略，收益不抵成本。**触发重新评估的条件**：出现轮询（大屏实时刷新）、跨页面缓存共享、请求去重/重试编排这三类需求中的任意两项时，再整体切换到 TanStack Query——届时因业务代码已全走 `features/*/hooks/`，替换范围被限制在 `shared/hooks/` 内。
2. **不引入状态管理库（Zustand / Redux）。** 现有状态全是"服务端数据 + 局部 UI 状态"，用 `useAsyncData` + 少量 `useState` + 应用级 Context（门店）即可覆盖。
3. **不做 Monorepo 内的 UI 组件库抽离。** 只有 `web` 一个前端应用，`packages/` 下再开 `ui` 包属于纯粹的间接层。
4. **不引入 CSS Modules / styled-components。** Tailwind v4 + `cn()` 已满足需求，`OrderCard` 里的模板字符串拼 class 属于局部问题，随组件拆分一并改用 `cn()` 即可。
5. **不做大范围视觉重构。** 本次只动结构，交互与视觉逐项保持一致；阶段二、三建议用录屏对比做人工回归。
6. **不改动 `packages/constraints` 的现有枚举语义**，只做增量补充（如缺失的 `diningMethod=3`），避免波及后端校验与 OpenAPI。

---

## 九、验收标准

| 维度 | 现状 | 目标 |
| --- | --- | --- |
| 最大单文件行数 | 513 | ≤ 120（`pages/**`） |
| `ProductsPage` 的 `useState` 数量 | 12 | ≤ 3 |
| 手写 `useEffect + fetch` 处数 | 4 | 0 |
| `catch { logger + toast }` 样板处数 | 8+ | 0（收敛进 `useMutation`） |
| 裸数字状态判断处数 | 10+ | 0 |
| 用 label 字符串做映射 key | 1 | 0 |
| 文件命名风格 | 3 种 | 1 种（kebab-case） |
| 路径常量重复处数 | 3 | 1（`router/paths.ts`） |
| `GET /api/v1/store/` 单次会话请求次数 | 每次挂载组件各 1 次 | 1 次 |
| 401 处理方式 | `window.location.replace` | 事件 + `navigate`（无整页刷新） |
| ESLint 分层约束 | 无 | 生效 |

---

## 十、风险与应对

| 风险 | 影响 | 应对 |
| --- | --- | --- |
| 阶段二/三改动面大，回归不充分 | 线上交互回归 | 分阶段合并；每阶段用录屏对比关键路径（登录 → 首页 → 后台商品 → 客制化弹窗 → 前台订单） |
| `features/` 与 `pages/` 双层导致过度跳转 | 开发体验下降 | 约定：`pages/` 只引用同领域 `features/<领域>`；领域名与路由段保持一致（`admin/products` ↔ `features/product`），按路径即可定位 |
| 契约包补充枚举值影响后端 | 后端 zod 校验行为变化 | 只做追加，不改现有值；改动同时更新 `README.md` 的接口约定小节 |
| 业务并行开发导致冲突 | 合并冲突 | 阶段一（纯移动）优先合入，越早越好；阶段二/三与业务排期错开 |
