import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import LoginModal from '../components/modals/LoginModal'
import Popup from '../components/modals/Popup'
import HeroSection from '../components/sections/HeroSection'
import LearningPathsSection from '../components/sections/LearningPathsSection'
import HowItWorksSection from '../components/sections/HowItWorksSection'
import FeaturedTutorsSection from '../components/sections/FeaturedTutorsSection'
import TestimonialsSection from '../components/sections/TestimonialsSection'

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <LearningPathsSection />
        <HowItWorksSection />
        <FeaturedTutorsSection />
        <TestimonialsSection />
      </main>
      <Footer />
      <LoginModal />
      <Popup />
    </>
  )
}
