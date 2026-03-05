'use client'

import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  icon?: string
  iconPosition?: 'left' | 'right'
  error?: string
  helperText?: string
}

export default function Input({
  label,
  icon,
  iconPosition = 'right',
  error,
  helperText,
  className = '',
  ...props
}: InputProps) {
  const baseClasses = "w-full h-12 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-primary focus:border-primary text-slate-900 dark:text-slate-100 transition-colors"
  const paddingClasses = icon 
    ? (iconPosition === 'right' ? 'pr-10 pl-4' : 'pl-10 pr-4')
    : 'px-4'
  
  const inputClasses = `${baseClasses} ${paddingClasses} ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''} ${className}`

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className={`material-symbols-outlined absolute top-1/2 -translate-y-1/2 text-slate-400 ${
            iconPosition === 'right' ? 'right-3' : 'left-3'
          }`}>
            {icon}
          </span>
        )}
        <input
          className={inputClasses}
          {...props}
        />
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
