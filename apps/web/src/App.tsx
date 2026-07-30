import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

import { RequireAuth } from "@/components/route-guard"
import HomePage from "@/pages/home"
import LoginPage from "@/pages/login"
import PlaceholderPage from "@/pages/placeholder"

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<PlaceholderPage title="后台设置" />} />
          <Route path="/counter" element={<PlaceholderPage title="前台服务" />} />
          <Route path="/screen" element={<PlaceholderPage title="服务大屏" />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
