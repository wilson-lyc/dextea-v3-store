import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

import { RequireAuth } from "@/components/route-guard"
import { AdminLayout } from "@/components/admin-layout"
import HomePage from "@/pages/home"
import LoginPage from "@/pages/login"
import ProductsPage from "@/pages/admin/products"
import StoreSettingsPage from "@/pages/admin/settings"
import CounterPage from "@/pages/counter"

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/settings" replace />} />
            <Route path="settings" element={<StoreSettingsPage />} />
            <Route path="products" element={<ProductsPage />} />
          </Route>
          <Route path="/counter" element={<CounterPage />} />
          <Route path="/screen" element={<PlaceholderPage title="服务大屏" />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
