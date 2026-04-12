import { useState } from 'react'
import { challengesApi } from '../api/challenges'
import { toast } from 'sonner'
import { Settings, Loader2, AlertTriangle } from 'lucide-react'
import type { ChallengeInstance } from '../types'

interface AdvancedTabProps {
  challenges: ChallengeInstance[]
  onChallengesUpdate: () => void
}

export function AdvancedTab({ challenges, onChallengesUpdate }: AdvancedTabProps) {
  const [selectedChallenge, setSelectedChallenge] = useState<ChallengeInstance | null>(
    null
  )
  const [isUpdating, setIsUpdating] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  // Filter challenges where user is owner
  const ownerChallenges = challenges.filter((c) => c.group?.role === 'owner')

  const handleVisibilityChange = async (newVisibility: string) => {
    if (!selectedChallenge) return

    setIsUpdating(true)
    try {
      await challengesApi.updateVisibility(selectedChallenge.instanceId, newVisibility)
      toast.success(`Visibility changed to ${newVisibility}`)
      onChallengesUpdate()
    } catch (error) {
      toast.error('Failed to update visibility')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCancelChallenge = async () => {
    if (!selectedChallenge) return

    setIsCancelling(true)
    try {
      await challengesApi.cancelChallenge(selectedChallenge.instanceId)
      toast.success('Challenge cancelled')
      setShowCancelConfirm(false)
      onChallengesUpdate()
      setSelectedChallenge(null)
    } catch (error) {
      toast.error('Failed to cancel challenge')
    } finally {
      setIsCancelling(false)
    }
  }

  const handleLeaveGroup = async (challenge: ChallengeInstance) => {
    if (!challenge.group) return

    const confirmLeave = window.confirm(
      `Leave "${challenge.title}"? You will no longer see this challenge.`
    )
    if (!confirmLeave) return

    try {
      await challengesApi.leaveGroup(challenge.group.id)
      toast.success('Left challenge')
      onChallengesUpdate()
    } catch (error) {
      toast.error('Failed to leave challenge')
    }
  }

  return (
    <div className="space-y-6">
      {ownerChallenges.length === 0 ? (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6 text-center">
          <Settings className="w-8 h-8 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
          <p className="text-blue-900 dark:text-blue-100">
            Advanced settings are only available for challenges you created
          </p>
        </div>
      ) : (
        <>
          {/* Owner Challenge Selector */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Challenge (Owner Only)
            </label>
            <select
              value={selectedChallenge?.id || ''}
              onChange={(e) => {
                const challenge = ownerChallenges.find((c) => c.id === e.target.value)
                setSelectedChallenge(challenge || null)
                setShowCancelConfirm(false)
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a challenge you own...</option>
              {ownerChallenges.map((challenge) => (
                <option key={challenge.id} value={challenge.id}>
                  {challenge.title} (Owner)
                </option>
              ))}
            </select>
          </div>

          {selectedChallenge && (
            <>
              {/* Visibility Management */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Manage Visibility
                </h3>

                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Challenge: <span className="font-semibold">{selectedChallenge.title}</span>
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Current visibility:{' '}
                    <span className="font-mono font-semibold capitalize">
                      {selectedChallenge.visibility || 'invite_only'}
                    </span>
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {['public', 'private', 'invite_only'].map((visibility) => (
                    <button
                      key={visibility}
                      onClick={() =>
                        handleVisibilityChange(visibility)
                      }
                      disabled={
                        isUpdating ||
                        selectedChallenge.visibility === visibility
                      }
                      className={`px-4 py-3 rounded-lg font-medium transition capitalize ${
                        selectedChallenge.visibility === visibility
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                      } disabled:opacity-50`}
                    >
                      {isUpdating && selectedChallenge.visibility !== visibility && (
                        <Loader2 className="w-4 h-4 inline-block mr-2 animate-spin" />
                      )}
                      {visibility.replace('_', ' ')}
                    </button>
                  ))}
                </div>

                <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <p>• <span className="font-semibold">Public:</span> Anyone can join</p>
                  <p>• <span className="font-semibold">Private:</span> Invite only, hidden from search</p>
                  <p>• <span className="font-semibold">Invite Only:</span> Must have invite code</p>
                </div>
              </div>

              {/* Cancel Challenge Section */}
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 p-6">
                <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Danger Zone
                </h3>

                {!showCancelConfirm ? (
                  <div>
                    <p className="text-sm text-red-800 dark:text-red-200 mb-4">
                      Cancel this challenge. This action cannot be undone. All members will be unable to track
                      their progress.
                    </p>
                    <button
                      onClick={() => setShowCancelConfirm(true)}
                      disabled={isCancelling}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition disabled:opacity-50"
                    >
                      Cancel Challenge
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm font-semibold text-red-900 dark:text-red-100">
                      Are you absolutely sure? This will permanently end the challenge "{selectedChallenge.title}".
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={handleCancelChallenge}
                        disabled={isCancelling}
                        className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isCancelling && <Loader2 className="w-4 h-4 animate-spin" />}
                        Yes, Cancel Challenge
                      </button>
                      <button
                        onClick={() => setShowCancelConfirm(false)}
                        disabled={isCancelling}
                        className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium transition disabled:opacity-50"
                      >
                        No, Keep It
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}

      {/* Leave Group for All Challenges */}
      {challenges.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Leave Challenges
          </h3>
          <div className="space-y-2">
            {challenges.map((challenge) => (
              <div
                key={challenge.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {challenge.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Role: <span className="capitalize">{challenge.group?.role}</span>
                  </p>
                </div>
                <button
                  onClick={() => handleLeaveGroup(challenge)}
                  className="px-3 py-1 text-sm bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 text-red-700 dark:text-red-100 rounded-lg font-medium transition"
                >
                  Leave
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
