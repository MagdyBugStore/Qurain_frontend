'use client'

import React from "react";
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { isProfileComplete } from '../models/UserModel'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import LoginModal from '../components/modals/LoginModal'
import Popup from '../components/modals/Popup'
import HeroSection from '../components/sections/HeroSection'
import HowItWorksSection from '../components/sections/HowItWorksSection'

export default function Home() {
  const { user, userProfile, loading } = useAuth()


  if (!loading && user) {
    

    if (!userProfile?.accountType) {
      return <Navigate to="/choose-role" replace />;
    }

    if (userProfile.accountType === 'student' && !isProfileComplete(userProfile)) {
      return <Navigate to="/personal-info" replace />;
    }

    if (userProfile.accountType === 'teacher' && !isProfileComplete(userProfile)) {
      return <Navigate to="/teacher-application" replace />;
    }
  }


  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <HowItWorksSection />
      </main>
      <LoginModal />
      <Popup />
    </>
  )
}
