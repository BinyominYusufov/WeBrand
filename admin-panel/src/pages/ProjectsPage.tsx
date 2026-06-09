import { FolderKanban, Pencil, Plus, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { PageHeader, Card } from '../components/Layout'
import { Button } from '../components/ui/Button'
import { Badge, PublishBadge } from '../components/ui/Badge'
import { TableSkeleton } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Toggle } from '../components/ui/Toggle'
import type { Project } from '../lib/types'
import { deleteProject, listProjects, patchProject } from '../api/resources'
import { useToast } from '../context/ToastContext'
import { ProjectForm } from './ProjectForm'

function LogoCell({ project }: { project: Project }) {
  const initials = project.initials || project.name.slice(0, 2).toUpperCase()
  return (
    <div
      className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl border border-neutral-200 bg-white"
      style={{ boxShadow: `inset 0 0 0 9999px ${project.accent}0D` }}
    >
      {project.logo ? (
        <img src={project.logo} alt="" className="max-h-8 max-w-9 object-contain" />
      ) : (
        <span className="text-xs font-extrabold" style={{ color: project.accent }}>
          {initials}
        </span>
      )}
    </div>
  )
}

export default function ProjectsPage() {
  const toast = useToast()
  const [items, setItems] = useState<Project[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Project | null>(null)
  const [toDelete, setToDelete] = useState<Project | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      setItems(await listProjects())
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
  const openEdit = (p: Project) => {
    setEditing(p)
    setFormOpen(true)
  }

  const togglePublish = async (p: Project) => {
    setItems((arr) => arr.map((x) => (x.id === p.id ? { ...x, is_published: !x.is_published } : x)))
    try {
      await patchProject(p.id, { is_published: !p.is_published })
      toast.success(!p.is_published ? 'Опубликовано' : 'Снято с публикации')
    } catch (err) {
      setItems((arr) => arr.map((x) => (x.id === p.id ? { ...x, is_published: p.is_published } : x)))
      toast.error(err instanceof Error ? err.message : 'Не удалось изменить')
    }
  }

  const confirmDelete = async () => {
    if (!toDelete) return
    setDeleting(true)
    try {
      await deleteProject(toDelete.id)
      toast.success('Проект удалён')
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
        title="Проекты"
        subtitle="Портфолио, отображаемое на главной странице сайта"
        action={
          <Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Новый проект
          </Button>
        }
      />

      <Card>
        {status === 'loading' ? (
          <TableSkeleton rows={6} cols={5} />
        ) : status === 'error' ? (
          <EmptyState
            icon={FolderKanban}
            title="Не удалось загрузить"
            message="Проверьте, что бэкенд запущен, и попробуйте снова."
            action={<Button variant="secondary" onClick={load}>Повторить</Button>}
          />
        ) : items.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="Проектов пока нет"
            message="Добавьте первый проект — он появится в портфолио на сайте."
            action={<Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>Новый проект</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                  <th className="px-5 py-3 font-semibold">Проект</th>
                  <th className="px-5 py-3 font-semibold">Категория</th>
                  <th className="px-5 py-3 font-semibold">Статус</th>
                  <th className="px-5 py-3 text-center font-semibold">Порядок</th>
                  <th className="px-5 py-3 text-right font-semibold">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {items.map((p) => (
                  <tr key={p.id} className="group transition-colors hover:bg-neutral-50/70">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <LogoCell project={p} />
                        <div className="min-w-0">
                          <div className="font-semibold text-neutral-900">{p.name}</div>
                          <div className="truncate text-xs text-neutral-500">{p.subtitle}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge tone={p.category === 'SMM' ? 'violet' : 'brand'}>{p.category}</Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <PublishBadge published={p.is_published} />
                        <Toggle checked={p.is_published} onChange={() => togglePublish(p)} />
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-center tabular-nums text-neutral-500">{p.sort_order}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(p)}
                          className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-brand-50 hover:text-brand-600"
                          aria-label="Редактировать"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setToDelete(p)}
                          className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600"
                          aria-label="Удалить"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {formOpen && (
        <ProjectForm open={formOpen} initial={editing} onClose={() => setFormOpen(false)} onSaved={load} />
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Удалить проект?"
        message={`«${toDelete?.name}» будет удалён без возможности восстановления.`}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  )
}
