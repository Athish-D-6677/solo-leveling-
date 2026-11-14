import { motion } from 'framer-motion'

type Stat = 'STR' | 'VIT' | 'AGI' | 'INT' | 'SEN'

interface Props {
  stat: Stat
  value: number
  maxValue?: number
}

const statColors: Record<Stat, string> = {
  STR: '#ef4444',
  VIT: '#22c55e',
  AGI: '#06b6d4',
  INT: '#a855f7',
  SEN: '#eab308',
}

export function StatBar({ stat, value, maxValue = 100 }: Props) {
  const pct = Math.min((value / maxValue) * 100, 100)
  const color = statColors[stat]

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1 text-xs">
        <span className="font-rajdhani font-bold tracking-widest" style={{ color }}>
          {stat}
        </span>
        <span className="text-gray-300">{value}</span>
      </div>
      <div className="w-full h-2 bg-[#1a2035] rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
