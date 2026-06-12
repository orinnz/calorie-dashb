import { useState } from 'react'
import { Dialog } from '#/components/ui/Dialog'
import { SUPPORTED_LOCALES } from '#/types'
import type {
  ChallengeDimension,
  ChallengeTemplate,
  ChallengeTemplateInput,
  ChallengeType,
  PoolType,
} from '#/types'

const TYPES: ChallengeType[] = ['threshold', 'positive', 'avoidance']
const DIMENSIONS: ChallengeDimension[] = ['nutrition', 'habit', 'activity']

const inputCls =
  'w-full rounded-lg border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2 text-sm text-[var(--sea-ink)] outline-none focus:border-[var(--lagoon-deep)]'
const labelCls = 'text-xs font-semibold text-[var(--sea-ink)]'

interface Props {
  open: boolean
  poolType: PoolType
  initial: ChallengeTemplate | null
  onClose: () => void
  onSubmit: (input: ChallengeTemplateInput, id: string | null) => Promise<void>
}

export function ChallengeFormDialog({ open, poolType, initial, onClose, onSubmit }: Props) {
  const isEdit = !!initial
  const [id, setId] = useState(initial?.id ?? '')
  const [emoji, setEmoji] = useState(initial?.emoji ?? '🎯')
  const [titleEn, setTitleEn] = useState(initial?.titleCanonicalEn ?? '')
  const [translations, setTranslations] = useState<Record<string, string>>(
    initial?.titleTranslations ?? {},
  )
  const [challengeType, setChallengeType] = useState<ChallengeType>(
    initial?.challengeType ?? 'threshold',
  )
  const [dimension, setDimension] = useState<ChallengeDimension>(initial?.dimension ?? 'nutrition')
  const [ruleText, setRuleText] = useState(
    JSON.stringify(initial?.ruleTemplate ?? { metric: 'protein', operator: 'gte', target: 70 }, null, 2),
  )
  const [variantsText, setVariantsText] = useState(
    JSON.stringify(initial?.parameterVariants ?? [], null, 0),
  )
  const [difficulty, setDifficulty] = useState(initial?.difficultyDefault ?? 3)
  const [rewardMin, setRewardMin] = useState(initial?.broccoliRewardMin ?? (poolType === 'weekly' ? 5 : 1))
  const [rewardMax, setRewardMax] = useState(initial?.broccoliRewardMax ?? (poolType === 'weekly' ? 10 : 3))
  const [goalsText, setGoalsText] = useState((initial?.applicableGoals ?? []).join(', '))
  const [starterPool, setStarterPool] = useState(initial?.starterPool ?? false)
  const [active, setActive] = useState(initial?.active ?? true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    setError(null)
    let ruleTemplate: unknown
    try {
      ruleTemplate = JSON.parse(ruleText)
    } catch {
      setError('Rule template không phải JSON hợp lệ')
      return
    }
    let parameterVariants: unknown[] = []
    if (variantsText.trim()) {
      try {
        const parsed = JSON.parse(variantsText)
        if (!Array.isArray(parsed)) throw new Error('not array')
        parameterVariants = parsed
      } catch {
        setError('Parameter variants phải là mảng JSON, ví dụ [60,70,80]')
        return
      }
    }
    if (!isEdit && !titleEn.trim()) {
      setError('Cần tiêu đề tiếng Anh')
      return
    }

    const cleanTranslations: Record<string, string> = {}
    for (const [k, v] of Object.entries(translations)) {
      if (v.trim()) cleanTranslations[k] = v.trim()
    }
    const goals = goalsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    const input: ChallengeTemplateInput = {
      emoji,
      titleCanonicalEn: titleEn.trim(),
      titleTranslations: Object.keys(cleanTranslations).length ? cleanTranslations : null,
      challengeType,
      dimension,
      ruleTemplate,
      parameterVariants,
      difficultyDefault: difficulty,
      broccoliRewardMin: rewardMin,
      broccoliRewardMax: rewardMax,
      applicableGoals: goals.length ? goals : null,
      starterPool,
      active,
    }
    if (!isEdit && id.trim()) input.id = id.trim()

    setSubmitting(true)
    try {
      await onSubmit(input, isEdit ? initial!.id : null)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? `Sửa template · ${initial?.id}` : `Tạo template ${poolType}`}
      description={`${poolType === 'weekly' ? 'Weekly' : 'Daily'} challenge pool`}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[var(--line)] px-4 py-2 text-sm font-semibold text-[var(--sea-ink-soft)]"
          >
            Huỷ
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded-lg bg-[var(--lagoon-deep)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {submitting ? 'Đang lưu…' : isEdit ? 'Lưu thay đổi' : 'Tạo'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="grid grid-cols-[80px_1fr] gap-3">
          <label className="block">
            <span className={labelCls}>Emoji</span>
            <input value={emoji} onChange={(e) => setEmoji(e.target.value)} className={`${inputCls} text-center text-lg`} />
          </label>
          <label className="block">
            <span className={labelCls}>ID {isEdit ? '(không đổi được)' : '(tuỳ chọn, vd d2-protein-70)'}</span>
            <input
              value={id}
              onChange={(e) => setId(e.target.value)}
              disabled={isEdit}
              placeholder="auto UUID nếu để trống"
              className={`${inputCls} disabled:opacity-60`}
            />
          </label>
        </div>

        <label className="block">
          <span className={labelCls}>Tiêu đề (English canonical)</span>
          <input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} className={inputCls} placeholder="Hit 70g protein today" />
        </label>

        <div>
          <span className={labelCls}>Bản dịch (tuỳ chọn)</span>
          <div className="mt-1.5 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SUPPORTED_LOCALES.filter((l) => l !== 'en').map((loc) => (
              <label key={loc} className="block">
                <span className="text-[10px] uppercase font-bold text-[var(--sea-ink-soft)]">{loc}</span>
                <input
                  value={translations[loc] ?? ''}
                  onChange={(e) => setTranslations((t) => ({ ...t, [loc]: e.target.value }))}
                  className={`${inputCls} text-xs`}
                />
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className={labelCls}>Loại</span>
            <select value={challengeType} onChange={(e) => setChallengeType(e.target.value as ChallengeType)} className={inputCls}>
              {TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={labelCls}>Dimension</span>
            <select value={dimension} onChange={(e) => setDimension(e.target.value as ChallengeDimension)} className={inputCls}>
              {DIMENSIONS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="block">
          <span className={labelCls}>Rule template (JSON)</span>
          <textarea value={ruleText} onChange={(e) => setRuleText(e.target.value)} rows={5} className={`${inputCls} font-mono text-xs`} />
        </label>

        <label className="block">
          <span className={labelCls}>Parameter variants (JSON array, vd [60,70,80])</span>
          <input value={variantsText} onChange={(e) => setVariantsText(e.target.value)} className={`${inputCls} font-mono text-xs`} />
        </label>

        <div className="grid grid-cols-3 gap-3">
          <label className="block">
            <span className={labelCls}>Difficulty (1-5)</span>
            <input type="number" min={1} max={5} value={difficulty} onChange={(e) => setDifficulty(Number(e.target.value))} className={inputCls} />
          </label>
          <label className="block">
            <span className={labelCls}>🥦 min</span>
            <input type="number" min={0} value={rewardMin} onChange={(e) => setRewardMin(Number(e.target.value))} className={inputCls} />
          </label>
          <label className="block">
            <span className={labelCls}>🥦 max</span>
            <input type="number" min={0} value={rewardMax} onChange={(e) => setRewardMax(Number(e.target.value))} className={inputCls} />
          </label>
        </div>

        <label className="block">
          <span className={labelCls}>Applicable goals (comma, để trống = tất cả)</span>
          <input value={goalsText} onChange={(e) => setGoalsText(e.target.value)} placeholder="lose, maintain" className={inputCls} />
        </label>

        <div className="flex gap-5">
          <label className="flex items-center gap-2 text-sm text-[var(--sea-ink)]">
            <input type="checkbox" checked={starterPool} onChange={(e) => setStarterPool(e.target.checked)} />
            Starter pool
          </label>
          <label className="flex items-center gap-2 text-sm text-[var(--sea-ink)]">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
            Active
          </label>
        </div>
      </div>
    </Dialog>
  )
}
