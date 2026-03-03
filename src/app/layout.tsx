import type { Metadata } from 'next'
import { Noto_Sans_Arabic, Lexend } from 'next/font/google'
import './globals.css'

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-noto-sans-arabic',
})

const lexend = Lexend({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-lexend',
})

export const metadata: Metadata = {
  title: 'القرآن أونلاين - تعليم القرآن الكريم',
  description: 'منصة تعليم القرآن الكريم للأطفال والكبار',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html dir="rtl" lang="ar" className={`${notoSansArabic.variable} ${lexend.variable}`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background-light text-text-main font-body flex flex-col min-h-screen">
        {children}
      </body>
    </html>
  )
}
