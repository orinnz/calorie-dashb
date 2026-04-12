import { useEffect, useState } from 'react'
import { challengesApi } from '../api/challenges'
import { toast } from 'sonner'
import { Loader2, TrendingUp } from 'lucide-react'
import type { ChallengeInstance, LeaderboardEntry, ChallengeState } from '../types'

interface TrackingResultsTabProps {
  challenges: ChallengeInstance[]
}

export function TrackingResultsTab({ challenges }: TrackingResultsTabProps) {
  const [selectedChallenge, setSelectedChallenge] = useState<ChallengeInstance | null>(
    challenges.length > 0 ? challenges[0] : null
  )
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  )

  const [state, setState] = useState<ChallengeState | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (selectedChallenge) {
      setSelectedChallenge(selectedChallenge)
    }
  }, [challenges])

  const loadData = async () => {
    if (!selectedChallenge) return

    setIsLoading(true)
    try {
      const [stateData, leaderboardData] = await Promise.all([
        challengesApi.getState(selectedChallenge.instanceId, selectedDate),
        challengesApi.getLeaderboard(selectedChallenge.instanceId, 1, 50),
      ])
      setState(stateData)
      setLeaderboard(leaderboardData.data)
    } catch (error) {
      toast.error('Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [selectedChallenge, selectedDate])

  return (
    <div className="space-y-6">
      {/* Challenge Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select Challenge
        </label>
        <select
          value={selectedChallenge?.id || ''}
          onChange={(e) => {
            const challenge = challenges.find((c) => c.id === e.target.value)
            setSelectedChallenge(challenge || null)
          }}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select a challenge...</option>
          {challenges.map((challenge) => (
            <option key={challenge.id} value={challenge.id}>
              {challenge.title}
            </option>
          ))}
        </select>
      </div>

      {selectedChallenge && (
        <>
          {/* Date Selector */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Daily State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
            </div>
          ) : state ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Daily Status
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Date
                  </p>
                  <p className="text-lg font-mono text-gray-900 dark:text-white">
                    {state.date}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Rule Type
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {state.ruleType}
                  </p>
                </div>

                {state.temporary && (
                  <>
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Status
                      </p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                          state.temporary.status === 'PASS_TEMP'
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100'
                            : state.temporary.status === 'FAIL_TEMP'
                              ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100'
                              : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100'
                        }`}
                      >
                        {state.temporary.status}
                      </span>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        Progress
                      </p>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-1">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{
                            width: `${Math.min(
                              (state.temporary.progress / state.temporary.target) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {state.temporary.progress} / {state.temporary.target}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {state.display && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">
                    Display Info
                  </p>
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    Badge: <span className="font-semibold">{state.display.badge}</span> •
                    Locked: <span className="font-semibold">{state.display.isLockedForDate ? 'Yes' : 'No'}</span>
                  </p>
                </div>
              )}
            </div>
          ) : null}

          {/* Leaderboard */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Leaderboard
            </h3>

            {leaderboard.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No leaderboard data available
              </p>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((entry, index) => (
                  <div
                    key={entry.userId}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full text-sm font-semibold text-blue-900 dark:text-blue-100">
                        #{index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {entry.displayName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {entry.isAnonymous ? '(Anonymous)' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {entry.totalScore}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {entry.totalPassDays} pass days
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
