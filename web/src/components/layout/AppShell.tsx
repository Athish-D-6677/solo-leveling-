import { Outlet, Link } from 'react-router-dom'
import { useAuth } from '../../features/auth/useAuth'
import { StreakFlame } from '../ui/StreakFlame'
import { Badge } from '../ui/Badge'
import { useGameStore } from '../../stores/gameStore'

export function AppShell() {
  const { user, signOut } = useAuth()
  const { streak, rank } = useGameStore()

  return (
    <div className="min-h-screen bg-navy flex flex-col">
      {/* Top Nav */}
      <header className="border-b border-[#00d4ff]/20 bg-[#0d1326]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/dashboard" className="font-rajdhani font-bold text-xl tracking-widest text-[#00d4ff]">
            THE SYSTEM
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs tracking-widest uppercase text-gray-400">
            <Link to="/dashboard" className="hover:text-[#00d4ff] transition-colors">Dashboard</Link>
            <Link to="/progress" className="hover:text-[#00d4ff] transition-colors">Progress</Link>
            <Link to="/profile" className="hover:text-[#00d4ff] transition-colors">Profile</Link>
          </nav>

          <div className="flex items-center gap-4">
            <StreakFlame count={streak ?? 0} />
            {rank && <Badge rank={rank as 'E' | 'D' | 'C' | 'B' | 'A' | 'S'} size="sm" />}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#1a2035] border border-[#00d4ff]/30 flex items-center justify-center text-xs text-[#00d4ff]">
                {user?.displayName?.[0]?.toUpperCase() ?? 'P'}
              </div>
              <span className="text-xs text-gray-400 hidden sm:block">{user?.displayName ?? 'Player'}</span>
            </div>
            <button
              onClick={signOut}
              className="text-xs text-gray-500 hover:text-red-400 transition-colors tracking-widest uppercase"
            >
              Exit
            </button>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
