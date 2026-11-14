import React, { useState } from 'react'

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function Input({ label, error, className = '', id, ...props }: Props) {
  const [focused, setFocused] = useState(false)
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="relative w-full">
      <label
        htmlFor={inputId}
        className={`
          absolute left-3 transition-all duration-200 pointer-events-none select-none
          ${focused || props.value ? 'top-1 text-xs text-[#00d4ff]' : 'top-3.5 text-sm text-gray-500'}
        `}
      >
        {label}
      </label>
      <input
        id={inputId}
        {...props}
        onFocus={(e) => {
          setFocused(true)
          props.onFocus?.(e)
        }}
        onBlur={(e) => {
          setFocused(false)
          props.onBlur?.(e)
        }}
        className={`
          w-full bg-[#111827] border rounded-sm px-3 pt-6 pb-2 text-sm text-gray-100
          transition-all duration-200 outline-none
          ${error ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-gray-700 focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff]/50'}
          ${className}
        `}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  )
}
