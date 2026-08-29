import { Navigate, type RouteObject } from "react-router-dom"

import { AppProviders } from "@/app/providers"
import { AdminLayout } from "@/layouts/admin-layout"
import { paths } from "@/router/paths"
import { RequireAuth } from "@/router/guards"
import HomePage from "@/pages/home"
import LoginPage from "@/pages/login"
import ProductsPage from "@/pages/admin/products"
import StoreSettingsPage from "@/pages/admin/settings"
import CounterPage from "@/pages/counter"
import PlaceholderPage from "@/pages/placeholder"

export const routeConfig: RouteObject[] = [
  {
    element: <AppProviders />,
    children: [
      { path: paths.login, element: <LoginPage /> },
      { path: paths.screen, element: <PlaceholderPage />, handle: { title: "服务大屏" } },
      {
        element: <RequireAuth />,
        children: [
          { path: paths.home, element: <HomePage /> },
          {
            path: paths.admin.root,
            element: <AdminLayout />,
            children: [
              { index: true, element: <Navigate to={paths.admin.settings} replace /> },
              { path: "settings", element: <StoreSettingsPage /> },
              { path: "products", element: <ProductsPage /> },
            ],
          },
          { path: paths.counter, element: <CounterPage /> },
        ],
      },
      { path: "*", element: <Navigate to={paths.home} replace /> },
    ],
  },
]
