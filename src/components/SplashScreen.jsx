import { Zap } from 'lucide-react'
import { useEffect } from 'react'

function SplashScreen({ onComplete }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete()
    }, 20000)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-dark text-white">
      <div className="flex items-center space-x-2 text-4xl font-bold">
        <Zap className="w-12 h-12 text-primary" />
        <span>apBase</span>
      </div>
    </div>
  )
}

export default SplashScreen