import React from 'react'

interface Props {
  children: React.ReactNode
  className?: string
}

export function HoloPanel({ children, className = '' }: Props) {
  return (
    <div className={`border border-[#00d4ff]/20 bg-[#111827]/80 rounded p-4 ${className}`}>
      {children}
    </div>
  )
}
