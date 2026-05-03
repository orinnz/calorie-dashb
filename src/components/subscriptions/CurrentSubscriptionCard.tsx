import {
  CalendarClock,
  CalendarRange,
  Coins,
  Globe2,
  PackageCheck,
  RefreshCcw,
  ShoppingBag,
  ShieldCheck,
  XCircle,
} from 'lucide-react'
import type { AdminSubscription } from '../../types'
import {
  formatDateTime,
  formatDuration,
  formatPrice,
} from '../../lib/format'
import {
  SUBSCRIPTION_STATUS_LABEL,
  subscriptionStatusChip,
} from './colors'

interface Props {
  subscription: AdminSubscription | null
}

export function CurrentSubscriptionCard({ subscription }: Props) {
  if (!subscription) {
    return (
      <div className="island-shell rounded-2xl px-5 py-7 sm:px-6 sm:py-8 text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-700/40 flex items-center justify-center mb-3">
          <XCircle className="w-6 h-6 text-slate-400" />
        </div>
        <p className="font-semibold text-[var(--sea-ink)] dark:text-white">
          Không có subscription đang hoạt động
        </p>
        <p className="mt-1 text-xs sm:text-sm text-[var(--sea-ink-soft)]">
          User này chưa từng mua hoặc tất cả gói đã hết hạn.
        </p>
      </div>
    )
  }

  const sub = subscription
  const now = Date.now()
  const expiresAt = new Date(sub.currentPeriodExpiresAt).getTime()
  const isExpired = expiresAt <= now
  const remainingLabel = isExpired
    ? `Đã hết ${formatDuration(sub.currentPeriodExpiresAt, new Date(now).toISOString())} trước`
    : `Còn ${formatDuration(new Date(now).toISOString(), sub.currentPeriodExpiresAt)}`

  return (
    <div className="island-shell rounded-2xl p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <p className="island-kicker">Subscription hiện tại</p>
          <h3 className="display-title mt-1 text-lg sm:text-xl font-bold text-[var(--sea-ink)] dark:text-white truncate">
            {sub.productId}
          </h3>
          {sub.periodType && (
            <p className="text-xs text-[var(--sea-ink-soft)] mt-0.5">
              Period: <span className="font-mono">{sub.periodType}</span>
            </p>
          )}
        </div>
        <span
          className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ring-1 ${subscriptionStatusChip(sub.status)}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {SUBSCRIPTION_STATUS_LABEL[sub.status] ?? sub.status}
        </span>
      </div>

      {/* Period block */}
      <div className="rounded-xl bg-white/60 dark:bg-white/5 border border-white/50 dark:border-white/10 p-3 sm:p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <CalendarRange className="w-4 h-4 text-[var(--lagoon-deep)]" />
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--sea-ink-soft)]">
            Kỳ hiện tại
          </span>
          <span
            className={`ml-auto text-[11px] font-bold px-2 py-0.5 rounded-md ${
              isExpired
                ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300'
                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
            }`}
          >
            {remainingLabel}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
          <DateRow label="Bắt đầu" value={formatDateTime(sub.currentPeriodStartedAt)} />
          <DateRow label="Hết hạn" value={formatDateTime(sub.currentPeriodExpiresAt)} />
          {sub.gracePeriodExpiresAt && (
            <DateRow
              label="Grace tới"
              value={formatDateTime(sub.gracePeriodExpiresAt)}
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 mb-4">
        <FactCell
          icon={<ShoppingBag className="w-3.5 h-3.5" />}
          label="Store"
          value={sub.store}
        />
        <FactCell
          icon={<Globe2 className="w-3.5 h-3.5" />}
          label="Env"
          value={sub.environment}
          highlight={sub.environment === 'SANDBOX'}
        />
        <FactCell
          icon={<RefreshCcw className="w-3.5 h-3.5" />}
          label="Auto-renew"
          value={sub.autoRenew ? 'Bật' : 'Tắt'}
          highlight={!sub.autoRenew}
        />
        <FactCell
          icon={<Coins className="w-3.5 h-3.5" />}
          label="Giá"
          value={formatPrice(sub.priceInPurchasedCurrency, sub.currency)}
        />
        {sub.entitlementIds.length > 0 && (
          <FactCell
            icon={<PackageCheck className="w-3.5 h-3.5" />}
            label="Entitlements"
            value={sub.entitlementIds.join(', ')}
            wide
          />
        )}
        <FactCell
          icon={<CalendarClock className="w-3.5 h-3.5" />}
          label="Updated"
          value={formatDateTime(sub.updatedAt)}
          wide
        />
      </div>

      {(sub.cancelReason || sub.expirationReason) && (
        <div className="rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 p-3 text-xs">
          {sub.cancelReason && (
            <div className="flex items-start gap-2 text-rose-700 dark:text-rose-300">
              <XCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold">Cancel reason:</span>{' '}
                <span className="font-mono">{sub.cancelReason}</span>
              </div>
            </div>
          )}
          {sub.expirationReason && (
            <div className="flex items-start gap-2 text-rose-700 dark:text-rose-300 mt-1.5">
              <ShieldCheck className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold">Expiration reason:</span>{' '}
                <span className="font-mono">{sub.expirationReason}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function DateRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-[10px] uppercase tracking-wide text-[var(--sea-ink-soft)] shrink-0">
        {label}
      </span>
      <span className="font-mono text-[11px] sm:text-xs text-[var(--sea-ink)] dark:text-white truncate">
        {value}
      </span>
    </div>
  )
}

function FactCell({
  icon,
  label,
  value,
  highlight,
  wide,
}: {
  icon: React.ReactNode
  label: string
  value: string
  highlight?: boolean
  wide?: boolean
}) {
  return (
    <div
      className={`rounded-lg px-2.5 py-2 border ${
        highlight
          ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30'
          : 'bg-white/55 dark:bg-white/5 border-white/40 dark:border-white/5'
      } ${wide ? 'col-span-2 sm:col-span-3' : ''}`}
    >
      <div className="flex items-center gap-1.5 text-[var(--sea-ink-soft)]">
        {icon}
        <span className="text-[10px] uppercase tracking-wide font-medium">
          {label}
        </span>
      </div>
      <div
        className={`mt-0.5 text-xs sm:text-sm font-semibold truncate ${
          highlight
            ? 'text-amber-700 dark:text-amber-300'
            : 'text-[var(--sea-ink)] dark:text-white'
        }`}
        title={value}
      >
        {value}
      </div>
    </div>
  )
}
