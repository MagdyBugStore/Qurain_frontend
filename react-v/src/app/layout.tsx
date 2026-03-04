import React from 'react'
import './globals.css'

// Root layout wrapper for React Router
// Note: HTML structure is in public/index.html for Create React App
// Fonts are loaded via CSS/HTML, not Next.js font optimization

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-background-light text-text-main font-body flex flex-col min-h-screen">
      {children}
    </div>
  )
}
