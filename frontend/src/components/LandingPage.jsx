import { useState } from 'react'
import { Zap, MessageCircle, Bot, Rocket, Plus, Bitcoin } from 'lucide-react'
import SplashScreen from './SplashScreen'
import OnboardingScreen from './OnboardingScreen'
import Dashboard from './Dashboard'

const screens = {
  SPLASH: 'splash',
  ONBOARDING: 'onboarding',
  DASHBOARD: 'dashboard'
}

function ZapBaseApp() {
  const [currentScreen, setCurrentScreen] = useState(screens.SPLASH)
  const [onboardingStep, setOnboardingStep] = useState(0)

  const onboardingData = [
    {
      title: "Send Crypto with Just Your Voice!",
      description: "No more long wallet addresses! Just speak or type your transaction, and our AI will handle the rest!",
      icon: <MessageCircle className="w-16 h-16 text-primary" />,
      illustration: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=400&h=400"
    },
    {
      title: "Fast, Secure & Easy Transactions",
      description: "Our AI makes sending crypto as easy as chatting. Just say the name, amount and send!",
      icon: <Bot className="w-16 h-16 text-primary" />,
      illustration: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=400&h=400"
    },
    {
      title: "Let's Get Started!",
      description: "Ready to experience the future of crypto transactions?",
      icon: <Rocket className="w-16 h-16 text-primary" />,
      illustration: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=400&h=400"
    }
  ]

  const handleSplashComplete = () => {
    setCurrentScreen(screens.ONBOARDING)
  }

  const handleOnboardingNext = () => {
    if (onboardingStep < onboardingData.length - 1) {
      setOnboardingStep(onboardingStep + 1)
    } else {
      setCurrentScreen(screens.DASHBOARD)
    }
  }

  return (
    <div className="min-h-screen bg-dark">
      {currentScreen === screens.SPLASH && (
        <SplashScreen onComplete={handleSplashComplete} />
      )}
      {currentScreen === screens.ONBOARDING && (
        <OnboardingScreen
          data={onboardingData[onboardingStep]}
          onNext={handleOnboardingNext}
          currentStep={onboardingStep}
          totalSteps={onboardingData.length}
        />
      )}
      {currentScreen === screens.DASHBOARD && (
        <Dashboard />
      )}
    </div>
  )
}

export default ZapBaseApp