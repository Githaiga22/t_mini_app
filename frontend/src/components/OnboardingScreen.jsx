import { Circle } from 'lucide-react'

function OnboardingScreen({ data, onNext, currentStep, totalSteps }) {
  return (
    <div className="relative min-h-screen bg-dark text-white overflow-hidden">
      <div className="onboarding-curve" />
      
      <div className="relative z-10 flex flex-col items-center px-6 pt-20">
        <div className="w-64 h-64 rounded-full bg-gray-800 flex items-center justify-center mb-8 overflow-hidden">
          <img
            src={data.illustration}
            alt={data.title}
            className="w-full h-full object-cover"
          />
        </div>
        
        <h2 className="text-2xl font-bold text-center mb-4">{data.title}</h2>
        <p className="text-center text-gray-400 mb-8">{data.description}</p>
        
        <div className="flex space-x-2 mb-8">
          {[...Array(totalSteps)].map((_, index) => (
            <Circle
              key={index}
              className={`w-2 h-2 ${
                index === currentStep ? 'fill-primary' : 'fill-gray-600'
              }`}
            />
          ))}
        </div>
        
        <button
          onClick={onNext}
          className="w-full max-w-xs bg-primary text-dark font-semibold py-3 rounded-full hover:bg-opacity-90 transition-colors"
        >
          {currentStep === totalSteps - 1 ? 'Go to Dashboard' : 'Next'}
        </button>
      </div>
    </div>
  )
}

export default OnboardingScreen
