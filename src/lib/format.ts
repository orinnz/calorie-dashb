export function formatRelativeTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  const ms = Date.now() - new Date(iso).getTime()
  if (Number.isNaN(ms)) return '—'
  const seconds = Math.floor(ms / 1000)
  if (seconds < 5) return 'vừa xong'
  if (seconds < 60) return `${seconds}s trước`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} phút trước`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} giờ trước`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} ngày trước`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} tháng trước`
  const years = Math.floor(days / 365)
  return `${years} năm trước`
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export function formatDuration(fromIso: string, toIso: string): string {
  const ms = new Date(toIso).getTime() - new Date(fromIso).getTime()
  if (Number.isNaN(ms) || ms <= 0) return '—'
  const days = Math.floor(ms / (24 * 60 * 60 * 1000))
  if (days >= 1) return `${days} ngày`
  const hours = Math.floor(ms / (60 * 60 * 1000))
  if (hours >= 1) return `${hours} giờ`
  const minutes = Math.floor(ms / (60 * 1000))
  return `${minutes} phút`
}

export function shortId(id: string, head = 8, tail = 4): string {
  if (id.length <= head + tail + 3) return id
  return `${id.slice(0, head)}…${id.slice(-tail)}`
}

export function formatPrice(
  amount: number | null | undefined,
  currency: string | null | undefined,
): string {
  if (amount == null) return '—'
  const cur = currency ?? 'USD'
  try {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: cur,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${amount} ${cur}`
  }
}
