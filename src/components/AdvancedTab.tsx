import { useState } from 'react'
import { challengesApi } from '../api/challenges'
import { toast } from 'sonner'
import { Settings, Loader2, AlertTriangle } from 'lucide-react'
import type { ChallengeInstance } from '../types'
import { getApiErrorMessage } from '../api/errors'

interface AdvancedTabProps {
  challenges: ChallengeInstance[]
  onChallengesUpdate: () => void
}

function toLocalIsoWithOffset(dateTimeLocal: string): string {
  const date = new Date(dateTimeLocal)
  if (Number.isNaN(date.getTime())) {
    throw new Error('Thời gian không hợp lệ')
  }

  const pad = (num: number) => String(num).padStart(2, '0')
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())
  const seconds = pad(date.getSeconds())

  const offsetMinutes = -date.getTimezoneOffset()
  const sign = offsetMinutes >= 0 ? '+' : '-'
  const absOffset = Math.abs(offsetMinutes)
  const offsetHours = pad(Math.floor(absOffset / 60))
  const offsetMins = pad(absOffset % 60)

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${sign}${offsetHours}:${offsetMins}`
}

export function AdvancedTab({ challenges, onChallengesUpdate }: AdvancedTabProps) {
  const [selectedChallenge, setSelectedChallenge] = useState<ChallengeInstance | null>(
    null
  )
  const [endDateInput, setEndDateInput] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  // Filter challenges where user is owner
  const ownerChallenges = challenges.filter((c) => c.group?.role === 'owner')

  const handleUpdateChallenge = async (payload: {
    visibility?: 'public' | 'private' | 'invite_only'
    endDate?: string
  }) => {
    if (!selectedChallenge) return

    const instanceId = selectedChallenge.instanceId || selectedChallenge.id

    setIsUpdating(true)
    try {
      const result = await challengesApi.updateChallenge(instanceId, payload)
      toast.success(result.message || 'Đã cập nhật challenge')
      onChallengesUpdate()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không thể cập nhật challenge'))
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCancelChallenge = async () => {
    if (!selectedChallenge) return

    const instanceId = selectedChallenge.instanceId || selectedChallenge.id

    setIsCancelling(true)
    try {
      const result = await challengesApi.cancelChallenge(instanceId)
      toast.success((result as { message?: string }).message || 'Đã hủy challenge')
      setShowCancelConfirm(false)
      onChallengesUpdate()
      setSelectedChallenge(null)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không thể hủy challenge'))
    } finally {
      setIsCancelling(false)
    }
  }

  const handleUpdateEndDate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!endDateInput) {
      toast.error('Vui lòng chọn ngày giờ kết thúc')
      return
    }

    const isoDate = toLocalIsoWithOffset(endDateInput)
    await handleUpdateChallenge({ endDate: isoDate })
  }

  const handleLeaveGroup = async (challenge: ChallengeInstance) => {
    if (!challenge.group) return

    const confirmLeave = window.confirm(
      `Rời khỏi "${challenge.title}"? Bạn sẽ không còn thấy challenge này nữa.`
    )
    if (!confirmLeave) return

    try {
      const result = await challengesApi.leaveGroup(challenge.group.id)
      toast.success((result as { message?: string }).message || 'Đã rời challenge')
      onChallengesUpdate()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không thể rời challenge'))
    }
  }

  return (
    <div className="space-y-6">
      {ownerChallenges.length === 0 ? (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6 text-center">
          <Settings className="w-8 h-8 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
          <p className="text-blue-900 dark:text-blue-100">
            Cài đặt nâng cao chỉ áp dụng cho challenge bạn tạo
          </p>
        </div>
      ) : (
        <>
          {/* Owner Challenge Selector */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Chọn challenge (chỉ chủ nhóm)
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
              <option value="">Chọn challenge bạn sở hữu...</option>
              {ownerChallenges.map((challenge) => (
                <option key={challenge.id} value={challenge.id}>
                  {challenge.title} (Chủ nhóm)
                </option>
              ))}
            </select>
          </div>

          {selectedChallenge && (
            <>
              {/* Visibility Management */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Quản lý quyền hiển thị
                </h3>

                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Challenge: <span className="font-semibold">{selectedChallenge.title}</span>
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Quyền hiện tại:{' '}
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
                        handleUpdateChallenge({ visibility: visibility as 'public' | 'private' | 'invite_only' })
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
                  <p>• <span className="font-semibold">Public:</span> Ai cũng có thể tham gia</p>
                  <p>• <span className="font-semibold">Private:</span> Chỉ mời, không hiển thị tìm kiếm</p>
                  <p>• <span className="font-semibold">Invite Only:</span> Bắt buộc có mã mời</p>
                </div>

                <form onSubmit={handleUpdateEndDate} className="mt-4 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
                  <input
                    type="datetime-local"
                    value={endDateInput}
                    onChange={(e) => setEndDateInput(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition disabled:opacity-50"
                  >
                    Cập nhật giờ kết thúc
                  </button>
                </form>
              </div>

              {/* Cancel Challenge Section */}
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 p-6">
                <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Vùng nguy hiểm
                </h3>

                {!showCancelConfirm ? (
                  <div>
                    <p className="text-sm text-red-800 dark:text-red-200 mb-4">
                      Hủy challenge này. Hành động không thể hoàn tác. Tất cả thành viên sẽ không thể tiếp tục theo dõi tiến độ.
                    </p>
                    <button
                      onClick={() => setShowCancelConfirm(true)}
                      disabled={isCancelling}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition disabled:opacity-50"
                    >
                      Hủy challenge
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm font-semibold text-red-900 dark:text-red-100">
                      Bạn chắc chắn chứ? Challenge "{selectedChallenge.title}" sẽ kết thúc vĩnh viễn.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={handleCancelChallenge}
                        disabled={isCancelling}
                        className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isCancelling && <Loader2 className="w-4 h-4 animate-spin" />}
                        Xác nhận hủy challenge
                      </button>
                      <button
                        onClick={() => setShowCancelConfirm(false)}
                        disabled={isCancelling}
                        className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium transition disabled:opacity-50"
                      >
                        Không, giữ lại
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
            Rời challenge
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
                    Vai trò: <span className="capitalize">{challenge.group?.role}</span>
                  </p>
                </div>
                <button
                  onClick={() => handleLeaveGroup(challenge)}
                  className="px-3 py-1 text-sm bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 text-red-700 dark:text-red-100 rounded-lg font-medium transition"
                >
                  Rời nhóm
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
