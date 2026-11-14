import { motion } from 'framer-motion'

interface Props {
  current: number
  max: number
  level: number
  rank: string
}

const rankColors: Record<string, string> = {
  E: '#6b7280',
  D: '#22c55e',
  C: '#3b82f6',
  B: '#a855f7',
  A: '#f97316',
  S: '#ffd700',
}

export function XPBar({ current, max, level, rank }: Props) {
  const pct = Math.min((current / max) * 100, 100)
  const rankColor = rankColors[rank] ?? '#6b7280'

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1 text-xs">
        <span className="text-[#00d4ff] font-rajdhani font-bold tracking-widest">LVL {level}</span>
        <span className="text-gray-400">
          {current}/{max} XP
        </span>
        <span
          className="font-rajdhani font-bold text-sm px-2 py-0.5 rounded-sm border"
          style={{ color: rankColor, borderColor: rankColor }}
        >
          {rank}
        </span>
      </div>
      <div className="w-full h-3 bg-[#1a2035] rounded-full overflow-hidden">
        <motion.div
          layoutId="xpbar"
          className="h-full bg-gradient-to-r from-[#0080ff] to-[#00d4ff] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
