import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Lock, User } from 'lucide-react'
import { useAuth } from '#/contexts/AuthContext'
import { getApiErrorMessage } from '#/api/errors'
import ThemeToggle from '#/components/ThemeToggle'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const { login, admin, isReady, isLoading } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  // Already signed in → go to dashboard.
  useEffect(() => {
    if (isReady && admin) navigate({ to: '/admin' })
  }, [isReady, admin, navigate])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await login(username.trim(), password)
      toast.success('Đăng nhập thành công')
      navigate({ to: '/admin' })
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Đăng nhập thất bại'))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="island-shell rounded-3xl w-full max-w-md p-8 rise-in">
        <div className="text-center mb-7">
          <div className="island-kicker mb-2">Calorie</div>
          <h1 className="display-title text-3xl font-bold text-[var(--sea-ink)]">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-[var(--sea-ink-soft)]">Đăng nhập để quản trị hệ thống</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-[var(--sea-ink)]">Tên đăng nhập</span>
            <div className="mt-1.5 relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--sea-ink-soft)]" />
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
                className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] pl-9 pr-3 py-2.5 text-[var(--sea-ink)] outline-none focus:border-[var(--lagoon-deep)] focus:ring-2 focus:ring-[rgba(79,184,178,0.25)]"
                placeholder="admin"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-[var(--sea-ink)]">Mật khẩu</span>
            <div className="mt-1.5 relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--sea-ink-soft)]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] pl-9 pr-3 py-2.5 text-[var(--sea-ink)] outline-none focus:border-[var(--lagoon-deep)] focus:ring-2 focus:ring-[rgba(79,184,178,0.25)]"
                placeholder="••••••••"
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-[var(--lagoon-deep)] py-2.5 font-semibold text-white shadow-[0_10px_24px_rgba(50,143,151,0.3)] transition hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {isLoading ? 'Đang đăng nhập…' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  )
}
