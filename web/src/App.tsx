import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './features/auth/AuthProvider'
import { useAuth } from './features/auth/useAuth'
import { BootScreen } from './features/auth/BootScreen'
import { LoginPage } from './features/auth/LoginPage'
import { SignupPage } from './features/auth/SignupPage'
import { HunterAssessment } from './features/onboarding/HunterAssessment'
import { Dashboard } from './features/dashboard/Dashboard'
import { ProfilePage } from './features/profile/ProfilePage'
import { AppShell } from './components/layout/AppShell'
import { PrivateRoute } from './components/layout/PrivateRoute'
import { AdminRoute } from './components/layout/AdminRoute'
import { SystemWindow } from './components/ui/SystemWindow'

function RootRedirect() {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#00d4ff]" />
      </div>
    )
  }
  return user ? <Navigate to="/dashboard" replace /> : <BootScreen />
}

function ProgressPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <SystemWindow title="HUNTER ARCHIVES & GROWTH ANALYTICS">
        <div className="space-y-4">
          <p className="text-sm text-gray-300">
            System logs track your attribute adaptations, completed daily quests, and level progression over time.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="p-4 rounded bg-[#111827] border border-[#00d4ff]/30">
              <span className="text-xs text-gray-400">Current Streak</span>
              <p className="text-2xl font-rajdhani font-bold text-gold">🔥 Active</p>
            </div>
            <div className="p-4 rounded bg-[#111827] border border-[#00d4ff]/30">
              <span className="text-xs text-gray-400">Directives Cleared</span>
              <p className="text-2xl font-rajdhani font-bold text-[#00d4ff]">Verified in System</p>
            </div>
            <div className="p-4 rounded bg-[#111827] border border-[#00d4ff]/30">
              <span className="text-xs text-gray-400">Security & Integrity</span>
              <p className="text-2xl font-rajdhani font-bold text-green-400">100% Synced</p>
            </div>
          </div>
        </div>
      </SystemWindow>
    </div>
  )
}

function AdminPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <SystemWindow title="SYSTEM OVERSEER CONSOLE [ADMIN]">
        <div className="space-y-4">
          <p className="text-sm text-gold">
            Architect Authority Mode. You have full catalog configuration permissions.
          </p>
          <div className="p-4 bg-[#111827] border border-gold/40 rounded">
            <p className="text-xs text-gray-300">Catalog Quests active: 64</p>
            <p className="text-xs text-gray-300">Algorithm: Streak preservation active</p>
          </div>
        </div>
      </SystemWindow>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Authenticated routes inside AppShell */}
          <Route element={<PrivateRoute />}>
            <Route path="/onboarding" element={<HunterAssessment />} />
            <Route element={<AppShell />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/progress" element={<ProgressPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
