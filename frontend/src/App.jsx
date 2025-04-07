import { useState } from 'react'
import { MessageCircle, Bot, Rocket } from 'lucide-react'
import SplashScreen from './components/SplashScreen'
import OnboardingScreen from './components/OnboardingScreen'
import Dashboard from './components/Dashboard'
import SendMoney from './components/SendMoney'
import Confirmation from './components/Confirmation'
import Success from './components/Success'

const screens = {
  SPLASH: 'splash',
  ONBOARDING: 'onboarding',
  DASHBOARD: 'dashboard',
  SEND: 'send',
  CONFIRMATION: 'confirmation',
  SUCCESS: 'success'
}

function App() {
  const [currentScreen, setCurrentScreen] = useState(screens.SPLASH)
  const [onboardingStep, setOnboardingStep] = useState(0)
  const [transactionDetails, setTransactionDetails] = useState({
    amount: '0.5',
    receiver: 'John.base.eth'
  })

  const onboardingData = [
    {
      title: "Send Crypto to Base name with just your voice",
      description: "No more long wallet addresses! Just speak or type your transaction, and our AI will handle the rest!",
      illustration: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=400&h=400"
    },
    {
      title: "Fast, Secure & Seamless Transactions",
      description: "Our AI makes sending crypto via your Domain name seamless",
      illustration: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=400&h=400"
    },
    {
      title: "Let's Get Started!",
      description: "Ready to experience the future of crypto transactions?",
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

  const handleNavigation = (screen) => {
    setCurrentScreen(screens[screen.toUpperCase()])
  }

  const handleBack = () => {
    setCurrentScreen(screens.DASHBOARD)
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
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
        <Dashboard onNavigate={handleNavigation} />
      )}
      {currentScreen === screens.SEND && (
        <SendMoney
          onBack={handleBack}
          onSend={() => setCurrentScreen(screens.CONFIRMATION)}
        />
      )}
      {currentScreen === screens.CONFIRMATION && (
        <Confirmation
          onBack={() => setCurrentScreen(screens.SEND)}
          onConfirm={() => setCurrentScreen(screens.SUCCESS)}
          amount={transactionDetails.amount}
          receiver={transactionDetails.receiver}
        />
      )}
      {currentScreen === screens.SUCCESS && (
        <Success
          onBack={() => setCurrentScreen(screens.DASHBOARD)}
          amount={transactionDetails.amount}
          receiver={transactionDetails.receiver}
        />
      )}
    </div>
  )
}

export default App