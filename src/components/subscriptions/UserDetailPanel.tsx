import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  AlertTriangle,
  ArrowLeft,
  Bot as BotIcon,
  Check,
  Copy,
  Crown,
  RefreshCw,
  UserCircle2,
} from 'lucide-react'
import { subscriptionsAdminApi } from '../../api/subscriptions'
import { getApiErrorMessage } from '../../api/errors'
import type { AdminUserDetail } from '../../types'
import { formatDateTime } from '../../lib/format'
import { Avatar } from '../ui/Avatar'
import { CurrentSubscriptionCard } from './CurrentSubscriptionCard'
import { EventTimelineItem } from './EventTimelineItem'

interface Props {
  userId: string
  onBack: () => void
}

export function UserDetailPanel({ userId, onBack }: Props) {
  const [detail, setDetail] = useState<AdminUserDetail | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [refreshTick, setRefreshTick] = useState(0)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let canceled = false
    setIsLoading(true)
    subscriptionsAdminApi
      .getUserDetail(userId)
      .then((data) => {
        if (canceled) return
        setDetail(data)
      })
      .catch((err) => {
        if (canceled) return
        toast.error(getApiErrorMessage(err, 'Không tải được chi tiết user'))
      })
      .finally(() => {
        if (!canceled) setIsLoading(false)
      })
    return () => {
      canceled = true
    }
  }, [userId, refreshTick])

  const refresh = () => setRefreshTick((n) => n + 1)

  const onCopyId = async () => {
    try {
      await navigator.clipboard.writeText(userId)
      setCopied(true)
      toast.success('Đã copy user ID')
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error('Không copy được')
    }
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* User header */}
      <div className="island-shell rounded-2xl p-4 sm:p-5">
        <div className="flex items-start gap-3 sm:gap-4">
          <button
            type="button"
            onClick={onBack}
            aria-label="Quay lại"
            className="lg:hidden shrink-0 p-2 -ml-1 rounded-lg text-[var(--sea-ink-soft)] hover:bg-black/5 dark:hover:bg-white/10 hover:text-[var(--sea-ink)] transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <Avatar
            fileName={detail?.user?.fileName ?? null}
            userId={userId}
            displayName={detail?.user?.displayName ?? null}
            size="lg"
            className="shrink-0"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="display-title text-lg sm:text-xl font-bold text-[var(--sea-ink)] dark:text-white truncate">
                {detail?.user?.displayName ?? (
                  <span className="italic opacity-70">Không có tên</span>
                )}
              </h2>
              {detail?.user?.isPremium && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                  <Crown className="w-3 h-3" /> Premium
                </span>
              )}
              {detail?.user?.isBot && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
                  <BotIcon className="w-3 h-3" /> Bot
                </span>
              )}
              {detail?.user?.isAnonymous && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-500/20 dark:text-slate-300">
                  <UserCircle2 className="w-3 h-3" /> Anonymous
                </span>
              )}
              {detail && !detail.user && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300">
                  <AlertTriangle className="w-3 h-3" /> Orphan
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={onCopyId}
              className="mt-1 inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-mono text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)] transition group"
              title="Click để copy"
            >
              <span className="truncate">{userId}</span>
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              ) : (
                <Copy className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 shrink-0" />
              )}
            </button>
            {detail?.user?.premiumExpiresAt && (
              <p className="mt-1.5 text-[11px] sm:text-xs text-[var(--sea-ink-soft)]">
                Premium đến:{' '}
                <span className="font-mono text-[var(--sea-ink)] dark:text-white">
                  {formatDateTime(detail.user.premiumExpiresAt)}
                </span>
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={refresh}
            disabled={isLoading}
            aria-label="Làm mới"
            className="shrink-0 p-2 rounded-lg text-[var(--sea-ink-soft)] hover:bg-black/5 dark:hover:bg-white/10 hover:text-[var(--sea-ink)] transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Body */}
      {isLoading && !detail ? (
        <DetailSkeleton />
      ) : !detail ? (
        <div className="island-shell rounded-2xl p-8 text-center text-[var(--sea-ink-soft)]">
          Không có dữ liệu.
        </div>
      ) : (
        <>
          <CurrentSubscriptionCard subscription={detail.currentSubscription} />

          {detail.allSubscriptions.length > 1 && (
            <PreviousSubscriptions
              subscriptions={detail.allSubscriptions.filter(
                (s) => s.id !== detail.currentSubscription?.id,
              )}
            />
          )}

          <div className="island-shell rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3 mb-3 sm:mb-4">
              <div>
                <h3 className="display-title text-base sm:text-lg font-bold text-[var(--sea-ink)] dark:text-white">
                  Lịch sử event
                </h3>
                <p className="text-[11px] sm:text-xs text-[var(--sea-ink-soft)]">
                  {detail.events.length} event
                  {detail.eventsTruncated && ' (đã giới hạn 200 mới nhất)'}
                </p>
              </div>
            </div>

            {detail.eventsTruncated && (
              <div className="mb-4 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-[11px] sm:text-xs text-amber-700 dark:text-amber-300">
                <AlertTriangle className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />
                User này có hơn 200 event — có thể đang gặp retry loop. Hãy kiểm tra.
              </div>
            )}

            {detail.events.length === 0 ? (
              <div className="py-8 text-center text-sm text-[var(--sea-ink-soft)]">
                Chưa có event nào cho user này.
              </div>
            ) : (
              <div className="-mb-4">
                {detail.events.map((event, idx) => (
                  <EventTimelineItem
                    key={event.eventId}
                    event={event}
                    isLast={idx === detail.events.length - 1}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function PreviousSubscriptions({
  subscriptions,
}: {
  subscriptions: AdminUserDetail['allSubscriptions']
}) {
  return (
    <details className="island-shell rounded-2xl p-4 sm:p-5 group">
      <summary className="cursor-pointer flex items-center justify-between gap-2 list-none">
        <span className="display-title text-sm sm:text-base font-bold text-[var(--sea-ink)] dark:text-white">
          Subscription cũ ({subscriptions.length})
        </span>
        <span className="text-xs text-[var(--sea-ink-soft)] group-open:rotate-180 transition-transform">
          ▾
        </span>
      </summary>
      <div className="mt-3 space-y-2">
        {subscriptions.map((sub) => (
          <div
            key={sub.id}
            className="rounded-lg p-2.5 sm:p-3 bg-white/50 dark:bg-white/5 border border-white/40 dark:border-white/5 text-xs"
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-semibold text-[var(--sea-ink)] dark:text-white truncate">
                {sub.productId}
              </span>
              <span className="font-mono text-[10px] uppercase text-[var(--sea-ink-soft)]">
                {sub.status}
              </span>
            </div>
            <p className="font-mono text-[10px] text-[var(--sea-ink-soft)]">
              {formatDateTime(sub.currentPeriodStartedAt)} →{' '}
              {formatDateTime(sub.currentPeriodExpiresAt)}
            </p>
          </div>
        ))}
      </div>
    </details>
  )
}

function DetailSkeleton() {
  return (
    <div className="space-y-4">
      <div className="island-shell rounded-2xl p-5 animate-pulse">
        <div className="h-5 w-32 rounded bg-black/10 dark:bg-white/10 mb-3" />
        <div className="h-4 w-44 rounded bg-black/10 dark:bg-white/10 mb-4" />
        <div className="h-20 rounded bg-black/5 dark:bg-white/5" />
      </div>
      <div className="island-shell rounded-2xl p-5 animate-pulse">
        <div className="h-4 w-40 rounded bg-black/10 dark:bg-white/10 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded bg-black/5 dark:bg-white/5" />
          ))}
        </div>
      </div>
    </div>
  )
}
