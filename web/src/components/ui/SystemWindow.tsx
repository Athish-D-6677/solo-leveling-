import React from 'react'
import { motion } from 'framer-motion'

interface Props {
  title?: string
  children: React.ReactNode
  className?: string
  animate?: boolean
}

export function SystemWindow({ title, children, className = '', animate = true }: Props) {
  const content = (
    <div
      className={`bg-[#0d1326] border border-[#00d4ff]/40 relative p-6 rounded-sm ${className}`}
    >
      {/* Corner brackets */}
      <span className="absolute top-1 left-1 text-[#00d4ff] text-xs leading-none select-none">┌</span>
      <span className="absolute top-1 right-1 text-[#00d4ff] text-xs leading-none select-none">┐</span>
      <span className="absolute bottom-1 left-1 text-[#00d4ff] text-xs leading-none select-none">└</span>
      <span className="absolute bottom-1 right-1 text-[#00d4ff] text-xs leading-none select-none">┘</span>

      {title && (
        <div className="mb-4 pb-2 border-b border-[#00d4ff]/20">
          <span className="text-xs tracking-[0.3em] text-[#00d4ff] uppercase">{title}</span>
        </div>
      )}
      {children}
    </div>
  )

  if (animate) {
    return (
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {content}
      </motion.div>
    )
  }

  return content
}
