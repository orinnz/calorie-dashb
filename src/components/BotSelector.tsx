import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { ChevronDown, Globe2, Loader2, LogOut, Search, Sparkles } from 'lucide-react'
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

function shortTimezone(tz: string): string {
  const last = tz.split('/').pop() ?? tz
  return last.replace(/_/g, ' ')
}

export function BotSelector() {
  const { currentBot, bots, loginAsBot, logout, isLoading } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [region, setRegion] = useState<RegionFilter>('all')
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const counts = useMemo(() => {
    const vn = bots.filter((b) => b.region === 'vn').length
    return { all: bots.length, vn, intl: bots.length - vn }
  }, [bots])

  const filteredBots = useMemo(() => {
    const q = query.trim().toLowerCase()
    return bots.filter((bot) => {
      if (region !== 'all' && bot.region !== region) return false
      if (!q) return true
      return (
        bot.displayName.toLowerCase().includes(q) ||
        bot.id.toLowerCase().includes(q) ||
        bot.timezone.toLowerCase().includes(q)
      )
    })
  }, [bots, region, query])

  // Close on outside click + Esc
  useEffect(() => {
    if (!isOpen) return
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setIsOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    // Auto-focus search on open
    requestAnimationFrame(() => inputRef.current?.focus())
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
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
    <div ref={containerRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        disabled={isLoading}
        className="group flex items-center gap-2.5 rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3.5 py-2 text-sm font-medium text-[var(--sea-ink)] shadow-[0_8px_24px_rgba(30,90,72,0.08)] transition hover:border-[color-mix(in_oklab,var(--lagoon-deep)_35%,var(--line))] hover:bg-[var(--link-bg-hover)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-[var(--lagoon-deep)]" />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[linear-gradient(135deg,#56c6be,#7ed3bf)] text-white shadow-inner">
            {currentBot ? (
              <span className="text-base leading-none">
                {REGION_FLAG[currentBot.region] ?? '🤖'}
              </span>
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
          </span>
        )}
        {currentBot ? (
          <span className="flex flex-col items-start leading-tight">
            <span className="text-sm font-semibold">{currentBot.displayName}</span>
            <span className="text-[11px] text-[var(--sea-ink-soft)]">
              {REGION_LABEL[currentBot.region]} · {shortTimezone(currentBot.timezone)}
            </span>
          </span>
        ) : (
          <span>Chọn bot</span>
        )}
        <ChevronDown
          className={`h-4 w-4 text-[var(--sea-ink-soft)] transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[22rem] overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] shadow-[0_24px_60px_rgba(15,40,44,0.18)] backdrop-blur-xl">
          {/* Search */}
          <div className="flex items-center gap-2 border-b border-[var(--line)] px-3.5 py-2.5">
            <Search className="h-4 w-4 text-[var(--sea-ink-soft)]" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm bot theo tên, timezone, ID…"
              className="flex-1 bg-transparent text-sm text-[var(--sea-ink)] placeholder:text-[var(--sea-ink-soft)]/70 focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-xs text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]"
              >
                Xoá
              </button>
            )}
          </div>

          {/* Region filter */}
          <div className="flex gap-1.5 border-b border-[var(--line)] px-3 py-2.5">
            <RegionPill
              active={region === 'all'}
              onClick={() => setRegion('all')}
              icon={<Globe2 className="h-3.5 w-3.5" />}
              label="Tất cả"
              count={counts.all}
            />
            <RegionPill
              active={region === 'vn'}
              onClick={() => setRegion('vn')}
              icon={<span className="text-base leading-none">🇻🇳</span>}
              label="Việt Nam"
              count={counts.vn}
            />
            <RegionPill
              active={region === 'intl'}
              onClick={() => setRegion('intl')}
              icon={<span className="text-base leading-none">🌐</span>}
              label="Quốc tế"
              count={counts.intl}
            />
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto py-1">
            {filteredBots.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-[var(--sea-ink-soft)]">
                Không tìm thấy bot phù hợp
              </div>
            ) : (
              filteredBots.map((bot) => {
                const selected = currentBot?.id === bot.id
                return (
                  <button
                    key={bot.id}
                    type="button"
                    onClick={() => handleBotSelect(bot)}
                    className={`flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition ${
                      selected
                        ? 'bg-[color-mix(in_oklab,var(--lagoon)_18%,transparent)]'
                        : 'hover:bg-[var(--link-bg-hover)]'
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-lg shadow-inner ${
                        bot.region === 'vn'
                          ? 'bg-[linear-gradient(135deg,#fee2e2,#fecaca)]'
                          : 'bg-[linear-gradient(135deg,#dbeafe,#bfdbfe)]'
                      }`}
                    >
                      {REGION_FLAG[bot.region]}
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
                      <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[var(--sea-ink-soft)]">
                        <span className="rounded-full bg-[var(--chip-bg)] px-1.5 py-0.5 font-mono">
                          {shortTimezone(bot.timezone)}
                        </span>
                        <span className="truncate font-mono opacity-70">
                          {bot.id.slice(0, 8)}
                        </span>
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>

          {/* Footer */}
          {currentBot && (
            <div className="border-t border-[var(--line)] p-2.5">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200/60 bg-rose-50/70 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200 dark:hover:bg-rose-950/70"
              >
                <LogOut className="h-4 w-4" />
                Đăng xuất bot
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

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
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
        active
          ? 'bg-[linear-gradient(135deg,#56c6be,#7ed3bf)] text-white shadow-sm'
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
