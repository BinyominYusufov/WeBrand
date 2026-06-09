import { ImagePlus, Upload, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { Drawer } from '../components/ui/Drawer'
import { Button } from '../components/ui/Button'
import { Field, Input, Select, Textarea } from '../components/ui/Field'
import { ChipInput } from '../components/ui/ChipInput'
import { Toggle } from '../components/ui/Toggle'
import { CATEGORY_OPTIONS } from '../lib/options'
import type { Project } from '../lib/types'
import { createProject, updateProject, type ProjectInput } from '../api/resources'
import { useToast } from '../context/ToastContext'

const HEX_RE = /^#[0-9A-Fa-f]{6}$/

type FormState = {
  name: string
  subtitle: string
  description: string
  category: string
  tags: string[]
  accent: string
  url: string
  initials: string
  sort_order: number
  is_published: boolean
}

const empty: FormState = {
  name: '',
  subtitle: '',
  description: '',
  category: 'Разработка',
  tags: [],
  accent: '#2B5ED3',
  url: '',
  initials: '',
  sort_order: 0,
  is_published: true,
}

function fromProject(p: Project): FormState {
  return {
    name: p.name,
    subtitle: p.subtitle,
    description: p.description,
    category: p.category,
    tags: p.tags,
    accent: p.accent,
    url: p.url ?? '',
    initials: p.initials ?? '',
    sort_order: p.sort_order,
    is_published: p.is_published,
  }
}

export function ProjectForm({
  open,
  initial,
  onClose,
  onSaved,
}: {
  open: boolean
  initial: Project | null
  onClose: () => void
  onSaved: () => void
}) {
  const toast = useToast()
  const isEdit = !!initial
  const [form, setForm] = useState<FormState>(initial ? fromProject(initial) : empty)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }))

  const onPickFile = (file: File | null) => {
    setLogoFile(file)
    setLogoPreview(file ? URL.createObjectURL(file) : null)
  }

  const currentLogo = logoPreview ?? initial?.logo ?? null

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Укажите название'
    if (!form.subtitle.trim()) e.subtitle = 'Укажите подзаголовок'
    if (!form.description.trim()) e.description = 'Добавьте описание'
    if (!HEX_RE.test(form.accent)) e.accent = 'Формат HEX, напр. #2B5ED3'
    if (form.url && !/^https?:\/\//i.test(form.url)) e.url = 'Ссылка должна начинаться с http(s)://'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async () => {
    if (!validate()) return
    setSaving(true)
    const payload: ProjectInput = { ...form, logo: logoFile }
    try {
      if (isEdit) {
        await updateProject(initial!.id, payload)
        toast.success('Проект обновлён')
      } else {
        await createProject(payload)
        toast.success('Проект создан')
      }
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? 'Редактировать проект' : 'Новый проект'}
      subtitle={isEdit ? initial!.name : 'Заполните поля и сохраните'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Отмена
          </Button>
          <Button onClick={submit} loading={saving}>
            {isEdit ? 'Сохранить' : 'Создать'}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Logo upload */}
        <Field label="Логотип" hint="PNG / JPG / WEBP">
          <div className="flex items-center gap-4">
            <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50">
              {currentLogo ? (
                <img src={currentLogo} alt="" className="max-h-16 max-w-16 object-contain" />
              ) : (
                <ImagePlus className="h-6 w-6 text-neutral-300" />
              )}
            </div>
            <div className="flex flex-col gap-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
              />
              <Button variant="secondary" size="sm" icon={<Upload className="h-4 w-4" />} onClick={() => fileRef.current?.click()}>
                {currentLogo ? 'Заменить' : 'Загрузить'}
              </Button>
              {logoFile && (
                <button
                  type="button"
                  onClick={() => onPickFile(null)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-red-600"
                >
                  <X className="h-3.5 w-3.5" /> Убрать новый файл
                </button>
              )}
            </div>
          </div>
        </Field>

        <Field label="Название" required error={errors.name}>
          <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Khotiri Jam" error={!!errors.name} />
        </Field>

        <Field label="Подзаголовок" required error={errors.subtitle}>
          <Input value={form.subtitle} onChange={(e) => set('subtitle', e.target.value)} placeholder="центр детской терапии" error={!!errors.subtitle} />
        </Field>

        <Field label="Описание" required error={errors.description}>
          <Textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={3} error={!!errors.description} />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Категория" required>
            <Select value={form.category} onChange={(e) => set('category', e.target.value)}>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Акцент (HEX)" required error={errors.accent}>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={HEX_RE.test(form.accent) ? form.accent : '#2B5ED3'}
                onChange={(e) => set('accent', e.target.value.toUpperCase())}
                className="h-11 w-12 shrink-0 cursor-pointer rounded-lg border border-neutral-300 bg-white p-1"
                aria-label="Выбрать цвет"
              />
              <Input value={form.accent} onChange={(e) => set('accent', e.target.value)} placeholder="#2B5ED3" error={!!errors.accent} />
            </div>
          </Field>
        </div>

        <Field label="Теги" hint="Enter для добавления">
          <ChipInput value={form.tags} onChange={(t) => set('tags', t)} placeholder="Website, Healthcare…" />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Ссылка на кейс" error={errors.url} hint="необязательно">
            <Input value={form.url} onChange={(e) => set('url', e.target.value)} placeholder="https://example.com" error={!!errors.url} />
          </Field>
          <Field label="Инициалы (fallback)" hint="напр. IC">
            <Input value={form.initials} onChange={(e) => set('initials', e.target.value)} maxLength={4} placeholder="—" />
          </Field>
        </div>

        <div className="grid grid-cols-2 items-start gap-4">
          <Field label="Порядок сортировки">
            <Input type="number" min={0} value={form.sort_order} onChange={(e) => set('sort_order', Number(e.target.value))} />
          </Field>
          <div className="pt-7">
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
              <Toggle
                checked={form.is_published}
                onChange={(v) => set('is_published', v)}
                label="Публикация"
                description={form.is_published ? 'Видна в портфолио' : 'Черновик'}
              />
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  )
}
