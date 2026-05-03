import { useState } from 'react'
import { toast } from 'sonner'
import { Check, Code2, Copy } from 'lucide-react'
import type { AdminEvent } from '../../types'
import { formatDateTime, formatRelativeTime } from '../../lib/format'
import { Dialog } from '../ui/Dialog'
import { eventColor, eventStatusChip } from './colors'

interface Props {
  event: AdminEvent
  isLast: boolean
}

export function EventTimelineItem({ event, isLast }: Props) {
  const [showJson, setShowJson] = useState(false)
  const colors = eventColor(event.eventType)

  return (
    <div className="relative flex gap-3 sm:gap-4">
      {/* timeline rail */}
      <div className="flex flex-col items-center pt-1.5">
        <span
          className={`relative z-10 w-3 h-3 rounded-full ${colors.dot} ring-4 ring-white dark:ring-slate-900 shadow-[0_0_0_2px_rgba(0,0,0,0.04)]`}
        />
        {!isLast && (
          <span className="flex-1 w-px bg-gradient-to-b from-black/15 dark:from-white/15 to-transparent mt-1 mb-1" />
        )}
      </div>

      <div className="flex-1 min-w-0 pb-4">
        <div className="rounded-xl bg-white/70 dark:bg-white/5 border border-white/60 dark:border-white/5 p-3 sm:p-4 shadow-sm hover:shadow-md transition">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wide ${colors.chip}`}
              >
                {event.eventType}
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide ${eventStatusChip(event.status)}`}
              >
                {event.status}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowJson(true)}
              className="self-start sm:self-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold
                bg-[var(--lagoon)]/15 text-[var(--lagoon-deep)] hover:bg-[var(--lagoon)]/25
                dark:bg-[var(--lagoon)]/20 dark:text-[var(--lagoon)]
                transition"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>
          </div>

          <div className="space-y-0.5 text-xs">
            <p className="text-[var(--sea-ink)] dark:text-white">
              <span className="text-[var(--sea-ink-soft)]">Phát sinh:</span>{' '}
              <span className="font-mono">
                {formatDateTime(event.eventTimestampAt)}
              </span>{' '}
              <span className="text-[var(--sea-ink-soft)]">
                ({formatRelativeTime(event.eventTimestampAt)})
              </span>
            </p>
            <p className="text-[var(--sea-ink-soft)]">
              <span>Nhận:</span>{' '}
              <span className="font-mono">{formatDateTime(event.receivedAt)}</span>
              {event.processedAt && (
                <>
                  {' · '}
                  <span>Xử lý:</span>{' '}
                  <span className="font-mono">
                    {formatDateTime(event.processedAt)}
                  </span>
                </>
              )}
            </p>
            <p className="font-mono text-[10px] text-[var(--sea-ink-soft)] truncate">
              event_id: {event.eventId}
            </p>
            {event.note && (
              <p className="mt-2 text-[11px] sm:text-xs px-2 py-1.5 rounded-md bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/20">
                <span className="font-semibold">Note:</span>{' '}
                <span className="font-mono">{event.note}</span>
              </p>
            )}
            {event.payloadParseError && (
              <p className="mt-2 text-[11px] px-2 py-1.5 rounded-md bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300">
                Payload parse lỗi: {event.payloadParseError}
              </p>
            )}
          </div>
        </div>
      </div>

      {showJson && (
        <JsonDialog
          event={event}
          open={showJson}
          onClose={() => setShowJson(false)}
        />
      )}
    </div>
  )
}

function JsonDialog({
  event,
  open,
  onClose,
}: {
  event: AdminEvent
  open: boolean
  onClose: () => void
}) {
  const [copied, setCopied] = useState(false)
  const json = JSON.stringify(event.payload, null, 2)

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(json)
      setCopied(true)
      toast.success('Đã copy payload')
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error('Không copy được')
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={
        <span className="inline-flex items-center gap-2">
          <Code2 className="w-4 h-4 text-[var(--lagoon-deep)]" />
          <span>Raw payload · {event.eventType}</span>
        </span>
      }
      description={`event_id: ${event.eventId}`}
      maxWidthClass="sm:max-w-3xl lg:max-w-4xl"
      footer={
        <>
          <button
            type="button"
            onClick={onCopy}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold
              bg-[var(--lagoon)] text-white hover:bg-[var(--lagoon-deep)] transition"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" /> <span>Đã copy</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> <span>Copy JSON</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center px-3.5 py-2 rounded-lg text-sm font-medium
              bg-white/60 dark:bg-white/10 text-[var(--sea-ink)] dark:text-white
              border border-[var(--chip-line)] dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/15 transition"
          >
            Đóng
          </button>
        </>
      }
    >
      <pre className="text-[11px] sm:text-xs font-mono leading-relaxed text-[var(--sea-ink)] dark:text-slate-200 whitespace-pre-wrap break-all">
        {event.payload == null ? '(không parse được)' : json}
      </pre>
    </Dialog>
  )
}
