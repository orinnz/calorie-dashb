import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  ArrowLeft,
  ArrowRight,
  Bot as BotIcon,
  Crown,
  RefreshCw,
  Search,
  UserCircle2,
  X,
} from 'lucide-react'
import { subscriptionsAdminApi } from '../../api/subscriptions'
import { getApiErrorMessage } from '../../api/errors'
import type { AdminUserListItem } from '../../types'
import { formatRelativeTime, shortId } from '../../lib/format'
import { Avatar } from '../ui/Avatar'
import { eventColor } from './colors'

interface UserListPanelProps {
  selectedUserId: string | null
  onSelect: (userId: string) => void
}

interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

const PAGE_SIZE = 20

export function UserListPanel({ selectedUserId, onSelect }: UserListPanelProps) {
  const [items, setItems] = useState<AdminUserListItem[]>([])
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [refreshTick, setRefreshTick] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 300)
    return () => clearTimeout(t)
  }, [searchInput])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  useEffect(() => {
    let canceled = false
    setIsLoading(true)
    subscriptionsAdminApi
      .listUsers(page, PAGE_SIZE, debouncedSearch || undefined)
      .then((resp) => {
        if (canceled) return
        setItems(resp.data)
        setPagination(resp.pagination)
      })
      .catch((err) => {
        if (canceled) return
        toast.error(
          getApiErrorMessage(err, 'Không tải được danh sách user subscription'),
        )
      })
      .finally(() => {
        if (!canceled) setIsLoading(false)
      })
    return () => {
      canceled = true
    }
  }, [page, debouncedSearch, refreshTick])

  const refresh = () => setRefreshTick((n) => n + 1)
  const total = pagination?.total ?? 0
  const totalPages = pagination?.totalPages ?? 1

  return (
    <div className="island-shell flex flex-col rounded-2xl p-3 sm:p-4 h-full">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <h2 className="display-title text-base sm:text-lg font-bold text-[var(--sea-ink)]">
            User có activity
          </h2>
          <p className="text-[11px] sm:text-xs text-[var(--sea-ink-soft)]">
            {isLoading ? 'Đang tải…' : `${total} user`}
          </p>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={isLoading}
          aria-label="Làm mới"
          className="shrink-0 p-2 rounded-lg text-[var(--sea-ink-soft)] hover:bg-white/60 dark:hover:bg-white/10 hover:text-[var(--sea-ink)] transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--sea-ink-soft)]" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Tên hoặc user ID…"
          className="w-full pl-9 pr-9 py-2 text-sm rounded-xl
            bg-white/70 dark:bg-white/5
            border border-[var(--chip-line)] dark:border-white/10
            text-[var(--sea-ink)] dark:text-white
            placeholder:text-[var(--sea-ink-soft)]
            focus:outline-none focus:ring-2 focus:ring-[var(--lagoon)]/40"
        />
        {searchInput && (
          <button
            type="button"
            aria-label="Xoá tìm kiếm"
            onClick={() => setSearchInput('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-[var(--sea-ink-soft)] hover:bg-black/5 dark:hover:bg-white/10"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto -mx-1 px-1 space-y-1.5 min-h-[200px]">
        {isLoading && items.length === 0 ? (
          <ListSkeleton />
        ) : items.length === 0 ? (
          <EmptyState search={debouncedSearch} onClearSearch={() => setSearchInput('')} />
        ) : (
          items.map((item) => (
            <UserListRow
              key={item.userId}
              item={item}
              isSelected={item.userId === selectedUserId}
              onSelect={() => onSelect(item.userId)}
            />
          ))
        )}
      </div>

      {pagination && totalPages > 1 && (
        <div className="mt-3 flex items-center justify-between gap-2 pt-3 border-t border-black/5 dark:border-white/5">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg
              bg-white/60 dark:bg-white/5 text-[var(--sea-ink)] dark:text-white
              border border-[var(--chip-line)] dark:border-white/10
              hover:bg-white/80 dark:hover:bg-white/10
              disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Trước</span>
          </button>
          <span className="text-xs text-[var(--sea-ink-soft)]">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg
              bg-white/60 dark:bg-white/5 text-[var(--sea-ink)] dark:text-white
              border border-[var(--chip-line)] dark:border-white/10
              hover:bg-white/80 dark:hover:bg-white/10
              disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <span>Sau</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

function UserListRow({
  item,
  isSelected,
  onSelect,
}: {
  item: AdminUserListItem
  isSelected: boolean
  onSelect: () => void
}) {
  const colors = eventColor(item.lastEventType)

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left p-2.5 sm:p-3 rounded-xl border transition group
        ${
          isSelected
            ? 'bg-gradient-to-br from-[var(--lagoon)]/15 to-[var(--lagoon)]/5 border-[var(--lagoon)]/60 shadow-[0_4px_14px_rgba(50,143,151,0.18)]'
            : 'bg-white/55 dark:bg-white/5 border-white/40 dark:border-white/5 hover:bg-white/85 dark:hover:bg-white/10 hover:border-[var(--chip-line)]'
        }`}
    >
      <div className="flex items-center gap-2.5 sm:gap-3">
        <Avatar
          fileName={item.fileName}
          userId={item.userId}
          displayName={item.displayName}
          size="md"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <p className="font-semibold text-sm text-[var(--sea-ink)] dark:text-white truncate">
              {item.displayName ?? (
                <span className="italic opacity-70">Không có tên</span>
              )}
            </p>
            {item.isPremium && (
              <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            )}
            {item.isBot && (
              <BotIcon className="w-3.5 h-3.5 text-violet-500 shrink-0" />
            )}
            {item.isAnonymous && !item.isBot && (
              <UserCircle2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            )}
          </div>
          <p className="text-[10px] sm:text-[11px] font-mono text-[var(--sea-ink-soft)] truncate">
            {shortId(item.userId, 12, 6)}
          </p>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <span
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide ${colors.chip}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
              {item.lastEventType}
            </span>
            <span className="text-[10px] text-[var(--sea-ink-soft)]">
              {formatRelativeTime(item.lastEventAt)}
            </span>
            <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-md bg-black/5 dark:bg-white/10 text-[var(--sea-ink-soft)] font-mono">
              {item.eventCount}
            </span>
          </div>
        </div>
      </div>
    </button>
  )
}

function ListSkeleton() {
  return (
    <div className="space-y-1.5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="p-3 rounded-xl bg-white/40 dark:bg-white/5 border border-white/40 dark:border-white/5 animate-pulse"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-black/10 dark:bg-white/10" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-32 rounded bg-black/10 dark:bg-white/10" />
              <div className="h-2.5 w-44 rounded bg-black/10 dark:bg-white/10" />
              <div className="h-2.5 w-24 rounded bg-black/10 dark:bg-white/10" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({
  search,
  onClearSearch,
}: {
  search: string
  onClearSearch: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
      <div className="h-12 w-12 rounded-full bg-[var(--lagoon)]/15 flex items-center justify-center mb-3">
        <Search className="w-5 h-5 text-[var(--lagoon-deep)]" />
      </div>
      {search ? (
        <>
          <p className="text-sm font-medium text-[var(--sea-ink)] dark:text-white">
            Không tìm thấy user khớp với "{search}"
          </p>
          <button
            type="button"
            onClick={onClearSearch}
            className="mt-2 text-xs text-[var(--lagoon-deep)] hover:underline"
          >
            Xoá tìm kiếm
          </button>
        </>
      ) : (
        <p className="text-sm text-[var(--sea-ink-soft)]">
          Chưa có user nào có hoạt động subscription.
        </p>
      )}
    </div>
  )
}
