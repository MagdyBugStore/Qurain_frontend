'use client'

import React from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Header from '../../../components/layout/Header'
import { RoomCall } from '../../../features/room/presentation/components/RoomCall/RoomCall'

export default function RoomCallPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams<{ id: string }>()
  const params = new URLSearchParams(location.search)
  const counterpartName = params.get('counterpartName') || undefined
  const counterpartAvatar =
    params.get('counterpartAvatar') ||
    params.get('counterpartPhoto') ||
    undefined

  if (!id) {
    return (
      <>
        <Header />
        <main className="flex-1 flex items-center justify-center p-6 bg-background-light dark:bg-background-dark">
          <div className="w-full max-w-lg bg-white dark:bg-surface-dark border border-primary/20 rounded-xl p-6 text-center">
            <h1 className="text-xl font-bold text-text-main dark:text-white">تعذر فتح المكالمة</h1>
            <p className="mt-2 text-text-muted dark:text-slate-400">لم يتم العثور على معرف الغرفة.</p>
            <button
              onClick={() => navigate('/')}
              className="mt-6 px-5 py-2.5 rounded-lg bg-primary text-background-dark font-bold hover:bg-primary/90 transition-colors"
            >
              العودة للرئيسية
            </button>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="flex-1 p-4 sm:p-6 bg-background-light dark:bg-background-dark">
        <RoomCall
          roomId={id}
          counterpartName={counterpartName}
          counterpartAvatar={counterpartAvatar}
        />
      </main>
    </>
  )
}
