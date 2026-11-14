interface Props {
  count: number
}

export function StreakFlame({ count }: Props) {
  const isActive = count > 0
  return (
    <span className={`font-rajdhani font-bold text-sm flex items-center gap-1 ${isActive ? '' : 'opacity-40'}`}>
      <span>🔥</span>
      <span style={{ color: isActive ? '#ffd700' : '#6b7280' }}>{count}</span>
    </span>
  )
}
