'use client'

import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { isProfileComplete } from '../../models/UserModel'
import AccountTypeSelection from '../../components/forms/AccountTypeSelection'

export default function ChooseRolePage() {
  const navigate = useNavigate()
  const { user, userProfile } = useAuth()
  const [isNavigating, setIsNavigating] = useState(false)

  useEffect(() => {
    if (!user) {
      return
    }

    // If profile is already complete, redirect to profile page
    if (userProfile && isProfileComplete(userProfile)) {
      const timer = setTimeout(() => {
        if (user?.id) {
          navigate(`/profile/${user.id}`, { replace: true })
        } else {
          navigate('/profile', { replace: true })
        }
      }, 100)
      return () => clearTimeout(timer)
    }

    // If user already has accountType, redirect to appropriate page
    if (userProfile?.accountType) {
      if (userProfile.accountType === 'student') {
        // If student but profile incomplete, go to complete info page
        navigate('/personal-info', { replace: true })
      } else {
        // Teacher flow - redirect to teacher application
        navigate('/teacher-application', { replace: true })
      }
    }
  }, [user, userProfile, navigate])

  const handleAccountTypeSelect = async (type: 'student' | 'teacher') => {
    if (isNavigating) return
    setIsNavigating(true)

    if (type === 'student') {
      // Navigate to complete info page for students
      navigate('/personal-info')
    } else {
      // Teacher flow - navigate to teacher application
      navigate('/teacher-application')
    }
  }

  if (!user) {
    return null
  }

  // If user already has accountType, don't show selection (will redirect)
  if (userProfile?.accountType) {
    return null
  }

  return <AccountTypeSelection onSelect={handleAccountTypeSelect} />
}
