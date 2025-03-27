import { Plus } from 'lucide-react'

function Dashboard() {
  return (
    <div className="min-h-screen bg-dark text-white p-6">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=50&h=50"
              alt="Profile"
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="text-gray-400">Welcome</p>
              <p className="font-semibold">Lissa</p>
            </div>
          </div>
          <button className="bg-primary text-dark px-4 py-2 rounded-full text-sm font-semibold">
            Connect Wallet
          </button>
        </div>

        <div className="bg-gray-900 rounded-2xl p-6 mb-6">
          <div className="flex justify-between items-center mb-2">
            <p className="text-gray-400">Total Balance</p>
            <button className="text-primary">
              <Plus className="w-6 h-6" />
            </button>
          </div>
          <p className="text-3xl font-bold">$1,500.00</p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard