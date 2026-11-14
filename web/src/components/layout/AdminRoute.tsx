import { useState, useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { getIdTokenResult } from 'firebase/auth'
import { useAuth } from '../../features/auth/useAuth'

export function AdminRoute() {
  const { user, loading } = useAuth()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)

  useEffect(() => {
    if (!user) {
      setIsAdmin(false)
      return
    }
    getIdTokenResult(user).then((result) => {
      setIsAdmin(result.claims['admin'] === true)
    })
  }, [user])

  if (loading || isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#00d4ff]" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/dashboard" replace />

  return <Outlet />
}
