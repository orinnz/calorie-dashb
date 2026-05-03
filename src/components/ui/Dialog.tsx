import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface DialogProps {
  open: boolean
  onClose: () => void
  title?: ReactNode
  description?: ReactNode
  children: ReactNode
  maxWidthClass?: string
  footer?: ReactNode
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  maxWidthClass = 'sm:max-w-3xl',
  footer,
}: DialogProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const scrollY = window.scrollY
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.left = '0'
    document.body.style.right = '0'
    document.body.style.width = '100%'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
      document.body.style.width = ''
      window.scrollTo(0, scrollY)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        aria-label="Đóng"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
      />
      <div
        className={`relative w-full ${maxWidthClass} max-h-[92vh] sm:max-h-[88vh] flex flex-col
          bg-[var(--surface-strong)] dark:bg-slate-900
          rounded-t-2xl sm:rounded-2xl
          shadow-[0_30px_80px_-20px_rgba(20,40,60,0.45)]
          border border-white/40 dark:border-white/10
          animate-slide-up sm:animate-fade-scale
          pb-safe`}
      >
        {/* Mobile drag handle */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1">
          <div className="w-10 h-1.5 rounded-full bg-black/15 dark:bg-white/20" />
        </div>

        <div className="flex items-start justify-between gap-3 px-5 py-3.5 sm:py-4 border-b border-black/5 dark:border-white/5">
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className="font-semibold text-[var(--sea-ink)] dark:text-white text-base sm:text-lg truncate">
                {title}
              </h3>
            )}
            {description && (
              <p className="mt-0.5 text-xs sm:text-sm text-[var(--sea-ink-soft)] dark:text-slate-400">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="shrink-0 p-1.5 rounded-lg text-[var(--sea-ink-soft)] hover:bg-black/5 dark:hover:bg-white/10 hover:text-[var(--sea-ink)] dark:hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-auto px-5 py-4">{children}</div>

        {footer && (
          <div className="px-5 py-3 border-t border-black/5 dark:border-white/5 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
