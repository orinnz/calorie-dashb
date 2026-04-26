import { createFileRoute } from '@tanstack/react-router'
import { Dashboard } from '#/components/Dashboard'

export type DashboardSearch = {
  tab?: 'manage' | 'logs' | 'tracking' | 'advanced' | 'notifications'
  challengeId?: string
}

export const Route = createFileRoute('/')({
  validateSearch: (search: Record<string, unknown>): DashboardSearch => {
    return {
      tab: (search.tab as DashboardSearch['tab']) || 'manage',
      challengeId: (search.challengeId as string) || undefined,
    }
  },
  component: App,
})

function App() {
  const search = Route.useSearch()
  return <Dashboard search={search} />
}
