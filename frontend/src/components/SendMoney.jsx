import { ArrowLeft, Mic } from 'lucide-react'
import { useState } from 'react'

function SendMoney({ onBack, onSend, onNavigate }) {
  const [amount, setAmount] = useState('0.5')
  const [receiver, setReceiver] = useState('John.base.eth')

  const handleSendMoney = () => {
    // Go directly to confirmation screen
    onSend()
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-5">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={onBack} className="p-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold">Send money</h1>
        </div>

        {/* AI Button */}
        <button 
          onClick={() => onNavigate('voice_chat')}
          className="w-full bg-white/5 rounded-full p-3 mb-8 flex items-center gap-2 border border-white/10"
        >
          <Mic className="w-5 h-5 text-[#00FF7F]" />
          <span>Use AI to send money now</span>
        </button>

        {/* Pay with section */}
        <div className="mb-8">
          <p className="text-gray-400 mb-2">Pay with</p>
          <div className="flex items-center gap-2 mb-4">
            <button className="bg-white/10 px-4 py-2 rounded-full flex items-center gap-2">
              <img src="./tether-usdt-logo.png" className="w-5 h-5" alt="USDT" />
              <span>USDT</span>
            </button>
            <span className="text-gray-400">Balance: 1,235</span>
          </div>
          <div className="flex items-center gap-4 mb-2">
            <button className="px-4 py-2 rounded-full border border-[#00FF7F] text-[#00FF7F]">MAX</button>
            <button className="px-4 py-2 rounded-full border border-white/20">50%</button>
          </div>
          <input
            type="text"
            placeholder="Input amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-transparent border-b border-white/20 py-2 outline-none"
          />
        </div>

        {/* Receiver section */}
        <div className="mb-8">
          <p className="text-gray-400 mb-2">Receiver</p>
          <input
            type="text"
            placeholder="Input Domain Name"
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
            className="w-full bg-white/5 rounded-full p-3 outline-none"
          />
        </div>

        <button
          onClick={handleSendMoney}
          className="w-full bg-[#00FF7F] text-black font-semibold py-4 rounded-full"
        >
          Send Money
        </button>
      </div>
    </div>
  )
}

export default SendMoney