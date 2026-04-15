import { useEffect, useState } from 'react'
import { challengesApi } from '../api/challenges'
import { toast } from 'sonner'
import { Plus, Loader2, Users, Copy, Check, Shield, Globe } from 'lucide-react'
import type { ChallengeInstance, Threshold, PublicChallengeListItem } from '../types'
import { getApiErrorMessage } from '../api/errors'

interface ManageGroupsTabProps {
  challenges: ChallengeInstance[]
  onChallengesUpdate: () => void
}

export function ManageGroupsTab({
  challenges,
  onChallengesUpdate,
}: ManageGroupsTabProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [isJoining, setIsJoining] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  // Public challenges state
  const [publicChallenges, setPublicChallenges] = useState<PublicChallengeListItem[]>([])
  const [isLoadingPublic, setIsLoadingPublic] = useState(false)

  // Form state for creating challenge
  const [formData, setFormData] = useState({
    groupName: '',
    visibility: 'invite_only' as const,
    durationDays: 7,
    useThreshold: false,
    metric: 'water_ml' as const,
    target: 2000,
  })

  useEffect(() => {
    loadPublicChallenges()
  }, [])

  const loadPublicChallenges = async () => {
    setIsLoadingPublic(true)
    try {
      const response = await challengesApi.listPublic(1, 10)
      setPublicChallenges(response.data)
    } catch (error) {
      console.error('Không thể tải challenge công khai:', error)
    } finally {
      setIsLoadingPublic(false)
    }
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    toast.success('Đã sao chép mã mời')
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const handleJoinPublic = async (groupId: string) => {
    setIsJoining(true)
    try {
      await challengesApi.joinGroup(groupId)
      toast.success('Tham gia challenge thành công')
      onChallengesUpdate()
      loadPublicChallenges()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không thể tham gia challenge'))
    } finally {
      setIsJoining(false)
    }
  }

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.groupName.trim()) {
      toast.error('Vui lòng nhập tên nhóm')
      return
    }

    setIsCreating(true)
    try {
      const payload = {
        groupName: formData.groupName,
        visibility: formData.visibility,
        durationDays: formData.durationDays,
      } as any

      if (formData.useThreshold) {
        payload.threshold = {
          metric: formData.metric,
          operator: 'gte',
          target: formData.target,
        } as Threshold
      }

      const result = await challengesApi.quickCreate(payload)
      const successMessage =
        (result as { message?: string }).message ||
        `Đã tạo challenge. Mã mời: ${result.group?.inviteCode || result.inviteCode || 'N/A'}`
      toast.success(successMessage)
      setFormData({
        groupName: '',
        visibility: 'invite_only',
        durationDays: 7,
        useThreshold: false,
        metric: 'water_ml',
        target: 2000,
      })
      onChallengesUpdate()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không thể tạo challenge'))
    } finally {
      setIsCreating(false)
    }
  }

  const handleJoinChallenge = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!joinCode.trim()) {
      toast.error('Vui lòng nhập mã mời')
      return
    }

    setIsJoining(true)
    try {
      const result = await challengesApi.joinByCode(joinCode)
      const successMessage =
        result.message || (result.joined ? 'Tham gia challenge thành công' : 'Yêu cầu tham gia đã được xử lý')
      toast.success(successMessage)
      setJoinCode('')
      onChallengesUpdate()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không thể tham gia challenge. Vui lòng kiểm tra mã mời.'))
    } finally {
      setIsJoining(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Create Challenge Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          <Plus className="w-5 h-5 inline-block mr-2" />
          Tạo challenge
        </h3>
        <form onSubmit={handleCreateChallenge} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tên nhóm
            </label>
            <input
              type="text"
              value={formData.groupName}
              onChange={(e) =>
                setFormData({ ...formData, groupName: e.target.value })
              }
              placeholder="Nhập tên nhóm"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isCreating}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Quyền hiển thị
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
                <option value="invite_only">Chỉ qua mã mời</option>
                <option value="public">Công khai</option>
                <option value="private">Riêng tư</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Số ngày
              </label>
              <input
                type="number"
                min={1}
                max={365}
                value={formData.durationDays}
                onChange={(e) =>
                  setFormData({ ...formData, durationDays: Math.max(1, parseInt(e.target.value) || 7) })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isCreating}
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
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
              Dùng điều kiện ngưỡng (số cụ thể)
            </label>
          </div>

          {formData.useThreshold && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Chỉ số
                </label>
                <select
                  value={formData.metric}
                  onChange={(e) =>
                    setFormData({ ...formData, metric: e.target.value as any })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isCreating}
                >
                  <option value="water_ml">Nước (ml)</option>
                  <option value="calories">Calories</option>
                  <option value="protein">Protein</option>
                  <option value="carbs">Carbs</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mục tiêu
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
            Tạo challenge
          </button>
        </form>
      </div>

      {/* Join Challenge Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Tham gia challenge
        </h3>
        <form onSubmit={handleJoinChallenge} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mã mời
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
            Tham gia challenge
          </button>
        </form>
      </div>

      {/* Challenges List Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Shield className="w-6 h-6 text-blue-600" />
          Challenge đã tham gia
        </h3>
        {challenges.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">Bạn chưa tham gia challenge nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {challenges.map((challenge) => (
              <div
                key={challenge.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-2xl">
                      {challenge.emoji || '🏆'}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white leading-tight">
                        {challenge.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          challenge.visibility === 'public' 
                            ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300' 
                            : 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
                        }`}>
                          {challenge.visibility === 'public' ? 'Công khai' : 'Riêng tư'}
                        </span>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                          {challenge.group?.role === 'owner' ? 'Chủ sở hữu' : 'Thành viên'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-1 rounded-md font-bold uppercase ${
                    challenge.status === 'active'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    {challenge.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2 border border-gray-100 dark:border-gray-800">
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold mb-1">Điểm của bạn</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-black text-blue-600 dark:text-blue-400">
                        {challenge.totalScore || 0}
                      </span>
                      <span className="text-[10px] text-gray-500">điểm</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2 border border-gray-100 dark:border-gray-800">
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold mb-1">Ngày đạt</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                        {challenge.totalPassDays || 0}
                      </span>
                      <span className="text-[10px] text-gray-500">ngày</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Mã mời:</span>
                    <code className="text-xs font-mono font-bold bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded text-blue-600 dark:text-blue-400">
                      {challenge.group?.inviteCode || 'N/A'}
                    </code>
                    {challenge.group?.inviteCode && (
                      <button
                        onClick={() => handleCopyCode(challenge.group.inviteCode!)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
                      >
                        {copiedCode === challenge.group.inviteCode ? (
                          <Check className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-gray-400 hover:text-blue-500" />
                        )}
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-gray-400">
                    <Users className="w-3 h-3" />
                    <span>Thành viên</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Public Challenges Section */}
      <div className="space-y-4 pt-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Globe className="w-6 h-6 text-emerald-600" />
          Challenge công khai
        </h3>
        
        {isLoadingPublic ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : publicChallenges.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">Không có challenge công khai nào khả dụng</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {publicChallenges.map((pc) => {
              const isJoined = challenges.some(c => c.id === pc.id || c.instanceId === pc.id);
              return (
                <div
                  key={pc.id}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center text-xl">
                        {pc.emoji || '🌍'}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">
                          {pc.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Users className="w-3 h-3 text-gray-400" />
                          <span className="text-[10px] text-gray-500 font-medium">
                            {pc.memberCount} thành viên
                          </span>
                        </div>
                      </div>
                    </div>
                    {isJoined && (
                      <span className="text-[10px] px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded font-bold uppercase">
                        Đã tham gia
                      </span>
                    )}
                  </div>
                  
                  <button
                    disabled={isJoined || isJoining}
                    onClick={() => handleJoinPublic(pc.groupId)}
                    className={`w-full py-2 rounded-lg font-bold text-sm transition flex items-center justify-center gap-2 ${
                      isJoined 
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow-emerald-500/20 shadow-emerald-500/10'
                    }`}
                  >
                    {isJoining && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isJoined ? 'Bạn đã trong nhóm' : 'Tham gia ngay'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  )
}
