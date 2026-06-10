import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { selectAuthStatus, useAuthStore } from '../store/authStore'

/**
 * Gate for routes that require an authenticated account session.
 *
 * Status transitions:
 *   - 'bootstrapping' → show a thin placeholder (do NOT redirect — that would
 *     bounce the user to /login on every reload while the refresh call is in flight)
 *   - 'authenticated' → render the route
 *   - anything else → redirect to /login, preserving the original location
 *     so we can send the user back after login.
 */
export function ProtectedRoute() {
  const status = useAuthStore(selectAuthStatus)
  const location = useLocation()

  if (status === 'bootstrapping' || status === 'idle') {
    return (
      <div className="route-loading" role="status" aria-live="polite">
        <span>세션 확인 중…</span>
      </div>
    )
  }

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
