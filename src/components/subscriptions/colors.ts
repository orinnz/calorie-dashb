import type { AdminEventStatus, SubscriptionStatus } from '../../types'

interface ColorPair {
  dot: string
  chip: string
}

const DEFAULT_COLOR: ColorPair = {
  dot: 'bg-slate-400',
  chip: 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300',
}

const EVENT_COLORS: Record<string, ColorPair> = {
  INITIAL_PURCHASE: {
    dot: 'bg-emerald-500',
    chip: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  },
  RENEWAL: {
    dot: 'bg-emerald-400',
    chip: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  },
  CANCELLATION: {
    dot: 'bg-orange-500',
    chip: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300',
  },
  UNCANCELLATION: {
    dot: 'bg-teal-500',
    chip: 'bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300',
  },
  EXPIRATION: {
    dot: 'bg-slate-500',
    chip: 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300',
  },
  BILLING_ISSUE: {
    dot: 'bg-yellow-500',
    chip: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300',
  },
  SUBSCRIPTION_PAUSED: {
    dot: 'bg-amber-500',
    chip: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  },
  PRODUCT_CHANGE: {
    dot: 'bg-blue-500',
    chip: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
  },
  TRANSFER: {
    dot: 'bg-indigo-500',
    chip: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300',
  },
  SUBSCRIPTION_EXTENDED: {
    dot: 'bg-cyan-500',
    chip: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300',
  },
  TEMPORARY_ENTITLEMENT_GRANT: {
    dot: 'bg-violet-500',
    chip: 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300',
  },
  NON_RENEWING_PURCHASE: {
    dot: 'bg-emerald-300',
    chip: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  },
  INVOICE_ISSUANCE: {
    dot: 'bg-sky-500',
    chip: 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300',
  },
  TEST: {
    dot: 'bg-purple-500',
    chip: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300',
  },
}

export function eventColor(type: string): ColorPair {
  return EVENT_COLORS[type] ?? DEFAULT_COLOR
}

const STATUS_CHIP: Record<AdminEventStatus, string> = {
  processed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  skipped: 'bg-slate-100 text-slate-600 dark:bg-slate-500/20 dark:text-slate-300',
  failed: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
  received: 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300',
}

export function eventStatusChip(status: AdminEventStatus): string {
  return STATUS_CHIP[status] ?? DEFAULT_COLOR.chip
}

const SUB_STATUS_CHIP: Record<SubscriptionStatus, string> = {
  active:
    'bg-emerald-100 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:ring-emerald-500/30',
  in_grace:
    'bg-yellow-100 text-yellow-700 ring-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-300 dark:ring-yellow-500/30',
  paused:
    'bg-amber-100 text-amber-700 ring-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:ring-amber-500/30',
  expired:
    'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-500/20 dark:text-slate-300 dark:ring-slate-500/30',
  refunded:
    'bg-rose-100 text-rose-700 ring-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:ring-rose-500/30',
}

export function subscriptionStatusChip(status: SubscriptionStatus): string {
  return SUB_STATUS_CHIP[status] ?? DEFAULT_COLOR.chip
}

export const SUBSCRIPTION_STATUS_LABEL: Record<SubscriptionStatus, string> = {
  active: 'Đang hoạt động',
  in_grace: 'Grace period',
  paused: 'Tạm dừng',
  expired: 'Đã hết hạn',
  refunded: 'Đã hoàn tiền',
}
