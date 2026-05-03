import { CreditCard } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import type { DashboardSearch } from '../../routes'
import { UserListPanel } from './UserListPanel'
import { UserDetailPanel } from './UserDetailPanel'

interface Props {
  selectedUserId?: string
}

export function SubscriptionsTab({ selectedUserId }: Props) {
  const navigate = useNavigate({ from: '/' })

  const setSelected = (userId: string | null) => {
    navigate({
      search: (prev: DashboardSearch) => ({
        ...prev,
        subUserId: userId ?? undefined,
      }),
      replace: true,
    })
  }

  const hasSelection = !!selectedUserId

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-5 min-h-[60vh]">
      <div
        className={`${
          hasSelection ? 'hidden lg:flex' : 'flex'
        } flex-col lg:w-[36%] lg:max-w-md lg:shrink-0 lg:max-h-[78vh]`}
      >
        <UserListPanel
          selectedUserId={selectedUserId ?? null}
          onSelect={(id) => setSelected(id)}
        />
      </div>

      <div className={`${hasSelection ? 'flex' : 'hidden lg:flex'} flex-col flex-1 lg:overflow-y-auto lg:max-h-[78vh] lg:pr-1`}>
        {selectedUserId ? (
          <UserDetailPanel userId={selectedUserId} onBack={() => setSelected(null)} />
        ) : (
          <EmptyDetailState />
        )}
      </div>
    </div>
  )
}

function EmptyDetailState() {
  return (
    <div className="island-shell h-full min-h-[400px] flex items-center justify-center p-8 text-center rounded-2xl">
      <div>
        <div className="mx-auto h-14 w-14 rounded-full bg-gradient-to-br from-[var(--lagoon)]/20 to-[var(--lagoon)]/5 flex items-center justify-center mb-4">
          <CreditCard className="w-6 h-6 text-[var(--lagoon-deep)]" />
        </div>
        <p className="display-title text-lg font-semibold text-[var(--sea-ink)] dark:text-white">
          Chọn user để xem chi tiết
        </p>
        <p className="mt-2 text-sm text-[var(--sea-ink-soft)] max-w-sm mx-auto">
          Subscription hiện tại + lịch sử event từ RevenueCat sẽ hiện ra ở đây.
        </p>
      </div>
    </div>
  )
}
