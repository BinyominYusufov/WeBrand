import { Briefcase, Pencil, Plus, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { PageHeader, Card } from '../components/Layout'
import { Button } from '../components/ui/Button'
import { Badge, PublishBadge } from '../components/ui/Badge'
import { TableSkeleton } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Toggle } from '../components/ui/Toggle'
import { ICON_MAP, ACCENT_TEXT } from '../lib/options'
import type { Vacancy } from '../lib/types'
import { deleteVacancy, listVacancies, patchVacancy } from '../api/resources'
import { useToast } from '../context/ToastContext'
import { VacancyForm } from './VacancyForm'

export default function VacanciesPage() {
  const toast = useToast()
  const [items, setItems] = useState<Vacancy[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Vacancy | null>(null)
  const [toDelete, setToDelete] = useState<Vacancy | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      setItems(await listVacancies())
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }
  const openEdit = (v: Vacancy) => {
    setEditing(v)
    setFormOpen(true)
  }

  const togglePublish = async (v: Vacancy) => {
    // optimistic
    setItems((arr) => arr.map((x) => (x.slug === v.slug ? { ...x, is_published: !x.is_published } : x)))
    try {
      await patchVacancy(v.slug, { is_published: !v.is_published })
      toast.success(!v.is_published ? 'Опубликовано' : 'Снято с публикации')
    } catch (err) {
      setItems((arr) => arr.map((x) => (x.slug === v.slug ? { ...x, is_published: v.is_published } : x)))
      toast.error(err instanceof Error ? err.message : 'Не удалось изменить')
    }
  }

  const confirmDelete = async () => {
    if (!toDelete) return
    setDeleting(true)
    try {
      await deleteVacancy(toDelete.slug)
      toast.success('Вакансия удалена')
      setToDelete(null)
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ошибка удаления')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Вакансии"
        subtitle="Открытые позиции, отображаемые на странице /vacancies"
        action={
          <Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Новая вакансия
          </Button>
        }
      />

      <Card>
        {status === 'loading' ? (
          <TableSkeleton rows={6} cols={5} />
        ) : status === 'error' ? (
          <EmptyState
            icon={Briefcase}
            title="Не удалось загрузить"
            message="Проверьте, что бэкенд запущен, и попробуйте снова."
            action={<Button variant="secondary" onClick={load}>Повторить</Button>}
          />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="Вакансий пока нет"
            message="Создайте первую вакансию — она появится на публичном сайте."
            action={<Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>Новая вакансия</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                  <th className="px-5 py-3 font-semibold">Вакансия</th>
                  <th className="px-5 py-3 font-semibold">Теги</th>
                  <th className="px-5 py-3 font-semibold">Статус</th>
                  <th className="px-5 py-3 text-center font-semibold">Порядок</th>
                  <th className="px-5 py-3 text-right font-semibold">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {items.map((v) => {
                  const Icon = ICON_MAP[v.icon] ?? Briefcase
                  return (
                    <tr key={v.slug} className="group transition-colors hover:bg-neutral-50/70">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50">
                            <Icon className={`h-5 w-5 ${ACCENT_TEXT[v.accent] ?? 'text-brand-600'}`} />
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-neutral-900">{v.title}</div>
                            <div className="truncate text-xs text-neutral-500">{v.type}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-wrap gap-1.5">
                          {v.tags.slice(0, 3).map((t) => (
                            <Badge key={t}>{t}</Badge>
                          ))}
                          {v.tags.length > 3 && <Badge>+{v.tags.length - 3}</Badge>}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <PublishBadge published={v.is_published} />
                          <Toggle checked={v.is_published} onChange={() => togglePublish(v)} />
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-center tabular-nums text-neutral-500">{v.sort_order}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(v)}
                            className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-brand-50 hover:text-brand-600"
                            aria-label="Редактировать"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setToDelete(v)}
                            className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600"
                            aria-label="Удалить"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {formOpen && (
        <VacancyForm
          open={formOpen}
          initial={editing}
          onClose={() => setFormOpen(false)}
          onSaved={load}
        />
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Удалить вакансию?"
        message={`«${toDelete?.title}» будет удалена без возможности восстановления.`}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  )
}
