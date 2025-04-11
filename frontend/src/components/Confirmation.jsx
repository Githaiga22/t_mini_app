import { ArrowLeft } from 'lucide-react'

function Confirmation({ onBack, onConfirm, amount, receiver }) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-5">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onBack} className="p-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>

        {/* Transaction Details */}
        <div className="bg-[#0F1729] rounded-3xl p-6 mb-8">
          <h2 className="text-center mb-6">You are sending</h2>
          <div className="text-center mb-6">
            <p className="text-4xl font-bold mb-2">0.5 USDT</p>
            <p className="text-gray-400">to {receiver}</p>
          </div>
          <div className="border-t border-white/10 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Gas Fee</span>
              <span>0.003 USDT</span>
            </div>
          </div>
        </div>

        <button
          onClick={onConfirm}
          className="w-full bg-[#00FF7F] text-black font-semibold py-4 rounded-full"
        >
          Confirm Payment
        </button>
      </div>
    </div>
  )
}

export default Confirmation