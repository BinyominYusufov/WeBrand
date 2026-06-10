import { useMemo, useState } from 'react'
import { Drawer } from '../components/ui/Drawer'
import { Button } from '../components/ui/Button'
import { Field, Input, Textarea } from '../components/ui/Field'
import { Listbox } from '../components/ui/Listbox'
import { ChipInput } from '../components/ui/ChipInput'
import { Toggle } from '../components/ui/Toggle'
import { ICON_OPTIONS, ICON_LABEL, EXPERIENCE_OPTIONS, TYPE_OPTIONS } from '../lib/options'
import type { Vacancy } from '../lib/types'
import { createVacancy, updateVacancy } from '../api/resources'
import { useToast } from '../context/ToastContext'

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

// Accent is no longer edited in the admin UI. New vacancies get the model's
// documented default; edits omit it so the stored value is preserved.
const DEFAULT_ACCENT = 'brand-600'

// Icon picker: render the glyph + a Russian caption, but keep the lucide name
// as the stored value (cross-app contract).
const ICON_LB = ICON_OPTIONS.map((o) => ({ value: o.value, label: ICON_LABEL[o.value] ?? o.value, Icon: o.Icon }))

const empty: Vacancy = {
  slug: '',
  title: '',
  tagline: '',
  type: '',
  tags: [],
  icon: 'Palette',
  accent: DEFAULT_ACCENT,
  sort_order: 0,
  is_published: true,
  experience_required: '',
  age_min: null,
  age_max: null,
  resume_required: false,
}

export function VacancyForm({
  open,
  initial,
  onClose,
  onSaved,
}: {
  open: boolean
  initial: Vacancy | null
  onClose: () => void
  onSaved: () => void
}) {
  const toast = useToast()
  const isEdit = !!initial
  const [form, setForm] = useState<Vacancy>(initial ?? empty)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const set = <K extends keyof Vacancy>(k: K, v: Vacancy[K]) => setForm((f) => ({ ...f, [k]: v }))

  // Type options = the two Russian choices, plus the current value if it's a
  // legacy free-text type (so existing vacancies render/keep their value).
  const typeOptions = useMemo(() => {
    const base = TYPE_OPTIONS.map((t) => ({ value: t, label: t }))
    const cur = form.type.trim()
    if (cur && !TYPE_OPTIONS.includes(cur as (typeof TYPE_OPTIONS)[number])) {
      return [{ value: cur, label: cur }, ...base]
    }
    return base
  }, [form.type])

  const validate = () => {
    const e: Record<string, string> = {}
    if (!isEdit) {
      if (!form.slug.trim()) e.slug = 'Укажите slug'
      else if (!SLUG_RE.test(form.slug)) e.slug = 'Только строчные латинские буквы, цифры и дефис'
    }
    if (!form.title.trim()) e.title = 'Укажите заголовок'
    if (!form.tagline.trim()) e.tagline = 'Укажите описание'
    if (!form.type.trim()) e.type = 'Укажите тип занятости'
    const inRange = (n: number | null) => n === null || (n >= 14 && n <= 80)
    if (!inRange(form.age_min)) e.age_min = 'От 14 до 80'
    if (!inRange(form.age_max)) e.age_max = 'От 14 до 80'
    if (form.age_min != null && form.age_max != null && form.age_min > form.age_max)
      e.age_max = 'Должно быть ≥ «от»'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      if (isEdit) {
        // Omit accent on edit (PATCH) so the existing stored value is preserved.
        const { accent: _accent, ...rest } = form
        await updateVacancy(initial!.slug, rest)
        toast.success('Вакансия обновлена')
      } else {
        // Create sends the documented default accent programmatically (no control).
        await createVacancy({ ...form, accent: DEFAULT_ACCENT })
        toast.success('Вакансия создана')
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
      title={isEdit ? 'Редактировать вакансию' : 'Новая вакансия'}
      subtitle={isEdit ? `slug: ${initial!.slug}` : 'Заполните поля и сохраните'}
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
        <Field label="Идентификатор (slug)" required={!isEdit} error={errors.slug} hint={isEdit ? '(нельзя изменить)' : 'designer, smm, frontend…'}>
          <Input
            value={form.slug}
            onChange={(e) => set('slug', e.target.value)}
            placeholder="designer"
            disabled={isEdit}
            error={!!errors.slug}
          />
        </Field>

        <Field label="Заголовок" required error={errors.title}>
          <Input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Дизайнер" error={!!errors.title} />
        </Field>

        <Field label="Описание (tagline)" required error={errors.tagline}>
          <Textarea
            value={form.tagline}
            onChange={(e) => set('tagline', e.target.value)}
            rows={2}
            placeholder="Создаёшь визуал брендов…"
            error={!!errors.tagline}
          />
        </Field>

        <Field label="Тип занятости" required error={errors.type}>
          <Listbox
            ariaLabel="Тип занятости"
            value={form.type}
            onChange={(v) => set('type', v)}
            options={typeOptions}
          />
        </Field>

        <Field label="Иконка" required>
          <Listbox ariaLabel="Иконка" value={form.icon} onChange={(v) => set('icon', v)} options={ICON_LB} />
        </Field>

        <Field label="Теги" hint="Enter для добавления">
          <ChipInput value={form.tags} onChange={(t) => set('tags', t)} placeholder="React, TypeScript…" />
        </Field>

        {/* Требования к кандидату — all optional; shown to applicants on the public form */}
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/60 dark:bg-neutral-800/50 p-4">
          <div className="mb-3 text-sm font-bold text-neutral-700 dark:text-neutral-200">Требования к кандидату</div>
          <div className="space-y-4">
            <Field label="Опыт работы" hint="необязательно">
              <Listbox
                ariaLabel="Опыт работы"
                value={form.experience_required}
                onChange={(v) => set('experience_required', v)}
                options={[{ value: '', label: '— не указано —' }, ...EXPERIENCE_OPTIONS.map((o) => ({ value: o, label: o }))]}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Возраст от" error={errors.age_min}>
                <Input
                  type="number"
                  min={0}
                  aria-label="Возраст от"
                  value={form.age_min ?? ''}
                  onChange={(e) => set('age_min', e.target.value === '' ? null : Number(e.target.value))}
                  placeholder="—"
                  error={!!errors.age_min}
                />
              </Field>
              <Field label="Возраст до" error={errors.age_max}>
                <Input
                  type="number"
                  min={0}
                  aria-label="Возраст до"
                  value={form.age_max ?? ''}
                  onChange={(e) => set('age_max', e.target.value === '' ? null : Number(e.target.value))}
                  placeholder="—"
                  error={!!errors.age_max}
                />
              </Field>
            </div>

            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Резюме (PDF) запрашивается у кандидата всегда — отдельная настройка не нужна.
            </p>
          </div>
        </div>

        {/* Порядок задаётся перетаскиванием в таблице вакансий — здесь поля нет. */}
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-4 py-3">
          <Toggle
            checked={form.is_published}
            onChange={(v) => set('is_published', v)}
            label="Публикация"
            description={form.is_published ? 'Видна на сайте' : 'Черновик'}
          />
        </div>
      </div>
    </Drawer>
  )
}
