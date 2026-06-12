import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { toast } from 'sonner'
import { adminApi } from '#/api/admin'
import { getApiErrorMessage } from '#/api/errors'
import {
  AXIS_COLOR,
  CHART_COLORS,
  ChartCard,
  EmptyBlock,
  GRID_COLOR,
  KpiCard,
  LoadingBlock,
  RangePicker,
  SectionTitle,
} from '#/components/admin/ui'
import type {
  ChallengesAnalyticsResponse,
  FoodLoggingResponse,
  GrowthResponse,
  KeyValue,
  MonetizationResponse,
  OverviewResponse,
} from '#/types'

export const Route = createFileRoute('/admin/')({
  component: DashboardPage,
})

const tooltipStyle = {
  background: 'var(--surface-strong)',
  border: '1px solid var(--line)',
  borderRadius: 12,
  color: 'var(--sea-ink)',
  fontSize: 12,
}

const pct = (n: number) => `${Math.round(n * 100)}%`
const shortDate = (d: string) => d.slice(5)

function DashboardPage() {
  const [days, setDays] = useState(30)
  const [overview, setOverview] = useState<OverviewResponse | null>(null)
  const [growth, setGrowth] = useState<GrowthResponse | null>(null)
  const [food, setFood] = useState<FoodLoggingResponse | null>(null)
  const [challenges, setChallenges] = useState<ChallengesAnalyticsResponse | null>(null)
  const [money, setMoney] = useState<MonetizationResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([
      adminApi.overview(),
      adminApi.growth(days),
      adminApi.foodLogging(days),
      adminApi.challenges(days),
      adminApi.monetization(days),
    ])
      .then(([o, g, f, c, m]) => {
        if (cancelled) return
        setOverview(o)
        setGrowth(g)
        setFood(f)
        setChallenges(c)
        setMoney(m)
      })
      .catch((err) => {
        if (!cancelled) toast.error(getApiErrorMessage(err, 'Không tải được dữ liệu'))
      })
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [days])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="display-title text-2xl font-bold text-[var(--sea-ink)]">Tổng quan</h1>
        <RangePicker value={days} onChange={setDays} />
      </div>

      {/* ── KPI cards ── */}
      {overview ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard
            label="Tổng người dùng"
            value={overview.users.total.toLocaleString()}
            sub={`${overview.users.real} thật · ${overview.users.anonymous} ẩn danh · ${overview.users.bots} bot`}
          />
          <KpiCard
            label="User mới (30d)"
            value={overview.users.new30d.toLocaleString()}
            sub={`Hôm nay +${overview.users.newToday} · 7d +${overview.users.new7d}`}
            accent="var(--palm)"
          />
          <KpiCard
            label="DAU / WAU / MAU"
            value={`${overview.active.dau} / ${overview.active.wau} / ${overview.active.mau}`}
            sub="Active theo daily records"
            accent="var(--lagoon-deep)"
          />
          <KpiCard
            label="Onboarding"
            value={pct(overview.onboarding.rate)}
            sub={`${overview.onboarding.onboarded}/${overview.onboarding.total} hồ sơ`}
          />
          <KpiCard
            label="Subscribers"
            value={overview.monetization.activeSubscribers.toLocaleString()}
            sub="Đang active"
            accent="var(--palm)"
          />
          <KpiCard
            label="MRR (ước tính)"
            value={`${overview.monetization.mrr.toLocaleString()} ${overview.monetization.currency}`}
            sub="Doanh thu hàng tháng"
            accent="var(--lagoon-deep)"
          />
          <KpiCard
            label="Food logs"
            value={food ? food.totals.totalLogs.toLocaleString() : '—'}
            sub={food ? `${food.totals.aiScans} AI scans` : undefined}
          />
          <KpiCard
            label="Longest streak"
            value={challenges ? `${challenges.longestStreak} ngày` : '—'}
            sub="Kỷ lục toàn hệ thống"
            accent="var(--palm)"
          />
        </div>
      ) : (
        <LoadingBlock />
      )}

      {/* ── Growth ── */}
      <SectionTitle>Tăng trưởng & Active users</SectionTitle>
      <div className="grid lg:grid-cols-2 gap-4">
        <ChartCard title="User mới mỗi ngày">
          {growth && growth.newUsers.length ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={growth.newUsers}>
                <CartesianGrid stroke={GRID_COLOR} vertical={false} />
                <XAxis dataKey="date" tickFormatter={shortDate} stroke={AXIS_COLOR} fontSize={11} />
                <YAxis stroke={AXIS_COLOR} fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="value" name="User mới" stroke={CHART_COLORS[0]} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyBlock message={loading ? 'Đang tải…' : 'Chưa có dữ liệu'} />
          )}
        </ChartCard>

        <ChartCard title="Active users mỗi ngày">
          {growth && growth.activeUsers.length ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={growth.activeUsers}>
                <CartesianGrid stroke={GRID_COLOR} vertical={false} />
                <XAxis dataKey="date" tickFormatter={shortDate} stroke={AXIS_COLOR} fontSize={11} />
                <YAxis stroke={AXIS_COLOR} fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="value" name="Active" stroke={CHART_COLORS[1]} fill={CHART_COLORS[1]} fillOpacity={0.18} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyBlock message={loading ? 'Đang tải…' : 'Chưa có dữ liệu'} />
          )}
        </ChartCard>
      </div>

      {/* ── Food logging ── */}
      <SectionTitle>Hành vi ghi log món ăn</SectionTitle>
      <div className="grid lg:grid-cols-2 gap-4">
        <ChartCard title="Food logs mỗi ngày">
          {food && food.logsByDay.length ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={food.logsByDay}>
                <CartesianGrid stroke={GRID_COLOR} vertical={false} />
                <XAxis dataKey="date" tickFormatter={shortDate} stroke={AXIS_COLOR} fontSize={11} />
                <YAxis stroke={AXIS_COLOR} fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(79,184,178,0.08)' }} />
                <Bar dataKey="value" name="Logs" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyBlock message={loading ? 'Đang tải…' : 'Chưa có dữ liệu'} />
          )}
        </ChartCard>

        <ChartCard title="Nguồn log (source)">
          <DonutOrEmpty data={food?.bySource ?? []} loading={loading} />
        </ChartCard>

        <ChartCard title="Theo bữa ăn (meal type)">
          {food && food.byMeal.length ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={food.byMeal} layout="vertical">
                <CartesianGrid stroke={GRID_COLOR} horizontal={false} />
                <XAxis type="number" stroke={AXIS_COLOR} fontSize={11} allowDecimals={false} />
                <YAxis type="category" dataKey="key" stroke={AXIS_COLOR} fontSize={11} width={80} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(79,184,178,0.08)' }} />
                <Bar dataKey="value" name="Logs" fill={CHART_COLORS[2]} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyBlock message={loading ? 'Đang tải…' : 'Chưa có dữ liệu'} />
          )}
        </ChartCard>

        <div className="grid grid-cols-2 gap-3 content-start">
          <KpiCard label="Tổng logs" value={food ? food.totals.totalLogs.toLocaleString() : '—'} />
          <KpiCard label="AI scans" value={food ? food.totals.aiScans.toLocaleString() : '—'} accent="var(--lagoon-deep)" />
          <KpiCard label="Users có log" value={food ? food.totals.loggingUsers.toLocaleString() : '—'} accent="var(--palm)" />
          <KpiCard
            label="AI scan rate"
            value={food && food.totals.totalLogs ? pct(food.totals.aiScans / food.totals.totalLogs) : '—'}
          />
        </div>
      </div>

      {/* ── Challenges ── */}
      <SectionTitle>Challenge engagement</SectionTitle>
      <div className="grid lg:grid-cols-2 gap-4">
        <ChartCard title="Pass rate theo dimension" subtitle="Daily challenges đã finalize">
          {challenges && challenges.dailyByDimension.length ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={challenges.dailyByDimension}>
                <CartesianGrid stroke={GRID_COLOR} vertical={false} />
                <XAxis dataKey="dimension" stroke={AXIS_COLOR} fontSize={11} />
                <YAxis stroke={AXIS_COLOR} fontSize={11} domain={[0, 1]} tickFormatter={pct} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => pct(Number(v))} cursor={{ fill: 'rgba(79,184,178,0.08)' }} />
                <Bar dataKey="passRate" name="Pass rate" fill={CHART_COLORS[3]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyBlock message={loading ? 'Đang tải…' : 'Chưa có dữ liệu'} />
          )}
        </ChartCard>

        <ChartCard title="Phân bố streak hiện tại">
          {challenges && challenges.streakDistribution.some((s) => s.value > 0) ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={challenges.streakDistribution}>
                <CartesianGrid stroke={GRID_COLOR} vertical={false} />
                <XAxis dataKey="bucket" stroke={AXIS_COLOR} fontSize={11} />
                <YAxis stroke={AXIS_COLOR} fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(79,184,178,0.08)' }} />
                <Bar dataKey="value" name="Users" fill={CHART_COLORS[1]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyBlock message={loading ? 'Đang tải…' : 'Chưa có dữ liệu'} />
          )}
        </ChartCard>

        <ChartCard title="Trạng thái daily challenge">
          <DonutOrEmpty data={challenges?.dailyStatus ?? []} loading={loading} paletteOffset={2} />
        </ChartCard>

        <ChartCard title="Broccoli 🥦 earned vs spent">
          {challenges && challenges.broccoli.length ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={challenges.broccoli}>
                <CartesianGrid stroke={GRID_COLOR} vertical={false} />
                <XAxis dataKey="date" tickFormatter={shortDate} stroke={AXIS_COLOR} fontSize={11} />
                <YAxis stroke={AXIS_COLOR} fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Area type="monotone" dataKey="earned" name="Earned" stroke={CHART_COLORS[3]} fill={CHART_COLORS[3]} fillOpacity={0.18} strokeWidth={2} />
                <Area type="monotone" dataKey="spent" name="Spent" stroke={CHART_COLORS[5]} fill={CHART_COLORS[5]} fillOpacity={0.14} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyBlock message={loading ? 'Đang tải…' : 'Chưa có dữ liệu'} />
          )}
        </ChartCard>
      </div>

      {/* ── Monetization ── */}
      <SectionTitle>Monetization</SectionTitle>
      <div className="grid lg:grid-cols-2 gap-4">
        <ChartCard title="Subscriptions theo trạng thái">
          <DonutOrEmpty data={money?.byStatus ?? []} loading={loading} />
        </ChartCard>
        <ChartCard title="Active theo store">
          <DonutOrEmpty data={money?.byStore ?? []} loading={loading} paletteOffset={4} />
        </ChartCard>
        <ChartCard title="Active theo chu kỳ">
          <DonutOrEmpty data={money?.byPeriod ?? []} loading={loading} paletteOffset={1} />
        </ChartCard>
        <ChartCard title="Subscription mới mỗi ngày">
          {money && money.newSubscriptionsByDay.length ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={money.newSubscriptionsByDay}>
                <CartesianGrid stroke={GRID_COLOR} vertical={false} />
                <XAxis dataKey="date" tickFormatter={shortDate} stroke={AXIS_COLOR} fontSize={11} />
                <YAxis stroke={AXIS_COLOR} fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(79,184,178,0.08)' }} />
                <Bar dataKey="value" name="Subs mới" fill={CHART_COLORS[2]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyBlock message={loading ? 'Đang tải…' : 'Chưa có dữ liệu'} />
          )}
        </ChartCard>
      </div>
    </div>
  )
}

function DonutOrEmpty({
  data,
  loading,
  paletteOffset = 0,
}: {
  data: KeyValue[]
  loading: boolean
  paletteOffset?: number
}) {
  if (!data.length) {
    return <EmptyBlock message={loading ? 'Đang tải…' : 'Chưa có dữ liệu'} />
  }
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="key" innerRadius={50} outerRadius={85} paddingAngle={2}>
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[(i + paletteOffset) % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
