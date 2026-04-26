import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Bell, BellOff, Loader2, Send, Trash2, Plus, Info, Zap } from 'lucide-react'
import {
  notificationsApi,
  type FcmDebugResult,
  type NotificationOutcome,
  type NotificationPreference,
} from '../api/notifications'
import { getApiErrorMessage } from '../api/errors'

const NOTIFICATION_TYPE_META: Record<
  string,
  { label: string; description: string }
> = {
  challenge_join: {
    label: 'Có người tham gia challenge',
    description: 'Bắn khi user khác join challenge mà bạn đã tạo.',
  },
  challenge_next_round: {
    label: 'Challenge bước sang round mới',
    description: 'Round mới của challenge series đã bắt đầu.',
  },
  challenge_finalize_pass: {
    label: 'Challenge kết thúc — pass',
    description: 'Challenge đã kết thúc và bạn đạt mục tiêu.',
  },
  challenge_finalize_fail: {
    label: 'Challenge kết thúc — fail',
    description: 'Challenge đã kết thúc nhưng bạn chưa đạt mục tiêu.',
  },
  challenge_ending_24h: {
    label: 'Challenge sắp kết thúc trong 24h',
    description: 'Còn 1 ngày trước khi challenge khoá kết quả.',
  },
  daily_food_log_nudge: {
    label: 'Nhắc log đồ ăn cuối ngày',
    description: 'Bắn 19:00–21:00 nếu hôm nay chưa log món nào.',
  },
  streak_at_risk: {
    label: 'Streak sắp mất',
    description:
      'Bắn 20:00–22:00 nếu streak ≥3 ngày và hôm nay vẫn chưa log đồ ăn.',
  },
  weight_log_reminder: {
    label: 'Nhắc cân hằng tuần',
    description: 'Chủ nhật 08:00–10:00 nếu chưa cân hơn 7 ngày.',
  },
}

const CONTEXT_HINTS: Record<string, string> = {
  challenge_join: '{ "instanceId": "...", "joinerId": "...", "challengeTitle": "..." }',
  challenge_next_round: '{ "instanceId": "...", "roundIndex": 2 }',
  challenge_finalize_pass: '{ "instanceId": "...", "challengeTitle": "..." }',
  challenge_finalize_fail: '{ "instanceId": "...", "challengeTitle": "..." }',
  challenge_ending_24h: '{ "instanceId": "...", "challengeTitle": "..." }',
}

const OUTCOME_LABEL: Record<NotificationOutcome, { text: string; tone: string }> = {
  sent: { text: 'Đã gửi qua FCM', tone: 'text-green-700 dark:text-green-300' },
  failed: { text: 'Gửi thất bại', tone: 'text-red-700 dark:text-red-300' },
  skipped_pref: {
    text: 'Bị skip — preference đang tắt',
    tone: 'text-amber-700 dark:text-amber-300',
  },
  skipped_quiet: {
    text: 'Bị skip — đang trong quiet hours',
    tone: 'text-amber-700 dark:text-amber-300',
  },
  skipped_dedup: {
    text: 'Bị skip — trùng dedup key (đã gửi rồi)',
    tone: 'text-amber-700 dark:text-amber-300',
  },
  skipped_no_tokens: {
    text: 'Bị skip — chưa có push token nào active',
    tone: 'text-amber-700 dark:text-amber-300',
  },
  skipped_disabled: {
    text: 'Bị skip — NOTIFICATIONS_ENABLED đang tắt ở backend',
    tone: 'text-amber-700 dark:text-amber-300',
  },
}

export function NotificationsTab() {
  const [preferences, setPreferences] = useState<NotificationPreference[]>([])
  const [isLoadingPrefs, setIsLoadingPrefs] = useState(false)
  const [togglingType, setTogglingType] = useState<string | null>(null)

  const [tokenInput, setTokenInput] = useState('')
  const [platform, setPlatform] = useState<'ios' | 'android' | 'web'>('android')
  const [deviceId, setDeviceId] = useState('')
  const [locale, setLocale] = useState('vi')
  const [appVersion, setAppVersion] = useState('1.0.0-test')
  const [isRegistering, setIsRegistering] = useState(false)
  const [isDeactivating, setIsDeactivating] = useState(false)

  const [testType, setTestType] = useState('')
  const [contextInput, setContextInput] = useState('')
  const [forceSend, setForceSend] = useState(false)
  const [isSendingTest, setIsSendingTest] = useState(false)
  const [lastOutcome, setLastOutcome] = useState<NotificationOutcome | null>(null)

  const [rawToken, setRawToken] = useState('')
  const [rawTitle, setRawTitle] = useState('Debug push')
  const [rawBody, setRawBody] = useState('Raw FCM test from dashboard')
  const [rawDataInput, setRawDataInput] = useState('')
  const [isSendingRaw, setIsSendingRaw] = useState(false)
  const [lastRawResult, setLastRawResult] = useState<FcmDebugResult | null>(null)

  const loadPreferences = async () => {
    setIsLoadingPrefs(true)
    try {
      const data = await notificationsApi.getPreferences()
      setPreferences(data)
      // Re-pick the first type whenever the current selection is missing
      // from the freshly-loaded list — covers the "button stays disabled"
      // case when the very first load failed (testType stayed '') and the
      // user later clicked "Tải lại" to retry.
      const stillValid = testType && data.some((p) => p.type === testType)
      if (data.length > 0 && !stillValid) {
        setTestType(data[0].type)
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không thể tải preferences'))
    } finally {
      setIsLoadingPrefs(false)
    }
  }

  useEffect(() => {
    loadPreferences()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleTogglePreference = async (type: string, nextEnabled: boolean) => {
    setTogglingType(type)
    try {
      await notificationsApi.updatePreference(type, nextEnabled)
      setPreferences((prev) =>
        prev.map((p) => (p.type === type ? { ...p, enabled: nextEnabled } : p))
      )
      toast.success(
        `Đã ${nextEnabled ? 'bật' : 'tắt'} "${
          NOTIFICATION_TYPE_META[type]?.label ?? type
        }"`
      )
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không cập nhật được preference'))
    } finally {
      setTogglingType(null)
    }
  }

  const generateFakeToken = () => {
    const random = crypto.randomUUID().replace(/-/g, '')
    return `fake-fcm-${platform}-${random}`
  }

  const handleRegisterToken = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = tokenInput.trim()
    if (token.length < 10) {
      toast.error('Token tối thiểu 10 ký tự')
      return
    }
    setIsRegistering(true)
    try {
      const result = await notificationsApi.registerPushToken({
        token,
        platform,
        deviceId: deviceId.trim() || undefined,
        locale: locale.trim() || undefined,
        appVersion: appVersion.trim() || undefined,
      })
      toast.success(`Đã đăng ký token (${result.id.slice(0, 8)}…)`)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không đăng ký được token'))
    } finally {
      setIsRegistering(false)
    }
  }

  const handleDeactivateToken = async () => {
    const token = tokenInput.trim()
    if (token.length < 10) {
      toast.error('Nhập token muốn huỷ vào ô trên')
      return
    }
    setIsDeactivating(true)
    try {
      await notificationsApi.deletePushToken(token)
      toast.success('Đã huỷ token')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không huỷ được token'))
    } finally {
      setIsDeactivating(false)
    }
  }

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!testType) {
      toast.error('Chọn một loại notification')
      return
    }
    let context: Record<string, unknown> | undefined
    const raw = contextInput.trim()
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
          throw new Error('Context phải là một JSON object')
        }
        context = parsed as Record<string, unknown>
      } catch (err) {
        toast.error(
          err instanceof Error ? `Context JSON sai: ${err.message}` : 'Context JSON sai'
        )
        return
      }
    }
    setIsSendingTest(true)
    setLastOutcome(null)
    try {
      const result = await notificationsApi.sendTest(testType, {
        context,
        force: forceSend,
      })
      setLastOutcome(result.outcome)
      const meta = OUTCOME_LABEL[result.outcome]
      if (result.outcome === 'sent') {
        toast.success(meta.text)
      } else {
        toast.message(meta.text)
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không bắn được notification'))
    } finally {
      setIsSendingTest(false)
    }
  }

  const handleSendRaw = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = rawToken.trim()
    if (token.length < 10) {
      toast.error('Token tối thiểu 10 ký tự')
      return
    }
    let data: Record<string, unknown> | undefined
    const rawData = rawDataInput.trim()
    if (rawData) {
      try {
        const parsed = JSON.parse(rawData)
        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
          throw new Error('Data phải là một JSON object')
        }
        data = parsed as Record<string, unknown>
      } catch (err) {
        toast.error(
          err instanceof Error ? `Data JSON sai: ${err.message}` : 'Data JSON sai'
        )
        return
      }
    }
    setIsSendingRaw(true)
    setLastRawResult(null)
    try {
      const result = await notificationsApi.fcmDebug({
        token,
        title: rawTitle.trim() || undefined,
        body: rawBody.trim() || undefined,
        data,
      })
      setLastRawResult(result)
      if (result.status === 'sent') {
        toast.success('FCM accept — kiểm tra device.')
      } else if (result.status === 'unregistered') {
        toast.message('FCM trả unregistered — token đã chết.')
      } else {
        toast.error(`FCM fail (HTTP ${result.httpStatus ?? '?'})`)
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không bắn được raw FCM'))
    } finally {
      setIsSendingRaw(false)
    }
  }

  const groupedByCategory: Record<string, NotificationPreference[]> = {}
  for (const pref of preferences) {
    if (!groupedByCategory[pref.category]) groupedByCategory[pref.category] = []
    groupedByCategory[pref.category].push(pref)
  }
  const categoryOrder: Array<NotificationPreference['category']> = [
    'challenge',
    'engagement',
  ]
  const categoryLabel: Record<string, string> = {
    challenge: 'Challenges',
    engagement: 'Engagement',
  }

  return (
    <div className="space-y-6">
      {/* Preferences */}
      <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Bell className="w-5 h-5" /> Tuỳ chọn nhận thông báo
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              GET / PATCH <code>/api/user/notification-preferences</code>
            </p>
          </div>
          <button
            onClick={loadPreferences}
            disabled={isLoadingPrefs}
            className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition disabled:opacity-50"
          >
            {isLoadingPrefs ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Tải lại'
            )}
          </button>
        </div>

        {isLoadingPrefs && preferences.length === 0 ? (
          <div className="py-8 text-center text-gray-500 dark:text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" />
            Đang tải...
          </div>
        ) : preferences.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Chưa có preference nào.
          </p>
        ) : (
          <div className="space-y-6">
            {categoryOrder.map((cat) => {
              const items = groupedByCategory[cat]
              if (!items || items.length === 0) return null
              return (
                <div key={cat}>
                  <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
                    {categoryLabel[cat] ?? cat}
                  </h4>
                  <div className="space-y-2">
                    {items.map((pref) => {
                      const meta = NOTIFICATION_TYPE_META[pref.type]
                      const isToggling = togglingType === pref.type
                      return (
                        <div
                          key={pref.type}
                          className="flex items-start justify-between gap-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {meta?.label ?? pref.type}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              <code className="font-mono">{pref.type}</code>
                              {pref.defaultEnabled
                                ? ' · default: on'
                                : ' · default: off'}
                            </p>
                            {meta && (
                              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                                {meta.description}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() =>
                              handleTogglePreference(pref.type, !pref.enabled)
                            }
                            disabled={isToggling}
                            className={`shrink-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-sm transition disabled:opacity-50 ${
                              pref.enabled
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-900/60'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                            }`}
                          >
                            {isToggling ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : pref.enabled ? (
                              <Bell className="w-4 h-4" />
                            ) : (
                              <BellOff className="w-4 h-4" />
                            )}
                            {pref.enabled ? 'Đang bật' : 'Đang tắt'}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Push token */}
      <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Push token
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          POST / DELETE <code>/api/user/push-token</code>. Web không có FCM client —
          paste token thật từ thiết bị, hoặc tạo token giả để mô phỏng "user đã đăng
          ký device" (FCM sẽ trả unregistered khi gửi).
        </p>

        <form onSubmit={handleRegisterToken} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              FCM token
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Dán FCM token thật, hoặc bấm 'Tạo token giả'"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setTokenInput(generateFakeToken())}
                className="shrink-0 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition"
              >
                Tạo token giả
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Platform
              </label>
              <select
                value={platform}
                onChange={(e) =>
                  setPlatform(e.target.value as 'ios' | 'android' | 'web')
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              >
                <option value="ios">ios</option>
                <option value="android">android</option>
                <option value="web">web</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Device ID
              </label>
              <input
                type="text"
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                placeholder="Optional"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Locale
              </label>
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              >
                <option value="vi">vi</option>
                <option value="en">en</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                App version
              </label>
              <input
                type="text"
                value={appVersion}
                onChange={(e) => setAppVersion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isRegistering}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50"
            >
              {isRegistering ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Đăng ký token
            </button>
            <button
              type="button"
              onClick={handleDeactivateToken}
              disabled={isDeactivating}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/60 text-red-700 dark:text-red-100 rounded-lg font-medium transition disabled:opacity-50"
            >
              {isDeactivating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Huỷ token
            </button>
          </div>
        </form>
      </section>

      {/* Send test */}
      <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Bắn thử notification
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          POST <code>/api/user/notifications/send-test</code> — gọi thẳng
          <code className="mx-1">NotificationService.send()</code> tới chính bot
          đang chọn.
        </p>

        <form onSubmit={handleSendTest} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Loại notification
            </label>
            <select
              value={testType}
              onChange={(e) => {
                setTestType(e.target.value)
                setContextInput('')
                setLastOutcome(null)
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            >
              {preferences.length === 0 && <option value="">—</option>}
              {preferences.map((p) => (
                <option key={p.type} value={p.type}>
                  {NOTIFICATION_TYPE_META[p.type]?.label ?? p.type} ({p.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Context (JSON, optional)
            </label>
            <textarea
              value={contextInput}
              onChange={(e) => setContextInput(e.target.value)}
              rows={3}
              placeholder={
                CONTEXT_HINTS[testType] ??
                'Để trống nếu loại này không yêu cầu context'
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {CONTEXT_HINTS[testType] && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                <Info className="w-3.5 h-3.5" />
                Gợi ý: {CONTEXT_HINTS[testType]}
              </p>
            )}
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={forceSend}
              onChange={(e) => setForceSend(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-600"
            />
            <span>Force (bỏ qua quiet hours)</span>
          </label>

          <div>
            <button
              type="submit"
              disabled={isSendingTest || !testType}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition disabled:opacity-50"
            >
              {isSendingTest ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Bắn thử
            </button>
          </div>

          {lastOutcome && (
            <div className="mt-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
              <p className="text-sm">
                Outcome:{' '}
                <span className={`font-mono font-semibold ${OUTCOME_LABEL[lastOutcome].tone}`}>
                  {lastOutcome}
                </span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {OUTCOME_LABEL[lastOutcome].text}
              </p>
            </div>
          )}
        </form>
      </section>

      {/* Raw FCM debug — bypass NotificationService */}
      <section className="bg-white dark:bg-gray-800 rounded-lg border border-amber-200 dark:border-amber-800 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          Bắn FCM trực tiếp (debug)
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          POST <code>/api/user/notifications/fcm-debug</code> — gọi thẳng{' '}
          <code className="mx-1">FcmClient.sendOne()</code>, bỏ qua mọi gating
          (preference, quiet hours, dedup, no_tokens, NOTIFICATIONS_ENABLED).
          Dùng để isolate "join challenge không thấy noti": nếu raw bắn về{' '}
          <code>sent</code> mà device vẫn không nhận → vấn đề ở phía client/FCM
          credentials. Nếu trả <code>unregistered</code> → token chết, đăng ký lại.
        </p>

        <form onSubmit={handleSendRaw} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              FCM token
            </label>
            <textarea
              value={rawToken}
              onChange={(e) => setRawToken(e.target.value)}
              rows={3}
              placeholder="Paste FCM token từ thiết bị (Android: Logcat 'FCM token: ...'; iOS: messaging delegate)"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-xs focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title
              </label>
              <input
                type="text"
                value={rawTitle}
                onChange={(e) => setRawTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Body
              </label>
              <input
                type="text"
                value={rawBody}
                onChange={(e) => setRawBody(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Data (JSON object, optional)
            </label>
            <textarea
              value={rawDataInput}
              onChange={(e) => setRawDataInput(e.target.value)}
              rows={2}
              placeholder='{ "screen": "log_food", "instanceId": "..." }'
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
              <Info className="w-3.5 h-3.5" />
              Mọi value sẽ stringify theo FCM contract.
            </p>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSendingRaw}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition disabled:opacity-50"
            >
              {isSendingRaw ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              Bắn raw FCM
            </button>
          </div>

          {lastRawResult && (
            <div className="mt-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 space-y-1">
              <p className="text-sm">
                Status:{' '}
                <span
                  className={`font-mono font-semibold ${
                    lastRawResult.status === 'sent'
                      ? 'text-green-700 dark:text-green-300'
                      : lastRawResult.status === 'unregistered'
                        ? 'text-amber-700 dark:text-amber-300'
                        : 'text-red-700 dark:text-red-300'
                  }`}
                >
                  {lastRawResult.status}
                </span>
              </p>
              {lastRawResult.httpStatus !== undefined && (
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  HTTP: <code>{lastRawResult.httpStatus}</code>
                </p>
              )}
              {lastRawResult.body && (
                <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap break-all font-mono p-2 bg-white dark:bg-black/30 rounded border border-gray-200 dark:border-gray-700">
                  {lastRawResult.body}
                </pre>
              )}
            </div>
          )}
        </form>
      </section>
    </div>
  )
}
