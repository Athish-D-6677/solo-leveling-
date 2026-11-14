import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../features/auth/useAuth'

export function PrivateRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#00d4ff]" />
      </div>
    )
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />
}
