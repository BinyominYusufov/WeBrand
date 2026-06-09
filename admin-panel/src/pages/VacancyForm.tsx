import { useState } from 'react'
import { Drawer } from '../components/ui/Drawer'
import { Button } from '../components/ui/Button'
import { Field, Input, Textarea } from '../components/ui/Field'
import { Listbox } from '../components/ui/Listbox'
import { ChipInput } from '../components/ui/ChipInput'
import { Toggle } from '../components/ui/Toggle'
import { ACCENT_OPTIONS, ACCENT_DOT, ICON_OPTIONS } from '../lib/options'
import type { Vacancy } from '../lib/types'
import { createVacancy, updateVacancy } from '../api/resources'
import { useToast } from '../context/ToastContext'

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const ICON_LB = ICON_OPTIONS.map((o) => ({ value: o.value, label: o.value, Icon: o.Icon }))
const ACCENT_LB = ACCENT_OPTIONS.map((a) => ({ value: a, label: a, dotClass: ACCENT_DOT[a] }))

const empty: Vacancy = {
  slug: '',
  title: '',
  tagline: '',
  type: '',
  tags: [],
  icon: 'Palette',
  accent: 'brand-600',
  sort_order: 0,
  is_published: true,
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

  const validate = () => {
    const e: Record<string, string> = {}
    if (!isEdit) {
      if (!form.slug.trim()) e.slug = 'Укажите slug'
      else if (!SLUG_RE.test(form.slug)) e.slug = 'Только строчные латинские буквы, цифры и дефис'
    }
    if (!form.title.trim()) e.title = 'Укажите заголовок'
    if (!form.tagline.trim()) e.tagline = 'Укажите описание'
    if (!form.type.trim()) e.type = 'Укажите тип занятости'
    if (form.sort_order < 0 || Number.isNaN(form.sort_order)) e.sort_order = 'Неверное значение'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      if (isEdit) {
        await updateVacancy(initial!.slug, form)
        toast.success('Вакансия обновлена')
      } else {
        await createVacancy(form)
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
        <Field label="Slug" required={!isEdit} error={errors.slug} hint={isEdit ? '(нельзя изменить)' : 'designer, smm, frontend…'}>
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
          <Input value={form.type} onChange={(e) => set('type', e.target.value)} placeholder="Полная занятость · Душанбе" error={!!errors.type} />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Иконка" required>
            <Listbox value={form.icon} onChange={(v) => set('icon', v)} options={ICON_LB} />
          </Field>
          <Field label="Акцент" required>
            <Listbox value={form.accent} onChange={(v) => set('accent', v)} options={ACCENT_LB} />
          </Field>
        </div>

        <Field label="Теги" hint="Enter для добавления">
          <ChipInput value={form.tags} onChange={(t) => set('tags', t)} placeholder="React, TypeScript…" />
        </Field>

        <div className="grid grid-cols-2 items-start gap-4">
          <Field label="Порядок сортировки" error={errors.sort_order}>
            <Input
              type="number"
              min={0}
              value={form.sort_order}
              onChange={(e) => set('sort_order', Number(e.target.value))}
              error={!!errors.sort_order}
            />
          </Field>
          <div className="pt-7">
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
              <Toggle
                checked={form.is_published}
                onChange={(v) => set('is_published', v)}
                label="Публикация"
                description={form.is_published ? 'Видна на сайте' : 'Черновик'}
              />
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  )
}
