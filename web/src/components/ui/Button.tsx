import React from 'react'

type Variant = 'primary' | 'gold' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  children: React.ReactNode
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-[#00d4ff]/10 border border-[#00d4ff] text-[#00d4ff] hover:bg-[#00d4ff]/20 shadow-holo active:scale-95',
  gold:
    'bg-[#ffd700]/10 border border-[#ffd700] text-[#ffd700] hover:bg-[#ffd700]/20 shadow-gold active:scale-95',
  ghost:
    'bg-transparent border border-gray-600 text-gray-400 hover:border-gray-400 hover:text-gray-200 active:scale-95',
  danger:
    'bg-red-900/20 border border-red-500 text-red-400 hover:bg-red-900/40 active:scale-95',
}

const sizeClasses: Record<Size, string> = {
  sm: 'text-xs px-3 py-1.5 tracking-widest',
  md: 'text-sm px-5 py-2.5 tracking-widest',
  lg: 'text-base px-7 py-3 tracking-widest',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: Props) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`
        font-rajdhani font-semibold uppercase rounded-sm transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  )
}
