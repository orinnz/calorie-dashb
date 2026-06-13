import { useState } from 'react'
import { Dialog } from '#/components/ui/Dialog'
import { SKIN_CATEGORIES, SKIN_TYPES } from '#/types'
import type { Skin, SkinCategory, SkinInput, SkinType } from '#/types'

const inputCls =
  'w-full rounded-lg border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2 text-sm text-[var(--sea-ink)] outline-none focus:border-[var(--lagoon-deep)]'
const labelCls = 'text-xs font-semibold text-[var(--sea-ink)]'

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '')
}

interface Props {
  open: boolean
  initial: Skin | null
  onClose: () => void
  onSubmit: (input: SkinInput, id: string | null) => Promise<void>
}

export function SkinFormDialog({ open, initial, onClose, onSubmit }: Props) {
  const isEdit = !!initial
  const [name, setName] = useState(initial?.name ?? '')
  const [slug, setSlug] = useState(initial?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(isEdit)
  const [type, setType] = useState<SkinType>(initial?.type ?? 'free')
  const [amount, setAmount] = useState(initial?.amount ?? 0)
  const [category, setCategory] = useState<SkinCategory>(initial?.category ?? 'drinks')
  const [active, setActive] = useState(initial?.active ?? true)
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder ?? 0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function onNameChange(value: string) {
    setName(value)
    if (!slugTouched) setSlug(slugify(value))
  }

  async function handleSubmit() {
    setError(null)
    if (!name.trim()) {
      setError('Cần tên skin')
      return
    }
    if (!slug.trim()) {
      setError('Cần slug')
      return
    }
    if (!/^[a-z0-9]+$/.test(slug)) {
      setError('Slug chỉ gồm chữ thường và số, không khoảng trắng')
      return
    }
    if (type === 'paid' && amount <= 0) {
      setError('Skin paid cần giá (amount) > 0')
      return
    }

    const input: SkinInput = {
      name: name.trim(),
      slug: slug.trim(),
      type,
      amount: type === 'paid' ? amount : null,
      category,
      active,
      sortOrder,
    }

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
      maxWidthClass="sm:max-w-xl"
      title={isEdit ? `Sửa skin · ${initial?.slug}` : 'Tạo skin mới'}
      description="Skin nền hiển thị cho user"
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

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className={labelCls}>Tên</span>
            <input value={name} onChange={(e) => onNameChange(e.target.value)} className={inputCls} placeholder="Aqua" />
          </label>
          <label className="block">
            <span className={labelCls}>Slug {isEdit ? '' : '(tự sinh từ tên)'}</span>
            <input
              value={slug}
              onChange={(e) => {
                setSlugTouched(true)
                setSlug(slugify(e.target.value))
              }}
              className={`${inputCls} font-mono`}
              placeholder="aqua"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className={labelCls}>Loại</span>
            <select value={type} onChange={(e) => setType(e.target.value as SkinType)} className={inputCls}>
              {SKIN_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={labelCls}>Category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as SkinCategory)}
              className={inputCls}
            >
              {SKIN_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className={labelCls}>🥦 Giá (chỉ khi type = paid)</span>
            <input
              type="number"
              min={0}
              value={amount}
              disabled={type !== 'paid'}
              onChange={(e) => setAmount(Number(e.target.value))}
              className={`${inputCls} disabled:opacity-50`}
            />
          </label>
          <label className="block">
            <span className={labelCls}>Sort order</span>
            <input
              type="number"
              min={0}
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              className={inputCls}
            />
          </label>
        </div>

        <label className="flex items-center gap-2 text-sm text-[var(--sea-ink)]">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
          Active
        </label>
      </div>
    </Dialog>
  )
}
