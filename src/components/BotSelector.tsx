import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  ChevronDown,
  Globe2,
  Loader2,
  LogOut,
  Search,
  Sparkles,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import type { Bot, BotRegion } from '../types'
import { getApiErrorMessage } from '../api/errors'

type RegionFilter = 'all' | BotRegion

const REGION_LABEL: Record<BotRegion, string> = {
  vn: 'Việt Nam',
  intl: 'Quốc tế',
}

const REGION_FLAG: Record<BotRegion, string> = {
  vn: '🇻🇳',
  intl: '🌐',
}

// Defensive: bots restored from a pre-timezone localStorage session, or from
// an older backend, may be missing region/timezone. Fall back to 'intl'/'UTC'
// so the selector still renders instead of throwing on .split().
function botRegion(bot: Pick<Bot, 'region' | 'timezone'>): BotRegion {
  if (bot.region === 'vn' || bot.region === 'intl') return bot.region
  return bot.timezone === 'Asia/Ho_Chi_Minh' ? 'vn' : 'intl'
}

function shortTimezone(tz: string | null | undefined): string {
  if (!tz) return 'UTC'
  const last = tz.split('/').pop() ?? tz
  return last.replace(/_/g, ' ')
}

export function BotSelector() {
  const { currentBot, bots, loginAsBot, logout, isLoading } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [region, setRegion] = useState<RegionFilter>('all')
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const counts = useMemo(() => {
    const vn = bots.filter((b) => botRegion(b) === 'vn').length
    return { all: bots.length, vn, intl: bots.length - vn }
  }, [bots])

  const filteredBots = useMemo(() => {
    const q = query.trim().toLowerCase()
    return bots.filter((bot) => {
      if (region !== 'all' && botRegion(bot) !== region) return false
      if (!q) return true
      return (
        bot.displayName.toLowerCase().includes(q) ||
        bot.id.toLowerCase().includes(q) ||
        (bot.timezone ?? '').toLowerCase().includes(q)
      )
    })
  }, [bots, region, query])

  // Esc to close + body scroll lock + auto-focus search
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    requestAnimationFrame(() => inputRef.current?.focus())
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [isOpen])

  const handleBotSelect = async (bot: Bot) => {
    if (currentBot?.id === bot.id) {
      setIsOpen(false)
      return
    }
    try {
      await loginAsBot(bot)
      toast.success(`Đăng nhập bot: ${bot.displayName}`)
      setIsOpen(false)
      setQuery('')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không thể đăng nhập bot'))
    }
  }

  const handleLogout = () => {
    logout()
    toast.success('Đã đăng xuất bot')
    setIsOpen(false)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        disabled={isLoading}
        className="group flex w-full min-w-0 items-center gap-2 rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-2.5 py-1.5 text-sm font-medium text-[var(--sea-ink)] shadow-[0_8px_24px_rgba(30,90,72,0.08)] transition hover:border-[color-mix(in_oklab,var(--lagoon-deep)_35%,var(--line))] hover:bg-[var(--link-bg-hover)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:gap-2.5 sm:px-3.5 sm:py-2"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[var(--lagoon-deep)]" />
        ) : (
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#56c6be,#7ed3bf)] text-white shadow-inner sm:h-7 sm:w-7">
            {currentBot ? (
              <span className="text-sm leading-none sm:text-base">
                {REGION_FLAG[botRegion(currentBot)]}
              </span>
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
          </span>
        )}
        {currentBot ? (
          <span className="flex min-w-0 flex-col items-start leading-tight">
            <span className="max-w-[150px] truncate text-sm font-semibold sm:max-w-none">
              {currentBot.displayName}
            </span>
            <span className="hidden text-[11px] text-[var(--sea-ink-soft)] sm:inline">
              {REGION_LABEL[botRegion(currentBot)]} ·{' '}
              {shortTimezone(currentBot.timezone)}
            </span>
          </span>
        ) : (
          <span>Chọn bot</span>
        )}
        <ChevronDown className="ml-auto h-4 w-4 shrink-0 text-[var(--sea-ink-soft)] sm:ml-0" />
      </button>

      {isOpen && (
        <BotPickerModal
          inputRef={inputRef}
          query={query}
          onQueryChange={setQuery}
          region={region}
          onRegionChange={setRegion}
          counts={counts}
          filteredBots={filteredBots}
          totalBots={bots.length}
          currentBot={currentBot}
          onSelect={handleBotSelect}
          onLogout={handleLogout}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  )
}

// ── Modal ────────────────────────────────────────────────────────────────────

interface BotPickerModalProps {
  inputRef: React.RefObject<HTMLInputElement | null>
  query: string
  onQueryChange: (v: string) => void
  region: RegionFilter
  onRegionChange: (r: RegionFilter) => void
  counts: { all: number; vn: number; intl: number }
  filteredBots: Bot[]
  totalBots: number
  currentBot: Bot | null
  onSelect: (bot: Bot) => void
  onLogout: () => void
  onClose: () => void
}

function BotPickerModal({
  inputRef,
  query,
  onQueryChange,
  region,
  onRegionChange,
  counts,
  filteredBots,
  totalBots,
  currentBot,
  onSelect,
  onLogout,
  onClose,
}: BotPickerModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Chọn bot"
      className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Đóng"
        onClick={onClose}
        className="absolute inset-0 bg-[rgba(10,30,32,0.55)] backdrop-blur-sm"
      />

      {/* Panel */}
      <div className="relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl border border-[var(--line)] bg-[var(--surface-strong)] shadow-[0_40px_120px_rgba(10,30,32,0.35)] backdrop-blur-2xl sm:max-h-[80vh] sm:max-w-3xl sm:rounded-3xl">
        {/* Header */}
        <div className="relative flex items-start justify-between gap-4 border-b border-[var(--line)] px-5 py-4 sm:px-6 sm:py-5">
          <div>
            <p className="island-kicker">QA Console</p>
            <h2 className="display-title mt-0.5 text-xl font-bold text-[var(--sea-ink)] sm:text-2xl">
              Chọn bot mô phỏng
            </h2>
            <p className="mt-0.5 text-xs text-[var(--sea-ink-soft)] sm:text-sm">
              Đang có <strong className="text-[var(--sea-ink)]">{totalBots}</strong>{' '}
              bot · {counts.vn} 🇻🇳 Việt Nam · {counts.intl} 🌐 Quốc tế
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--chip-bg)] text-[var(--sea-ink-soft)] transition hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Sticky controls */}
        <div className="flex flex-col gap-3 border-b border-[var(--line)] bg-[color-mix(in_oklab,var(--surface-strong)_92%,transparent)] px-5 py-3.5 sm:px-6">
          <label className="flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--chip-bg)] px-3.5 py-2.5 focus-within:border-[var(--lagoon-deep)]">
            <Search className="h-4 w-4 text-[var(--sea-ink-soft)]" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Tìm bot theo tên, timezone hoặc ID…"
              className="flex-1 bg-transparent text-sm text-[var(--sea-ink)] placeholder:text-[var(--sea-ink-soft)]/70 focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => onQueryChange('')}
                className="text-xs text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]"
              >
                Xoá
              </button>
            )}
          </label>

          <div className="flex flex-wrap gap-2">
            <RegionPill
              active={region === 'all'}
              onClick={() => onRegionChange('all')}
              icon={<Globe2 className="h-3.5 w-3.5" />}
              label="Tất cả"
              count={counts.all}
            />
            <RegionPill
              active={region === 'vn'}
              onClick={() => onRegionChange('vn')}
              icon={<span className="text-base leading-none">🇻🇳</span>}
              label="Việt Nam"
              count={counts.vn}
            />
            <RegionPill
              active={region === 'intl'}
              onClick={() => onRegionChange('intl')}
              icon={<span className="text-base leading-none">🌐</span>}
              label="Quốc tế"
              count={counts.intl}
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-3 py-3 sm:px-4 sm:py-4">
          {filteredBots.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--chip-bg)] text-2xl">
                🔍
              </span>
              <p className="mt-3 text-sm font-semibold text-[var(--sea-ink)]">
                Không tìm thấy bot phù hợp
              </p>
              <p className="mt-1 text-xs text-[var(--sea-ink-soft)]">
                Thử đổi bộ lọc khu vực hoặc xoá từ khoá tìm kiếm
              </p>
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {filteredBots.map((bot) => (
                <BotCard
                  key={bot.id}
                  bot={bot}
                  selected={currentBot?.id === bot.id}
                  onClick={() => onSelect(bot)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {currentBot && (
          <div className="flex items-center justify-between gap-3 border-t border-[var(--line)] bg-[color-mix(in_oklab,var(--surface-strong)_92%,transparent)] px-5 py-3 sm:px-6">
            <div className="min-w-0 text-xs text-[var(--sea-ink-soft)]">
              Đang dùng:{' '}
              <span className="font-semibold text-[var(--sea-ink)]">
                {currentBot.displayName}
              </span>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="flex flex-shrink-0 items-center gap-2 rounded-xl border border-rose-200/60 bg-rose-50/70 px-3 py-1.5 text-sm font-medium text-rose-700 transition hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200 dark:hover:bg-rose-950/70"
            >
              <LogOut className="h-3.5 w-3.5" />
              Đăng xuất
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Bot card ─────────────────────────────────────────────────────────────────

interface BotCardProps {
  bot: Bot
  selected: boolean
  onClick: () => void
}

function BotCard({ bot, selected, onClick }: BotCardProps) {
  const r = botRegion(bot)
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition ${
        selected
          ? 'border-[var(--lagoon-deep)] bg-[color-mix(in_oklab,var(--lagoon)_15%,var(--surface-strong))] shadow-[0_8px_24px_rgba(50,143,151,0.18)]'
          : 'border-[var(--line)] bg-[var(--chip-bg)] hover:-translate-y-0.5 hover:border-[color-mix(in_oklab,var(--lagoon-deep)_30%,var(--line))] hover:shadow-[0_10px_22px_rgba(30,90,72,0.10)]'
      }`}
    >
      <span
        className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl text-xl shadow-inner ${
          r === 'vn'
            ? 'bg-[linear-gradient(135deg,#fee2e2,#fecaca)]'
            : 'bg-[linear-gradient(135deg,#dbeafe,#bfdbfe)]'
        }`}
      >
        {REGION_FLAG[r]}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold text-[var(--sea-ink)]">
            {bot.displayName}
          </span>
          {selected && (
            <span className="rounded-full bg-[var(--lagoon-deep)] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
              Đang dùng
            </span>
          )}
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[var(--sea-ink-soft)]">
          <span className="rounded-full bg-[var(--surface-strong)] px-1.5 py-0.5 font-mono">
            {shortTimezone(bot.timezone)}
          </span>
          <span className="truncate font-mono opacity-70">
            {bot.id.slice(0, 8)}
          </span>
        </div>
      </div>
    </button>
  )
}

// ── Region pill ──────────────────────────────────────────────────────────────

interface RegionPillProps {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  count: number
}

function RegionPill({ active, onClick, icon, label, count }: RegionPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
        active
          ? 'bg-[linear-gradient(135deg,#56c6be,#7ed3bf)] text-white shadow-[0_6px_18px_rgba(50,143,151,0.25)]'
          : 'border border-[var(--line)] bg-transparent text-[var(--sea-ink-soft)] hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)]'
      }`}
    >
      {icon}
      <span>{label}</span>
      <span
        className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
          active ? 'bg-white/25' : 'bg-[var(--chip-bg)]'
        }`}
      >
        {count}
      </span>
    </button>
  )
}
