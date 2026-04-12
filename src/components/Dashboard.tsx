import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { challengesApi } from '../api/challenges'
import { BotSelector } from './BotSelector'
import { ManageGroupsTab } from './ManageGroupsTab'
import { SubmitLogsTab } from './SubmitLogsTab'
import { TrackingResultsTab } from './TrackingResultsTab'
import { AdvancedTab } from './AdvancedTab'
import { AlertCircle } from 'lucide-react'
import type { ChallengeInstance } from '../types'

export function Dashboard() {
  const { currentUser, currentBot } = useAuth()
  const [activeTab, setActiveTab] = useState('manage')
  const [challenges, setChallenges] = useState<ChallengeInstance[]>([])
  const [isLoadingChallenges, setIsLoadingChallenges] = useState(false)

  const loadChallenges = async () => {
    setIsLoadingChallenges(true)
    try {
      const data = await challengesApi.getMyInstances()
      setChallenges(data)
    } catch (error) {
      console.error('Failed to load challenges:', error)
    } finally {
      setIsLoadingChallenges(false)
    }
  }

  useEffect(() => {
    if (currentUser) {
      loadChallenges()
    }
  }, [currentUser])

  if (!currentUser || !currentBot) {
    return (
      <main className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Bot Selected
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Select a bot from the selector at the top to get started
          </p>
          <BotSelector />
        </div>
      </main>
    )
  }

  const tabs = [
    { id: 'manage', label: 'Manage Groups' },
    { id: 'logs', label: 'Submit Logs' },
    { id: 'tracking', label: 'Tracking & Results' },
    { id: 'advanced', label: 'Advanced' },
  ]

  return (
    <main className="min-h-[calc(100vh-200px)] bg-gray-50 dark:bg-gray-950 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Dashboard Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Social Challenges Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Bot: <span className="font-semibold">{currentBot.displayName}</span>
            </p>
          </div>
          <BotSelector />
        </div>

        {/* Tabs Navigation */}
        <div className="mb-6 flex gap-2 flex-wrap bg-white dark:bg-gray-800 rounded-lg p-2 border border-gray-200 dark:border-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          {isLoadingChallenges && activeTab !== 'logs' ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mb-3" />
                <p className="text-gray-600 dark:text-gray-400">Loading challenges...</p>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'manage' && (
                <ManageGroupsTab
                  challenges={challenges}
                  onChallengesUpdate={loadChallenges}
                />
              )}
              {activeTab === 'logs' && <SubmitLogsTab />}
              {activeTab === 'tracking' && (
                <TrackingResultsTab challenges={challenges} />
              )}
              {activeTab === 'advanced' && (
                <AdvancedTab
                  challenges={challenges}
                  onChallengesUpdate={loadChallenges}
                />
              )}
            </>
          )}
        </div>
      </div>
    </main>
  )
}
