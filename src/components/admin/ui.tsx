import type { ReactNode } from 'react'

export const CHART_COLORS = [
  '#4fb8b2',
  '#328f97',
  '#2f6a4a',
  '#6ec89a',
  '#f0a868',
  '#e07a5f',
  '#8d99ae',
  '#c39bd3',
]

export const AXIS_COLOR = 'rgba(120,140,140,0.55)'
export const GRID_COLOR = 'rgba(120,140,140,0.18)'

export function KpiCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string
  value: ReactNode
  sub?: ReactNode
  accent?: string
}) {
  return (
    <div className="feature-card island-shell rounded-2xl p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-[var(--sea-ink-soft)]">
        {label}
      </div>
      <div
        className="mt-1.5 text-2xl font-bold"
        style={{ color: accent ?? 'var(--sea-ink)' }}
      >
        {value}
      </div>
      {sub != null && <div className="mt-0.5 text-xs text-[var(--sea-ink-soft)]">{sub}</div>}
    </div>
  )
}

export function ChartCard({
  title,
  subtitle,
  children,
  right,
}: {
  title: string
  subtitle?: string
  children: ReactNode
  right?: ReactNode
}) {
  return (
    <div className="island-shell rounded-2xl p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="font-semibold text-[var(--sea-ink)]">{title}</h3>
          {subtitle && <p className="text-xs text-[var(--sea-ink-soft)] mt-0.5">{subtitle}</p>}
        </div>
        {right}
      </div>
      {children}
    </div>
  )
}

export function RangePicker({
  value,
  onChange,
}: {
  value: number
  onChange: (days: number) => void
}) {
  const options = [7, 30, 90]
  return (
    <div className="inline-flex rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] p-0.5 text-xs font-semibold">
      {options.map((d) => (
        <button
          key={d}
          type="button"
          onClick={() => onChange(d)}
          className={`rounded-full px-3 py-1 transition ${
            value === d ? 'bg-[var(--lagoon-deep)] text-white' : 'text-[var(--sea-ink-soft)]'
          }`}
        >
          {d}d
        </button>
      ))}
    </div>
  )
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-lg font-bold text-[var(--sea-ink)] mt-2 mb-3 display-title">{children}</h2>
  )
}

export function LoadingBlock() {
  return (
    <div className="island-shell rounded-2xl p-8 text-center text-sm text-[var(--sea-ink-soft)] animate-pulse">
      Đang tải dữ liệu…
    </div>
  )
}

export function EmptyBlock({ message }: { message: string }) {
  return (
    <div className="flex h-[240px] items-center justify-center text-sm text-[var(--sea-ink-soft)]">
      {message}
    </div>
  )
}
