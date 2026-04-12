import { useState } from 'react'
import { challengesApi } from '../api/challenges'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'sonner'
import { Plus, Loader2 } from 'lucide-react'
import type { ChallengeInstance, Threshold } from '../types'

interface ManageGroupsTabProps {
  challenges: ChallengeInstance[]
  onChallengesUpdate: () => void
}

export function ManageGroupsTab({
  challenges,
  onChallengesUpdate,
}: ManageGroupsTabProps) {
  const { currentUser } = useAuth()
  const [isCreating, setIsCreating] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [isJoining, setIsJoining] = useState(false)

  // Form state for creating challenge
  const [formData, setFormData] = useState({
    groupName: '',
    visibility: 'invite_only' as const,
    useThreshold: false,
    metric: 'water_ml' as const,
    target: 2000,
  })

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.groupName.trim()) {
      toast.error('Group name is required')
      return
    }

    setIsCreating(true)
    try {
      const payload = {
        groupName: formData.groupName,
        visibility: formData.visibility,
      } as any

      if (formData.useThreshold) {
        payload.threshold = {
          metric: formData.metric,
          operator: 'gte',
          target: formData.target,
        } as Threshold
      }

      const result = await challengesApi.quickCreate(payload)
      toast.success(`Challenge created: ${result.inviteCode}`)
      setFormData({
        groupName: '',
        visibility: 'invite_only',
        useThreshold: false,
        metric: 'water_ml',
        target: 2000,
      })
      onChallengesUpdate()
    } catch (error) {
      toast.error('Failed to create challenge')
    } finally {
      setIsCreating(false)
    }
  }

  const handleJoinChallenge = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!joinCode.trim()) {
      toast.error('Invite code is required')
      return
    }

    setIsJoining(true)
    try {
      await challengesApi.joinByCode(joinCode)
      toast.success('Successfully joined challenge')
      setJoinCode('')
      onChallengesUpdate()
    } catch (error) {
      toast.error('Failed to join challenge. Check code and try again.')
    } finally {
      setIsJoining(false)
    }
  }

  console.log("challenges", challenges);
  

  return (
    <div className="space-y-6">
      {/* Create Challenge Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          <Plus className="w-5 h-5 inline-block mr-2" />
          Create Challenge
        </h3>
        <form onSubmit={handleCreateChallenge} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Group Name
            </label>
            <input
              type="text"
              value={formData.groupName}
              onChange={(e) =>
                setFormData({ ...formData, groupName: e.target.value })
              }
              placeholder="Enter group name"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isCreating}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Visibility
              </label>
              <select
                value={formData.visibility}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    visibility: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isCreating}
              >
                <option value="invite_only">Invite Only</option>
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <input
                  type="checkbox"
                  checked={formData.useThreshold}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      useThreshold: e.target.checked,
                    })
                  }
                  disabled={isCreating}
                  className="rounded"
                />
                Use Threshold
              </label>
            </div>
          </div>

          {formData.useThreshold && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Metric
                </label>
                <select
                  value={formData.metric}
                  onChange={(e) =>
                    setFormData({ ...formData, metric: e.target.value as any })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isCreating}
                >
                  <option value="water_ml">Water (ml)</option>
                  <option value="calories">Calories</option>
                  <option value="protein">Protein</option>
                  <option value="carbs">Carbs</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Target
                </label>
                <input
                  type="number"
                  value={formData.target}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      target: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isCreating}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isCreating}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
            Create Challenge
          </button>
        </form>
      </div>

      {/* Join Challenge Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Join Challenge
        </h3>
        <form onSubmit={handleJoinChallenge} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Invite Code
            </label>
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="e.g., CHX89K9"
              maxLength={10}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
              disabled={isJoining}
            />
          </div>
          <button
            type="submit"
            disabled={isJoining}
            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isJoining && <Loader2 className="w-4 h-4 animate-spin" />}
            Join Challenge
          </button>
        </form>
      </div>

      {/* Challenges List Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Joined Challenges
        </h3>
        {challenges.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No challenges joined yet
          </p>
        ) : (
          <div className="space-y-3">
            {challenges.map((challenge) => (
              <div
                key={challenge.id}
                className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {challenge.title}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Code: <span className="font-mono">{challenge.group?.inviteCode || 'N/A'}</span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Role: <span className="font-semibold capitalize">{challenge.group?.role || 'member'}</span>
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    challenge.status === 'active'
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100'
                  }`}
                >
                  {challenge.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
