import { ArrowLeft } from 'lucide-react'

function Message({ onBack, amount, receiver }) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-5">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onBack} className="p-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold">Transaction Details</h1>
        </div>

        {/* Transaction Card */}
        <div className="bg-[#0F1729] rounded-3xl p-6 mb-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Amount</span>
              <span className="font-semibold">{amount} USDT</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Receiver</span>
              <span className="font-semibold">{receiver}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Gas Fee</span>
              <span className="font-semibold">0.003 USDT</span>
            </div>
            <div className="border-t border-white/10 my-4"></div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Transaction Hash</span>
              <span className="font-mono text-sm text-[#00FF7F]">0x1234...5678</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Block Number</span>
              <span className="font-mono">#14,235,678</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Status</span>
              <span className="text-[#00FF7F]">Confirmed</span>
            </div>
          </div>
        </div>

        <button
          onClick={onBack}
          className="w-full bg-white/10 text-white font-semibold py-4 rounded-full"
        >
          Back to Success
        </button>
      </div>
    </div>
  )
}

export default Message