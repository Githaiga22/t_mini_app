import { ArrowLeft, Send } from 'lucide-react'

function SendMoneyAIText({ onBack, onNext }) {
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
                <p>Send money to John.base.eth</p>
              </div>
            </div>

            {/* AI Response */}
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                AI
              </div>
              <div className="bg-gray-800 rounded-lg p-3 max-w-[80%]">
                <p>Sure! How much would you like to send?</p>
              </div>
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="fixed bottom-0 left-0 right-0 bg-gray-800 p-4">
          <div className="max-w-md mx-auto flex items-center gap-2">
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 bg-gray-700 rounded-full px-4 py-2 outline-none"
            />
            <button
              onClick={onNext}
              className="p-2 bg-[#00FF7F] rounded-full"
            >
              <Send className="w-6 h-6 text-black" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SendMoneyAIText