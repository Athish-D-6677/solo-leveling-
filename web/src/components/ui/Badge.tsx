type Rank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S'

interface Props {
  rank: Rank
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const rankColors: Record<Rank, string> = {
  E: '#6b7280',
  D: '#22c55e',
  C: '#3b82f6',
  B: '#a855f7',
  A: '#f97316',
  S: '#ffd700',
}

const sizeClasses = {
  sm: 'text-xs px-1.5 py-0.5',
  md: 'text-sm px-2 py-1',
  lg: 'text-base px-3 py-1.5',
}

export function Badge({ rank, size = 'md', className = '' }: Props) {
  const color = rankColors[rank]
  return (
    <span
      className={`font-rajdhani font-bold tracking-widest border rounded-sm ${sizeClasses[size]} ${className}`}
      style={{ color, borderColor: color, textShadow: `0 0 8px ${color}` }}
    >
      {rank}
    </span>
  )
}
