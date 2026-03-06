'use client'

import React from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helperText?: string
  options: Array<{ value: string; label: string }>
}

export default function Select({
  label,
  error,
  helperText,
  options,
  className = '',
  ...props
}: SelectProps) {
  const baseClasses = "w-full h-12 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-primary focus:border-primary appearance-none text-slate-900 dark:text-slate-100 transition-colors"
  const paddingClasses = 'px-4 pr-10'
  
  const selectClasses = `${baseClasses} ${paddingClasses} ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''} ${className}`

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={selectClasses}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          expand_more
        </span>
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
      )}
    </div>
  )
}
