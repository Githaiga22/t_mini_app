import { Plus, Home, History, Bell, Settings, Send, ReceiptText, ArrowLeft, Mic } from 'lucide-react'
import { useState } from 'react'

function Dashboard({ onNavigate }) {
  const [showAIPopup, setShowAIPopup] = useState(false)

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white relative">
      <div className="max-w-md mx-auto p-5">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=50&h=50"
              alt="Profile"
              className="w-12 h-12 rounded-full"
            />
            <div>
              <p className="text-gray-400 text-sm">Welcome,</p>
              <p className="font-semibold text-lg">Lissa</p>
            </div>
          </div>
          <button className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-medium">
            Disconnect Wallet
          </button>
        </div>

        {/* AI Command Input */}
        <button 
          onClick={() => setShowAIPopup(true)}
          className="w-full bg-white/5 rounded-full p-3 mb-6 flex items-center gap-2 border border-white/10"
        >
          <div className="flex-1 flex items-center gap-2">
            <Mic className="w-5 h-5 text-gray-400" />
            <span className="text-gray-400">Use AI to send money now</span>
          </div>
        </button>

        {/* Balance Card */}
        <div className="bg-[#0F1729] rounded-3xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-400">Total Balance</p>
            <div className="flex items-center gap-1">
              <span>USD</span>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <p className="text-4xl font-bold mb-4">1,500.00</p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Available Asset</span>
            <div className="flex -space-x-1">
              <img src="https://cryptologos.cc/logos/bitcoin-btc-logo.png" className="w-5 h-5" alt="BTC" />
              <img src="https://cryptologos.cc/logos/ethereum-eth-logo.png" className="w-5 h-5" alt="ETH" />
              <img src="https://cryptologos.cc/logos/tether-usdt-logo.png" className="w-5 h-5" alt="USDT" />
            </div>
            <button className="ml-auto text-[#00FF7F]">View more</button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <button className="flex flex-col items-center gap-2" onClick={() => onNavigate('receive')}>
            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm">Receive</span>
          </button>
          <button className="flex flex-col items-center gap-2" onClick={() => onNavigate('send')}>
            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
              <Send className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm">Send</span>
          </button>
          <button className="flex flex-col items-center gap-2" onClick={() => onNavigate('convert')}>
            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
              <ReceiptText className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm">Convert</span>
          </button>
        </div>

        {/* Recent Transactions */}
        <div className="mb-20">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Recent Transactions</h3>
            <button className="text-sm text-gray-400">See all</button>
          </div>
          <div className="space-y-4">
            {[
              { type: 'Sent', amount: '-20.84', to: 'John.base.eth', icon: 'S' },
              { type: 'Sent', amount: '-200.84', to: 'Jane.base.eth', icon: 'J' },
              { type: 'Received', amount: '+150.00', from: 'Tom.base.eth', icon: 'T' }
            ].map((transaction, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                    {transaction.icon}
                  </div>
                  <div>
                    <p className="font-medium">{transaction.type}</p>
                    <p className="text-sm text-gray-400">
                      {transaction.to ? `To ${transaction.to}` : `From ${transaction.from}`}
                    </p>
                  </div>
                </div>
                <p className={`font-medium ${transaction.amount.startsWith('-') ? 'text-red-500' : 'text-green-500'}`}>
                  {transaction.amount}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-[#0F1729] p-4">
          <div className="max-w-md mx-auto flex justify-between items-center">
            <button className="flex flex-col items-center gap-1">
              <Home className="w-6 h-6" />
              <span className="text-xs">Home</span>
            </button>
            <button className="flex flex-col items-center gap-1">
              <History className="w-6 h-6" />
              <span className="text-xs">History</span>
            </button>
            <button className="flex flex-col items-center gap-1">
              <Bell className="w-6 h-6" />
              <span className="text-xs">Notification</span>
            </button>
            <button className="flex flex-col items-center gap-1">
              <Settings className="w-6 h-6" />
              <span className="text-xs">Settings</span>
            </button>
          </div>
        </div>

        {/* AI Assistant Popup */}
        {showAIPopup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-[#0F1729] rounded-3xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">AI Assistant</h3>
                <button onClick={() => setShowAIPopup(false)} className="text-gray-400">
                  ✕
                </button>
              </div>
              <div className="flex items-center gap-2 bg-white/5 rounded-full p-3 border border-white/10">
                <Mic className="w-5 h-5 text-[#00FF7F]" />
                <input
                  type="text"
                  placeholder="Speak or type your command..."
                  className="bg-transparent flex-1 outline-none"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard