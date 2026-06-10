import { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import { AppLayout } from './layout/AppLayout'
import { ProtectedRoute } from '../shared/ui/ProtectedRoute'
import { useAuthStore } from '../shared/store/authStore'
import { AlertDetailPage } from '../pages/AlertDetailPage'
import { AlertNewPage } from '../pages/AlertNewPage'
import { AlertsPage } from '../pages/AlertsPage'
import { ApiDocsPage } from '../pages/ApiDocsPage'
import { ApiKeysPage } from '../pages/ApiKeysPage'
import { DashboardPage } from '../pages/DashboardPage'
import { EconomicTimelinePage } from '../pages/EconomicTimelinePage'
import { LoginPage } from '../pages/LoginPage'
import { MarketDetailPage } from '../pages/MarketDetailPage'
import { MarketListPage } from '../pages/MarketListPage'
import { SettingsPage } from '../pages/SettingsPage'
import { SignupPage } from '../pages/SignupPage'
import { WatchlistPage } from '../pages/WatchlistPage'

export function App() {
  const bootstrap = useAuthStore((s) => s.bootstrap)

  // Restore session on mount: tries /auth/refresh once. If the httpOnly cookie
  // is missing/expired this is a quiet no-op and the user stays unauthenticated.
  useEffect(() => {
    void bootstrap()
  }, [bootstrap])

  return (
    <Routes>
      {/* auth pages (no layout) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* main app with shared layout */}
      <Route element={<AppLayout />}>
        {/* public routes */}
        <Route index element={<DashboardPage />} />
        <Route path="/market" element={<MarketListPage />} />
        <Route path="/market/:symbol" element={<MarketDetailPage />} />
        <Route path="/economic" element={<EconomicTimelinePage />} />
        <Route path="/api-docs" element={<ApiDocsPage />} />

        {/* protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/watchlist" element={<WatchlistPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/alerts/new" element={<AlertNewPage />} />
          <Route path="/alerts/:id" element={<AlertDetailPage />} />
          <Route path="/api-keys" element={<ApiKeysPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
