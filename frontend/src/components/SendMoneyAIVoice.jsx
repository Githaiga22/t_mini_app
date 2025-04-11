import { ArrowLeft, Mic } from 'lucide-react'

function SendMoneyAIVoice({ onBack, onConfirm }) {
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

        {/* Chat Interface */}
        <div className="mb-20">
          <div className="space-y-4">
            {/* AI Messages */}
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                AI
              </div>
              <div className="bg-gray-800 rounded-lg p-3 max-w-[80%]">
                <p>Hi! How can I help you today?</p>
              </div>
            </div>

            {/* User Messages */}
            <div className="flex gap-2 justify-end">
              <div className="bg-[#00FF7F] text-black rounded-lg p-3 max-w-[80%]">
                <p>Send 0.5 USDT to John.base.eth</p>
              </div>
            </div>

            {/* AI Final Confirmation */}
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                AI
              </div>
              <div className="bg-gray-800 rounded-lg p-3 max-w-[80%]">
                <p>Okay, you're about to send 0.5 USDT to John.base.eth. Should I proceed?</p>
              </div>
            </div>
          </div>
        </div>

        {/* Voice Input Area */}
        <div className="fixed bottom-0 left-0 right-0 bg-gray-800 p-4">
          <div className="max-w-md mx-auto flex items-center justify-between gap-4">
            <button className="p-4 rounded-full bg-gray-700">
              <Mic className="w-6 h-6" />
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 bg-[#00FF7F] text-black font-semibold py-3 rounded-full text-center"
            >
              Proceed
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SendMoneyAIVoice