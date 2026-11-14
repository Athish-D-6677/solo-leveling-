import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const LINE_1 = 'YOU HAVE BEEN CHOSEN AS A PLAYER.'
const LINE_2 = 'DO YOU ACCEPT?'

function useTypewriter(text: string, speed = 50, startDelay = 0) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    setDisplayed('')
    setDone(false)
    const timeout = setTimeout(() => {
      let i = 0
      const interval = setInterval(() => {
        i++
        setDisplayed(text.slice(0, i))
        if (i >= text.length) {
          clearInterval(interval)
          setDone(true)
        }
      }, speed)
      return () => clearInterval(interval)
    }, startDelay)
    return () => clearTimeout(timeout)
  }, [text, speed, startDelay])

  return { displayed, done }
}

export function BootScreen() {
  const navigate = useNavigate()
  const { displayed: line1, done: line1Done } = useTypewriter(LINE_1, 50, 600)
  const { displayed: line2 } = useTypewriter(LINE_2, 60, line1Done ? 400 : 99999)

  // Recalculate delay based on line1 length
  const line1Duration = LINE_1.length * 50 + 600
  const { displayed: l2 } = useTypewriter(LINE_2, 60, line1Duration + 400)

  const showButtons = line1Done

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center relative overflow-hidden">
      {/* Scanlines overlay */}
      <div className="absolute inset-0 scanlines pointer-events-none" />

      {/* Particle dots */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-[#00d4ff]/10"
          style={{
            width: Math.random() * 3 + 1 + 'px',
            height: Math.random() * 3 + 1 + 'px',
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            animation: `glow-pulse ${2 + Math.random() * 3}s ease-in-out infinite`,
            animationDelay: Math.random() * 2 + 's',
          }}
        />
      ))}

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-[400px] relative"
      >
        {/* SystemWindow manual render for boot screen */}
        <div className="bg-[#0d1326] border border-[#00d4ff]/40 relative p-8 rounded-sm shadow-holo">
          <span className="absolute top-1 left-1 text-[#00d4ff] text-xs leading-none select-none">┌</span>
          <span className="absolute top-1 right-1 text-[#00d4ff] text-xs leading-none select-none">┐</span>
          <span className="absolute bottom-1 left-1 text-[#00d4ff] text-xs leading-none select-none">└</span>
          <span className="absolute bottom-1 right-1 text-[#00d4ff] text-xs leading-none select-none">┘</span>

          <div className="text-center space-y-6">
            <div className="space-y-3">
              <p
                className="font-rajdhani text-[#00d4ff] leading-tight min-h-[2.5em]"
                style={{ fontSize: '1.4em' }}
              >
                {line1}
                {!line1Done && <span className="animate-pulse">▋</span>}
              </p>
              {line1Done && (
                <p
                  className="font-rajdhani text-[#ffd700] leading-tight min-h-[2em]"
                  style={{ fontSize: '1.1em' }}
                >
                  {l2}
                  {l2.length < LINE_2.length && <span className="animate-pulse">▋</span>}
                </p>
              )}
            </div>

            {showButtons && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex gap-4 justify-center"
              >
                <button
                  onClick={() => navigate('/signup')}
                  className="font-rajdhani font-semibold uppercase tracking-widest text-sm px-6 py-2.5
                    bg-[#00d4ff]/10 border border-[#00d4ff] text-[#00d4ff]
                    hover:bg-[#00d4ff]/20 transition-all duration-200 rounded-sm shadow-holo"
                >
                  [ ACCEPT ]
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="font-rajdhani font-semibold uppercase tracking-widest text-sm px-6 py-2.5
                    bg-transparent border border-gray-600 text-gray-400
                    hover:border-gray-400 hover:text-gray-200 transition-all duration-200 rounded-sm"
                >
                  [ DECLINE ]
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
