import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Bot } from '../types'
import { getApiErrorMessage } from '../api/errors'

export function BotSelector() {
  const { currentBot, bots, loginAsBot, logout, isLoading } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const handleBotSelect = async (bot: Bot) => {
    if (currentBot?.id === bot.id) {
      setIsOpen(false)
      return
    }

    try {
      await loginAsBot(bot)
      toast.success(`Đăng nhập bot: ${bot.displayName}`)
      setIsOpen(false)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không thể đăng nhập bot'))
    }
  }

  const handleLogout = () => {
    logout()
    toast.success('Đã đăng xuất bot')
    setIsOpen(false)
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50"
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {currentBot ? (
          <>
            <span className="text-sm">{currentBot.displayName}</span>
            <span className="text-xs opacity-75">({currentBot.id.slice(0, 8)})</span>
          </>
        ) : (
          'Chọn bot'
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Danh sách bot
            </h3>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {bots.map((bot) => (
              <button
                key={bot.id}
                onClick={() => handleBotSelect(bot)}
                className={`w-full px-4 py-3 text-left text-sm transition ${
                  currentBot?.id === bot.id
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 border-l-4 border-blue-600'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <div className="font-medium">{bot.displayName}</div>
                <div className="text-xs opacity-75">{bot.id.slice(0, 12)}...</div>
              </button>
            ))}
          </div>

          {currentBot && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-3">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 text-red-700 dark:text-red-100 rounded-lg text-sm font-medium transition"
              >
                <LogOut className="w-4 h-4" />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
