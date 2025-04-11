import { ArrowLeft, Check } from 'lucide-react'

function Success({ onBack, onViewMessage, onDashboard, amount, receiver }) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-5">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-12">
          <button onClick={onBack} className="p-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>

        {/* Success Message */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 rounded-full bg-[#00FF7F] flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-black" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Transaction Successful</h2>
          <p className="text-gray-400">
            you sent {amount} USDT to {receiver}
          </p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={onViewMessage}
            className="w-full bg-[#00FF7F] text-black font-semibold py-4 rounded-full"
          >
            View Telegram message
          </button>
          <button 
            onClick={onDashboard}
            className="w-full bg-white/10 text-white font-semibold py-4 rounded-full"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}

export default Success