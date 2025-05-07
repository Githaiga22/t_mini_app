import { useState } from 'react'
import { MessageCircle, Bot, Rocket } from 'lucide-react'
import SplashScreen from './components/SplashScreen.jsx'
import OnboardingScreen from './components/OnboardingScreen.jsx'
import Dashboard from './components/Dashboard.jsx'
import SendMoney from './components/SendMoney.jsx'
import SendMoneyAI from './components/SendMoneyAI.jsx'
import SendMoneyAIText from './components/SendMoneyAIText.jsx'
import SendMoneyAIVoice from './components/SendMoneyAIVoice.jsx'
import Confirmation from './components/Confirmation.jsx'
import Success from './components/Success.jsx'
import Message from './components/Message.jsx'
import VoiceChat from './components/VoiceChat.jsx'

const screens = {
  SPLASH: 'splash',
  ONBOARDING: 'onboarding',
  DASHBOARD: 'dashboard',
  SEND: 'send',
  SEND_AI: 'send_ai',
  SEND_AI_TEXT: 'send_ai_text',
  SEND_AI_VOICE: 'send_ai_voice',
  CONFIRMATION: 'confirmation',
  SUCCESS: 'success',
  MESSAGE: 'message',
  VOICE_CHAT: 'voice_chat'
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
      illustration: "/image1.png"
    },
    {
      title: "Fast, Secure & Seamless Transactions",
      description: "Our AI makes sending crypto via your Domain name seamless",
      illustration: "/image2.png"
    },
    {
      title: "Let's Get Started!",
      description: "Ready to experience the future of crypto transactions?",
      illustration: "/image3.png"
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

  const handleSendMoneyAction = (type) => {
    if (type === 'ai') {
      setCurrentScreen(screens.SEND_AI)
    } else {
      setCurrentScreen(screens.CONFIRMATION)
    }
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
      {currentScreen === screens.VOICE_CHAT && (
        <VoiceChat onBack={() => setCurrentScreen(screens.DASHBOARD)} />
      )}
       {currentScreen === screens.SEND && (
        <SendMoney
          onBack={handleBack}
          onSend={handleSendMoneyAction}
          onNavigate={handleNavigation}
        />
      )}
      {currentScreen === screens.SEND_AI && (
        <SendMoneyAI
          onBack={() => setCurrentScreen(screens.SEND)}
          onNext={() => setCurrentScreen(screens.SEND_AI_TEXT)}
        />
      )}
      {currentScreen === screens.SEND_AI_TEXT && (
        <SendMoneyAIText
          onBack={() => setCurrentScreen(screens.SEND_AI)}
          onNext={() => setCurrentScreen(screens.SEND_AI_VOICE)}
        />
      )}
      {currentScreen === screens.SEND_AI_VOICE && (
        <SendMoneyAIVoice
          onBack={() => setCurrentScreen(screens.SEND_AI_TEXT)}
          onConfirm={() => setCurrentScreen(screens.CONFIRMATION)}
        />
      )}
      {currentScreen === screens.CONFIRMATION && (
        <Confirmation
          onBack={() => setCurrentScreen(screens.SEND_AI_VOICE)}
          onConfirm={() => setCurrentScreen(screens.SUCCESS)}
          amount={transactionDetails.amount}
          receiver={transactionDetails.receiver}
        />
      )}
      {currentScreen === screens.SUCCESS && (
        <Success
          onBack={() => setCurrentScreen(screens.DASHBOARD)}
          onViewMessage={() => setCurrentScreen(screens.MESSAGE)}
          onDashboard={() => setCurrentScreen(screens.DASHBOARD)}
          amount={transactionDetails.amount}
          receiver={transactionDetails.receiver}
        />
      )}
      {currentScreen === screens.MESSAGE && (
        <Message
          onBack={() => setCurrentScreen(screens.SUCCESS)}
          amount={transactionDetails.amount}
          receiver={transactionDetails.receiver}
        />
      )}
    </div>
  )
}

export default App