import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, Power, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { adminApi } from '#/api/admin'
import { getApiErrorMessage } from '#/api/errors'
import { SkinFormDialog } from '#/components/admin/SkinFormDialog'
import { LoadingBlock } from '#/components/admin/ui'
import { SKIN_CATEGORIES } from '#/types'
import type { Skin, SkinCategory, SkinInput } from '#/types'

export const Route = createFileRoute('/admin/skins')({
  component: SkinsPage,
})

type Filter = 'all' | SkinCategory

const typeBadge: Record<string, string> = {
  free: '#2f6a4a',
  paid: '#f0a868',
  premium: '#9b5de5',
}

function SkinsPage() {
  const [filter, setFilter] = useState<Filter>('all')
  const [skins, setSkins] = useState<Skin[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Skin | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setSkins(await adminApi.listSkins())
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Không tải được danh sách'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const visible = useMemo(
    () => (filter === 'all' ? skins : skins.filter((s) => s.category === filter)),
    [skins, filter],
  )

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(s: Skin) {
    setEditing(s)
    setDialogOpen(true)
  }

  async function handleSubmit(input: SkinInput, id: string | null) {
    try {
      if (id) {
        await adminApi.updateSkin(id, input)
        toast.success('Đã cập nhật skin')
      } else {
        await adminApi.createSkin(input)
        toast.success('Đã tạo skin')
      }
      setDialogOpen(false)
      await load()
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Lưu thất bại'))
    }
  }

  async function toggleActive(s: Skin) {
    try {
      await adminApi.updateSkin(s.id, { active: !s.active })
      await load()
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Không đổi được trạng thái'))
    }
  }

  async function remove(s: Skin) {
    if (!window.confirm(`Xoá skin "${s.name}" (${s.slug})? User đang sở hữu sẽ mất skin này.`)) {
      return
    }
    try {
      await adminApi.deleteSkin(s.id)
      toast.success('Đã xoá skin')
      await load()
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Xoá thất bại'))
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="display-title text-2xl font-bold text-[var(--sea-ink)]">Quản lý Skins</h1>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-full bg-[var(--lagoon-deep)] px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(50,143,151,0.25)] transition hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          Tạo mới
        </button>
      </div>

      <div className="inline-flex flex-wrap gap-0.5 rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] p-0.5 text-sm font-semibold">
        {(['all', ...SKIN_CATEGORIES] as Filter[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 capitalize transition ${
              filter === f ? 'bg-[var(--lagoon-deep)] text-white' : 'text-[var(--sea-ink-soft)]'
            }`}
          >
            {f === 'all' ? 'Tất cả' : f}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingBlock />
      ) : (
        <div className="island-shell rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--line)] text-left text-xs uppercase text-[var(--sea-ink-soft)]">
                  <th className="px-3 py-2.5 font-semibold">Skin</th>
                  <th className="px-3 py-2.5 font-semibold">Category</th>
                  <th className="px-3 py-2.5 font-semibold">Loại</th>
                  <th className="px-3 py-2.5 font-semibold text-center">🥦 Giá</th>
                  <th className="px-3 py-2.5 font-semibold text-center">Sort</th>
                  <th className="px-3 py-2.5 font-semibold text-center">Active</th>
                  <th className="px-3 py-2.5 font-semibold text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((s) => (
                  <tr key={s.id} className="border-b border-[var(--line)]/60 hover:bg-[var(--link-bg-hover)]">
                    <td className="px-3 py-2.5">
                      <div className="font-semibold text-[var(--sea-ink)]">{s.name}</div>
                      <div className="text-[11px] text-[var(--sea-ink-soft)] font-mono">{s.slug}</div>
                    </td>
                    <td className="px-3 py-2.5 capitalize text-[var(--sea-ink)]">{s.category}</td>
                    <td className="px-3 py-2.5">
                      <span
                        className="inline-block rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                        style={{ background: typeBadge[s.type] ?? '#888' }}
                      >
                        {s.type}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center text-[var(--sea-ink-soft)]">
                      {s.type === 'paid' ? (s.amount ?? 0) : '—'}
                    </td>
                    <td className="px-3 py-2.5 text-center text-[var(--sea-ink-soft)]">{s.sortOrder}</td>
                    <td className="px-3 py-2.5 text-center">
                      <span
                        className={`inline-block w-2.5 h-2.5 rounded-full ${
                          s.active ? 'bg-emerald-500' : 'bg-gray-400'
                        }`}
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => toggleActive(s)}
                          title={s.active ? 'Tắt' : 'Bật'}
                          className="p-1.5 rounded-lg text-[var(--sea-ink-soft)] hover:bg-black/5 hover:text-[var(--sea-ink)]"
                        >
                          <Power className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(s)}
                          title="Sửa"
                          className="p-1.5 rounded-lg text-[var(--sea-ink-soft)] hover:bg-black/5 hover:text-[var(--sea-ink)]"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(s)}
                          title="Xoá"
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!visible.length && (
                  <tr>
                    <td colSpan={7} className="px-3 py-10 text-center text-[var(--sea-ink-soft)]">
                      Chưa có skin nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {dialogOpen && (
        <SkinFormDialog
          open={dialogOpen}
          initial={editing}
          onClose={() => setDialogOpen(false)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  )
}
