import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { challengesApi } from '../api/challenges'
import { BotSelector } from './BotSelector'
import { ManageGroupsTab } from './ManageGroupsTab'
import { SubmitLogsTab } from './SubmitLogsTab'
import { TrackingResultsTab } from './TrackingResultsTab'
import { AdvancedTab } from './AdvancedTab'
import { NotificationsTab } from './NotificationsTab'
import { SubscriptionsTab } from './subscriptions/SubscriptionsTab'
import {
  AlertCircle,
  Bell,
  ClipboardList,
  CreditCard,
  Globe2,
  LineChart,
  Settings2,
  Users2,
} from 'lucide-react'
import type { Bot, BotRegion, ChallengeInstance } from '../types'
import { useNavigate } from '@tanstack/react-router'
import type { DashboardSearch } from '../routes/index'

function botRegion(bot: Pick<Bot, 'region' | 'timezone'>): BotRegion {
  if (bot.region === 'vn' || bot.region === 'intl') return bot.region
  return bot.timezone === 'Asia/Ho_Chi_Minh' ? 'vn' : 'intl'
}

interface DashboardProps {
  search: DashboardSearch
}

const TABS = [
  { id: 'manage', label: 'Quản lý nhóm', icon: Users2 },
  { id: 'logs', label: 'Gửi log', icon: ClipboardList },
  { id: 'tracking', label: 'Theo dõi & Kết quả', icon: LineChart },
  { id: 'advanced', label: 'Nâng cao', icon: Settings2 },
  { id: 'notifications', label: 'Thông báo', icon: Bell },
  { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
] as const

type TabId = (typeof TABS)[number]['id']

const REGION_LABEL = { vn: 'Việt Nam', intl: 'Quốc tế' } as const
const REGION_FLAG = { vn: '🇻🇳', intl: '🌐' } as const

export function Dashboard({ search }: DashboardProps) {
  const { currentUser, currentBot } = useAuth()
  const navigate = useNavigate({ from: '/' })
  const activeTab: TabId = (search.tab as TabId) || 'manage'
  const [challenges, setChallenges] = useState<ChallengeInstance[]>([])
  const [isLoadingChallenges, setIsLoadingChallenges] = useState(false)

  const loadChallenges = async () => {
    setIsLoadingChallenges(true)
    try {
      const data = await challengesApi.getMyInstances()
      setChallenges(data)
    } catch (error) {
      console.error('Không thể tải danh sách challenge:', error)
    } finally {
      setIsLoadingChallenges(false)
    }
  }

  useEffect(() => {
    if (currentUser) {
      loadChallenges()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser])

  if (!currentUser || !currentBot) {
    return (
      <main className="min-h-[calc(100vh-200px)] px-4 py-12">
        <div className="page-wrap">
          <div className="island-shell mx-auto flex max-w-lg flex-col items-center rounded-3xl px-8 py-14 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(135deg,#56c6be,#7ed3bf)] text-white shadow-lg">
              <AlertCircle className="h-7 w-7" />
            </span>
            <p className="island-kicker mt-5">Bot Dashboard</p>
            <h2 className="display-title mt-2 text-2xl font-bold text-[var(--sea-ink)]">
              Chưa chọn bot
            </h2>
            <p className="mt-2 max-w-sm text-sm text-[var(--sea-ink-soft)]">
              Hãy chọn một bot QA để mô phỏng hành vi người dùng và kiểm thử các Social
              Challenges.
            </p>
            <div className="mt-6">
              <BotSelector />
            </div>
          </div>
        </div>
      </main>
    )
  }

  const region = botRegion(currentBot)
  const timezone = currentBot.timezone || 'UTC'
  const activeChallenges = challenges.filter((c) => c.status === 'active').length

  return (
    <main className="min-h-[calc(100vh-200px)] px-3 py-5 sm:px-4 sm:py-8">
      <div className="page-wrap rise-in">
        {/* Hero header */}
        <section className="island-shell relative overflow-hidden rounded-3xl px-4 py-5 sm:px-8 sm:py-8">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[radial-gradient(circle,var(--hero-a),transparent_70%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-[radial-gradient(circle,var(--hero-b),transparent_70%)]"
          />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <p className="island-kicker">Social Challenges · QA Console</p>
              <h1 className="display-title mt-2 text-2xl font-bold leading-tight text-[var(--sea-ink)] sm:text-3xl lg:text-4xl">
                Bảng điều khiển Bot
              </h1>
              <p className="mt-2 max-w-xl text-xs text-[var(--sea-ink-soft)] sm:text-sm lg:text-[15px]">
                Mô phỏng người dùng theo khu vực, gửi log, theo dõi kết quả thử thách và
                kiểm tra notifications — tất cả từ một dashboard.
              </p>

              {/* Stat row */}
              <div className="mt-4 grid grid-cols-1 gap-2 sm:mt-5 sm:flex sm:flex-wrap sm:gap-2.5">
                <StatChip
                  icon={<span className="text-base leading-none">{REGION_FLAG[region]}</span>}
                  label="Khu vực bot"
                  value={REGION_LABEL[region]}
                />
                <StatChip
                  icon={<Globe2 className="h-3.5 w-3.5" />}
                  label="Timezone"
                  value={timezone}
                  mono
                />
                <StatChip
                  icon={<Users2 className="h-3.5 w-3.5" />}
                  label="Challenge active"
                  value={isLoadingChallenges ? '…' : String(activeChallenges)}
                />
              </div>
            </div>

            <div className="flex flex-shrink-0 sm:justify-end">
              <div className="w-full sm:w-auto">
                <BotSelector />
              </div>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <nav
          aria-label="Sections"
          className="island-shell mt-5 flex items-center gap-1.5 overflow-x-auto rounded-2xl p-1.5 sm:mt-6 sm:flex-wrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() =>
                  navigate({ search: (prev) => ({ ...prev, tab: tab.id as TabId }) })
                }
                className={`flex shrink-0 snap-start items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition sm:flex-initial sm:text-sm ${
                  active
                    ? 'bg-[linear-gradient(135deg,#56c6be,#7ed3bf)] text-white shadow-[0_8px_22px_rgba(50,143,151,0.25)]'
                    : 'text-[var(--sea-ink-soft)] hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)]'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Content */}
        <section className="island-shell mt-5 rounded-2xl p-4 sm:mt-6 sm:rounded-3xl sm:p-7">
          {isLoadingChallenges &&
          activeTab !== 'logs' &&
          activeTab !== 'notifications' &&
          activeTab !== 'subscriptions' ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[var(--lagoon-deep)] border-t-transparent" />
                <p className="text-sm text-[var(--sea-ink-soft)]">
                  Đang tải danh sách challenge…
                </p>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'manage' && (
                <ManageGroupsTab
                  challenges={challenges}
                  onChallengesUpdate={loadChallenges}
                />
              )}
              {activeTab === 'logs' && <SubmitLogsTab />}
              {activeTab === 'tracking' && (
                <TrackingResultsTab
                  challenges={challenges}
                  selectedChallengeId={search.challengeId}
                  onChallengeChange={(id) =>
                    navigate({ search: (prev) => ({ ...prev, challengeId: id }) })
                  }
                />
              )}
              {activeTab === 'advanced' && (
                <AdvancedTab
                  challenges={challenges}
                  onChallengesUpdate={loadChallenges}
                />
              )}
              {activeTab === 'notifications' && <NotificationsTab />}
              {activeTab === 'subscriptions' && (
                <SubscriptionsTab selectedUserId={search.subUserId} />
              )}
            </>
          )}
        </section>
      </div>
    </main>
  )
}

interface StatChipProps {
  icon: React.ReactNode
  label: string
  value: string
  mono?: boolean
}

function StatChip({ icon, label, value, mono }: StatChipProps) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1.5 text-xs shadow-[0_6px_16px_rgba(30,90,72,0.06)]">
      <span className="flex h-5 w-5 items-center justify-center text-[var(--lagoon-deep)]">
        {icon}
      </span>
      <span className="text-[var(--sea-ink-soft)]">{label}</span>
      <span
        className={`font-semibold text-[var(--sea-ink)] ${mono ? 'font-mono' : ''}`}
      >
        {value}
      </span>
    </div>
  )
}
