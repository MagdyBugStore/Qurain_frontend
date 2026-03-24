'use client'

import React from "react";
import { useEffect } from 'react'
import Header from '../../../components/layout/Header'
import { useNavigate, useParams } from 'react-router-dom'
import { TechnicalCheck } from '../../../features/room/presentation/components/TechnicalCheck/TechnicalCheck'
import { useDeviceCheck } from '../../../features/room/presentation/hooks/useDeviceCheck'
import { useRoom } from '../../../features/room/presentation/hooks/useRoom'
// Firestore removed

export default function TechnicalCheckPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { room, updateStatus } = useRoom(id)
  const { checking, result, runCheck } = useDeviceCheck()

  // Run checks on mount
  useEffect(() => {
    if (id && !result) {
      runCheck()
    }
  }, [id, result, runCheck])

  // Save check results when available
  // NOTE: Firestore removed - use backend API instead
  useEffect(() => {
    if (result && id) {
      console.warn('TechnicalCheckPage: Firestore removed, cannot save technical check results');
    }
  }, [result, id])

  const handleRetry = async () => {
    await runCheck()
  }

  const handleEnter = async () => {
    if (result?.allPassed && id) {
      await updateStatus('waiting')
      navigate(`/waiting-room/${id}`)
    }
  }

  return (
    <>
      <Header />
      <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-8 bg-background-light dark:bg-background-dark">
        <TechnicalCheck
          result={result}
          checking={checking}
          onRetry={handleRetry}
          onEnter={handleEnter}
        />
      </main>
    </>
  )
}
