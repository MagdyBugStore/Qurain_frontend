import React from "react";
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import LoginModal from '../components/modals/LoginModal'
import Popup from '../components/modals/Popup'
import HeroSection from '../components/sections/HeroSection'
import HowItWorksSection from '../components/sections/HowItWorksSection'

export default function Home() {
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
