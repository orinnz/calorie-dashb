import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useState } from 'react'
import { Pencil, Plus, Power, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { adminApi } from '#/api/admin'
import { getApiErrorMessage } from '#/api/errors'
import { ChallengeFormDialog } from '#/components/admin/ChallengeFormDialog'
import { LoadingBlock } from '#/components/admin/ui'
import type { ChallengeTemplate, ChallengeTemplateInput, PoolType } from '#/types'

export const Route = createFileRoute('/admin/challenges')({
  component: ChallengesPage,
})

const dimColor: Record<string, string> = {
  nutrition: '#328f97',
  habit: '#2f6a4a',
  activity: '#f0a868',
}

function ChallengesPage() {
  const [poolType, setPoolType] = useState<PoolType>('daily')
  const [templates, setTemplates] = useState<ChallengeTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ChallengeTemplate | null>(null)

  const load = useCallback(async (type: PoolType) => {
    setLoading(true)
    try {
      setTemplates(await adminApi.listTemplates(type))
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Không tải được danh sách'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(poolType)
  }, [poolType, load])

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(t: ChallengeTemplate) {
    setEditing(t)
    setDialogOpen(true)
  }

  async function handleSubmit(input: ChallengeTemplateInput, id: string | null) {
    try {
      if (id) {
        await adminApi.updateTemplate(poolType, id, input)
        toast.success('Đã cập nhật template')
      } else {
        await adminApi.createTemplate(poolType, input)
        toast.success('Đã tạo template')
      }
      setDialogOpen(false)
      await load(poolType)
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Lưu thất bại'))
    }
  }

  async function toggleActive(t: ChallengeTemplate) {
    try {
      await adminApi.updateTemplate(poolType, t.id, { active: !t.active })
      await load(poolType)
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Không đổi được trạng thái'))
    }
  }

  async function remove(t: ChallengeTemplate) {
    if (!window.confirm(`Xoá template "${t.id}"? Lịch sử challenge của user sẽ giữ nguyên (template_id = null).`)) {
      return
    }
    try {
      await adminApi.deleteTemplate(poolType, t.id)
      toast.success('Đã xoá template')
      await load(poolType)
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Xoá thất bại'))
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="display-title text-2xl font-bold text-[var(--sea-ink)]">Quản lý Challenge</h1>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] p-0.5 text-sm font-semibold">
            {(['daily', 'weekly'] as PoolType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setPoolType(t)}
                className={`rounded-full px-4 py-1.5 transition ${
                  poolType === t ? 'bg-[var(--lagoon-deep)] text-white' : 'text-[var(--sea-ink-soft)]'
                }`}
              >
                {t === 'daily' ? 'Daily (4/ngày)' : 'Weekly (5/tuần)'}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="flex items-center gap-1.5 rounded-full bg-[var(--lagoon-deep)] px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(50,143,151,0.25)] transition hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            Tạo mới
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingBlock />
      ) : (
        <div className="island-shell rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--line)] text-left text-xs uppercase text-[var(--sea-ink-soft)]">
                  <th className="px-3 py-2.5 font-semibold">Template</th>
                  <th className="px-3 py-2.5 font-semibold">Loại / Dimension</th>
                  <th className="px-3 py-2.5 font-semibold text-center">Diff</th>
                  <th className="px-3 py-2.5 font-semibold text-center">🥦</th>
                  <th className="px-3 py-2.5 font-semibold text-center">Usage</th>
                  <th className="px-3 py-2.5 font-semibold text-center">Pass</th>
                  <th className="px-3 py-2.5 font-semibold text-center">Active</th>
                  <th className="px-3 py-2.5 font-semibold text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((t) => (
                  <tr key={t.id} className="border-b border-[var(--line)]/60 hover:bg-[var(--link-bg-hover)]">
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{t.emoji}</span>
                        <div className="min-w-0">
                          <div className="font-semibold text-[var(--sea-ink)] truncate max-w-[260px]">
                            {t.titleCanonicalEn}
                          </div>
                          <div className="text-[11px] text-[var(--sea-ink-soft)] font-mono truncate max-w-[260px]">
                            {t.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="text-[var(--sea-ink)]">{t.challengeType}</div>
                      <span
                        className="inline-block mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                        style={{ background: dimColor[t.dimension] ?? '#888' }}
                      >
                        {t.dimension}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center text-[var(--sea-ink)]">{t.difficultyDefault}</td>
                    <td className="px-3 py-2.5 text-center text-[var(--sea-ink-soft)]">
                      {t.broccoliRewardMin}–{t.broccoliRewardMax}
                    </td>
                    <td className="px-3 py-2.5 text-center text-[var(--sea-ink-soft)]">{t.usage.materialized}</td>
                    <td className="px-3 py-2.5 text-center text-[var(--sea-ink)]">
                      {t.usage.finalized ? `${Math.round(t.usage.passRate * 100)}%` : '—'}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span
                        className={`inline-block w-2.5 h-2.5 rounded-full ${
                          t.active ? 'bg-emerald-500' : 'bg-gray-400'
                        }`}
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => toggleActive(t)}
                          title={t.active ? 'Tắt' : 'Bật'}
                          className="p-1.5 rounded-lg text-[var(--sea-ink-soft)] hover:bg-black/5 hover:text-[var(--sea-ink)]"
                        >
                          <Power className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(t)}
                          title="Sửa"
                          className="p-1.5 rounded-lg text-[var(--sea-ink-soft)] hover:bg-black/5 hover:text-[var(--sea-ink)]"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(t)}
                          title="Xoá"
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!templates.length && (
                  <tr>
                    <td colSpan={8} className="px-3 py-10 text-center text-[var(--sea-ink-soft)]">
                      Chưa có template nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {dialogOpen && (
        <ChallengeFormDialog
          open={dialogOpen}
          poolType={poolType}
          initial={editing}
          onClose={() => setDialogOpen(false)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  )
}
