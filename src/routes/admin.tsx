import { Link, Outlet, createFileRoute, useNavigate, useRouterState } from '@tanstack/react-router'
import { useEffect } from 'react'
import { BarChart3, LogOut, Sparkles, Trophy } from 'lucide-react'
import { useAuth } from '#/contexts/AuthContext'
import ThemeToggle from '#/components/ThemeToggle'

export const Route = createFileRoute('/admin')({
  component: AdminLayout,
})

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: BarChart3, exact: true },
  { to: '/admin/challenges', label: 'Challenges', icon: Trophy, exact: false },
  { to: '/admin/skins', label: 'Skins', icon: Sparkles, exact: false },
]

function AdminLayout() {
  const { admin, isReady, logout } = useAuth()
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  useEffect(() => {
    if (isReady && !admin) navigate({ to: '/login' })
  }, [isReady, admin, navigate])

  if (!isReady || !admin) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[var(--sea-ink-soft)]">
        Đang tải…
      </div>
    )
  }

  function onLogout() {
    logout()
    navigate({ to: '/login' })
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-[var(--line)] bg-[var(--header-bg)] backdrop-blur-md p-4">
        <div className="px-2 py-3 mb-2">
          <div className="island-kicker">Calorie</div>
          <div className="display-title text-xl font-bold text-[var(--sea-ink)]">Admin</div>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to)
            const Icon = item.icon
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  active
                    ? 'bg-[var(--lagoon-deep)] text-white shadow-[0_8px_20px_rgba(50,143,151,0.25)]'
                    : 'text-[var(--sea-ink-soft)] hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-[var(--line)] bg-[var(--header-bg)] backdrop-blur-md px-4 sm:px-6 py-3">
          {/* Mobile nav */}
          <nav className="flex md:hidden gap-1">
            {NAV.map((item) => {
              const active = item.exact ? pathname === item.to : pathname.startsWith(item.to)
              const Icon = item.icon
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
                    active ? 'bg-[var(--lagoon-deep)] text-white' : 'text-[var(--sea-ink-soft)]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
          <div className="hidden md:block text-sm text-[var(--sea-ink-soft)]">
            Xin chào, <span className="font-semibold text-[var(--sea-ink)]">{admin.displayName ?? admin.username}</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-1.5 rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1.5 text-sm font-semibold text-[var(--sea-ink)] transition hover:-translate-y-0.5"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 max-w-[1200px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
