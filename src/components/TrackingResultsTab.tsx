import { useEffect, useState } from 'react'
import { challengesApi } from '../api/challenges'
import { toast } from 'sonner'
import { Loader2, Calendar, ChartBar, Flame, Droplets, Utensils } from 'lucide-react'
import type {
  ChallengeInstance,
  LeaderboardEntry,
  ChallengeHistoryEntry,
  FoodEvaluationStatus,
} from '../types'
import { getApiErrorMessage } from '../api/errors'

interface TrackingResultsTabProps {
  challenges: ChallengeInstance[]
}

export function TrackingResultsTab({ challenges }: TrackingResultsTabProps) {
  const [selectedChallenge, setSelectedChallenge] = useState<ChallengeInstance | null>(
    challenges.length > 0 ? challenges[0] : null
  )
  const [history, setHistory] = useState<ChallengeHistoryEntry[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (challenges.length === 0) {
      setSelectedChallenge(null)
      return
    }

    if (!selectedChallenge) {
      setSelectedChallenge(challenges[0])
      return
    }

    const stillExists = challenges.some((challenge) => challenge.id === selectedChallenge.id)
    if (!stillExists) {
      setSelectedChallenge(challenges[0])
    }
  }, [challenges, selectedChallenge])

  const selectedInstanceId = selectedChallenge
    ? selectedChallenge.instanceId || selectedChallenge.id
    : null
  const isChallengeDone = selectedChallenge?.status === 'completed'

  const challengeStatusBadgeClass =
    selectedChallenge?.status === 'completed'
      ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-100'
      : selectedChallenge?.status === 'active'
        ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100'
        : selectedChallenge?.status === 'cancelled'
          ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100'

  const loadData = async () => {
    if (!selectedInstanceId) return

    setIsLoading(true)
    try {
      const [historyData, leaderboardData] = await Promise.all([
        challengesApi.getHistory(selectedInstanceId),
        challengesApi.getLeaderboard(selectedInstanceId, 1, 50),
      ])

      setHistory(historyData.history)
      setLeaderboard(leaderboardData.data)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không thể tải dữ liệu challenge'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (selectedInstanceId) {
      loadData()
    }
  }, [selectedInstanceId])

  const getEvaluationBadgeClass = (status: FoodEvaluationStatus | null) => {
    if (status === 'eligible') return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100'
    if (status === 'ineligible') return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100'
    if (status === 'unknown') return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100'
    return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100'
  }

  const getEvaluationBadgeLabel = (status: FoodEvaluationStatus | null) => {
    if (status === 'eligible') return 'Hợp lệ'
    if (status === 'ineligible') return 'Không hợp lệ'
    if (status === 'unknown') return 'Chưa chắc chắn'
    return 'Chưa đánh giá'
  }

  const isWaterChallenge = selectedChallenge?.rule?.metric === 'water_ml'

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Chọn challenge
            </label>
            <select
              value={selectedChallenge?.id || ''}
              onChange={(e) => {
                const challenge = challenges.find((c) => c.id === e.target.value)
                setSelectedChallenge(challenge || null)
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Chọn một challenge...</option>
              {challenges.map((challenge) => (
                <option key={challenge.id} value={challenge.id}>
                  {challenge.title}
                </option>
              ))}
            </select>
          </div>

          {selectedChallenge && (
            <div className="flex flex-col items-end gap-1">
              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase ${challengeStatusBadgeClass}`}>
                {selectedChallenge.status}
              </span>
              {isChallengeDone && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  Challenge đã hoàn thành
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {selectedInstanceId && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 px-1">
              <Calendar className="w-5 h-5 text-blue-600" />
              Lịch sử thực hiện & Nhật ký
            </h3>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
                <p className="text-gray-500">Đang tải toàn bộ dữ liệu...</p>
              </div>
            ) : history.length > 0 ? (
              <div className="space-y-4">
                {history.map((entry) => (
                  <div
                    key={entry.date}
                    className={`bg-white dark:bg-gray-800 rounded-xl border shadow-sm overflow-hidden transition hover:shadow-md ${
                      entry.isFinalized 
                        ? 'border-gray-200 dark:border-gray-700' 
                        : 'border-blue-300 dark:border-blue-700 ring-1 ring-blue-100 dark:ring-blue-900/30'
                    }`}
                  >
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/30">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 dark:text-white capitalize">
                            {new Date(entry.date).toLocaleDateString('vi-VN', { 
                              weekday: 'long', 
                              day: '2-digit', 
                              month: '2-digit' 
                            })}
                          </span>
                          {!entry.isFinalized && new Date(entry.date).toDateString() === new Date().toDateString() && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded font-bold uppercase tracking-wider">
                              Hôm nay
                            </span>
                          )}
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          entry.status === 'pass' || entry.status === 'PASS_TEMP'
                            ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                            : entry.status === 'fail' || entry.status === 'FAIL_TEMP'
                              ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
                              : 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
                        }`}>
                          {entry.status === 'pass' || entry.status === 'PASS_TEMP' ? 'Đạt' : 
                           entry.status === 'fail' || entry.status === 'FAIL_TEMP' ? 'Chưa đạt' : 'Đang xử lý'}
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-3">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Tiến độ</span>
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
                              {entry.progress} / {entry.target || selectedChallenge?.rule?.target || '?'} {isWaterChallenge ? 'ml' : ''}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full transition-all duration-500 ${
                                entry.status === 'pass' || entry.status === 'PASS_TEMP' ? 'bg-emerald-500' : 'bg-blue-500'
                              }`}
                              style={{ width: `${Math.min((entry.progress / (entry.target || (selectedChallenge?.rule?.target ?? 1))) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                        <div className="bg-white dark:bg-gray-900 px-3 py-1 rounded-lg border border-gray-100 dark:border-gray-800 flex items-center gap-2">
                          <Flame className="w-4 h-4 text-orange-500" />
                          <span className="text-lg font-black text-gray-900 dark:text-white">{entry.score}</span>
                          <span className="text-[10px] text-gray-500 font-bold uppercase">điểm</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      {/* Render Water Logs */}
                      {entry.waterLogs && entry.waterLogs.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {entry.waterLogs.map((log) => (
                            <div key={log.waterLogId} className="flex items-center gap-3 p-2 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg border border-blue-100/50 dark:border-blue-900/20">
                              <Droplets className="w-4 h-4 text-blue-500" />
                              <div className="flex-1">
                                <p className="text-sm font-bold text-gray-900 dark:text-white">Uống {log.amountMl} ml</p>
                                <p className="text-[10px] text-gray-500">
                                  {new Date(log.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Render Food Evaluations */}
                      {entry.foodEvaluations && entry.foodEvaluations.length > 0 && (
                        <div className="grid grid-cols-1 gap-3">
                          {entry.foodEvaluations.map((food) => (
                            <div key={food.foodLogId} className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-800 transition hover:bg-white dark:hover:bg-gray-900">
                              {food.imageUrl ? (
                                <img src={food.imageUrl} alt={food.foodName || ''} className="w-16 h-16 rounded-md object-cover border border-gray-200 dark:border-gray-700" />
                              ) : (
                                <div className="w-16 h-16 rounded-md bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                                  <Utensils className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">{food.foodName}</h4>
                                    <p className="text-xs text-gray-500">{food.calories} kcal</p>
                                  </div>
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase whitespace-nowrap ${getEvaluationBadgeClass(food.evaluation?.status || null)}`}>
                                    {getEvaluationBadgeLabel(food.evaluation?.status || null)}
                                  </span>
                                </div>
                                {food.evaluation?.reason && (
                                  <p className="mt-1.5 text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                                    {food.evaluation.reason}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {(!entry.foodEvaluations || entry.foodEvaluations.length === 0) && 
                       (!entry.waterLogs || entry.waterLogs.length === 0) && (
                        <p className="text-xs text-gray-400 italic text-center py-2">
                          Không có dữ liệu nhật ký {isWaterChallenge ? 'uống nước' : 'ăn uống'}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center text-gray-500">
                Chưa có dữ liệu thực hiện
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 px-1">
              <ChartBar className="w-5 h-5 text-emerald-600" />
              Bảng xếp hạng
            </h3>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-12 bg-gray-100 dark:bg-gray-900 animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : leaderboard.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">Chưa có thành viên tham gia</p>
              ) : (
                <div className="space-y-2">
                  {leaderboard.map((entry, index) => (
                    <div
                      key={entry.userId}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-800"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-black ${
                          index === 0 ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                          index === 1 ? 'bg-gray-200 text-gray-700' :
                          index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {index + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{entry.displayName}</p>
                          <p className="text-[10px] text-gray-500 font-bold uppercase">{entry.totalPassDays} ngày đạt</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-blue-600 dark:text-blue-400 leading-none">{entry.totalScore}</p>
                        <p className="text-[9px] text-blue-500/70 uppercase font-black tracking-tighter">điểm</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!selectedInstanceId && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center text-gray-500">
          Hãy chọn challenge để bắt đầu theo dõi tiến độ.
        </div>
      )}
    </div>
  )
}