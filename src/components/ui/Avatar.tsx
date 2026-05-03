interface AvatarProps {
  fileName?: string | null
  userId?: string | null
  displayName?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZE_CLASS = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
} as const

const COLOR_PAIRS = [
  ['from-emerald-400', 'to-teal-500'],
  ['from-sky-400', 'to-indigo-500'],
  ['from-fuchsia-400', 'to-pink-500'],
  ['from-amber-400', 'to-orange-500'],
  ['from-lime-400', 'to-green-500'],
  ['from-rose-400', 'to-red-500'],
  ['from-violet-400', 'to-purple-500'],
  ['from-cyan-400', 'to-blue-500'],
] as const

function hashToIndex(input: string, mod: number): number {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0
  }
  return hash % mod
}

function getInitial(displayName?: string | null, userId?: string | null): string {
  const source = (displayName ?? userId ?? '?').trim()
  if (!source) return '?'
  const ch = source[0]
  return ch ? ch.toUpperCase() : '?'
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://hono-cloudflare-app.phuoc-anonydev2k3.workers.dev'

export function Avatar({
  fileName,
  userId,
  displayName,
  size = 'md',
  className = '',
}: AvatarProps) {
  const sizeClass = SIZE_CLASS[size]

  if (fileName) {
    const url = `${API_BASE_URL}/uploads/${fileName}`
    return (
      <img
        src={url}
        alt={displayName ?? 'avatar'}
        className={`${sizeClass} rounded-full object-cover ring-2 ring-white/60 dark:ring-white/10 shadow-sm ${className}`}
      />
    )
  }

  const seed = userId ?? displayName ?? 'unknown'
  const [from, to] = COLOR_PAIRS[hashToIndex(seed, COLOR_PAIRS.length)]
  const initial = getInitial(displayName, userId)

  return (
    <div
      aria-hidden
      className={`${sizeClass} rounded-full flex items-center justify-center
        bg-gradient-to-br ${from} ${to}
        text-white font-bold ring-2 ring-white/60 dark:ring-white/10 shadow-sm ${className}`}
    >
      {initial}
    </div>
  )
}
