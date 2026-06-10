import { Download, Inbox, SearchX, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { PageHeader, Card } from '../components/Layout'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { TableSkeleton } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Listbox } from '../components/ui/Listbox'
import { FilterBar } from '../components/filters/FilterBar'
import { SegmentedControl, type Segment } from '../components/filters/SegmentedControl'
import { SearchInput } from '../components/filters/SearchInput'
import { LEAD_DIRECTIONS, LEAD_DIRECTION_LABEL } from '../lib/options'
import { useDebounce } from '../lib/useDebounce'
import type { Lead } from '../lib/types'
import { deleteLead, listLeads } from '../api/resources'
import { useToast } from '../context/ToastContext'
import { LeadDetail } from './LeadDetail'

// Short, fixed-width date for the table row, e.g. "09.06.2026, 18:08".
const fmtDate = (iso: string) => {
  const d = new Date(iso)
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

type KindFilter = 'all' | 'lead' | 'application'
type RangeFilter = 'all' | 'today' | '7d' | '30d'
type Filters = {
  kind: KindFilter
  direction: string // '' = any; else a LEAD_DIRECTIONS value
  slug: string // '' = any; else a vacancy slug (applications only)
  range: RangeFilter
  search: string
}
const DEFAULT_FILTERS: Filters = { kind: 'all', direction: '', slug: '', range: 'all', search: '' }

const KIND_SEGMENTS: Segment<KindFilter>[] = [
  { value: 'all', label: 'Все' },
  { value: 'lead', label: 'Лиды' },
  { value: 'application', label: 'Отклики' },
]
const RANGE_SEGMENTS: Segment<RangeFilter>[] = [
  { value: 'all', label: 'Всё время' },
  { value: 'today', label: 'Сегодня' },
  { value: '7d', label: '7 дней' },
  { value: '30d', label: '30 дней' },
]

// Threshold (ms) for a date range — start of the inclusive window in local tz.
function rangeThreshold(range: RangeFilter): number {
  if (range === 'all') return 0
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const daysBack = range === 'today' ? 0 : range === '7d' ? 6 : 29
  start.setDate(start.getDate() - daysBack)
  return start.getTime()
}

export default function LeadsPage() {
  const toast = useToast()
  const [items, setItems] = useState<Lead[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [detailId, setDetailId] = useState<number | null>(null)
  const [toDelete, setToDelete] = useState<Lead | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const search = useDebounce(filters.search, 250)

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      setItems(await listLeads())
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [])

  const confirmDelete = async () => {
    if (!toDelete) return
    setDeleting(true)
    try {
      await deleteLead(toDelete.id)
      setItems((arr) => arr.filter((x) => x.id !== toDelete.id))
      if (detailId === toDelete.id) setDetailId(null) // close the drawer if it showed this lead
      toast.success('Заявка удалена')
      setToDelete(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Не удалось удалить заявку')
    } finally {
      setDeleting(false)
    }
  }

  useEffect(() => {
    load()
  }, [load])

  // Facet options derived from loaded data (not hardcoded literals).
  // Directions: union of `selected` across leads, ordered by the LEAD_DIRECTIONS contract.
  const directionFacet = useMemo(() => {
    const present = new Set<string>()
    items.forEach((l) => (l.selected ?? []).forEach((s) => present.add(s)))
    return [
      { value: '', label: 'Все направления' },
      ...LEAD_DIRECTIONS.filter((d) => present.has(d)).map((d) => ({ value: d, label: LEAD_DIRECTION_LABEL[d] })),
    ]
  }, [items])

  // Vacancy slugs: distinct `role` among applications.
  const slugFacet = useMemo(() => {
    const present = Array.from(
      new Set(items.filter((l) => l.kind === 'application' && l.role).map((l) => l.role as string)),
    ).sort()
    return [{ value: '', label: 'Все вакансии' }, ...present.map((s) => ({ value: s, label: s }))]
  }, [items])

  const filtersActive =
    filters.kind !== 'all' ||
    filters.direction !== '' ||
    filters.slug !== '' ||
    filters.range !== 'all' ||
    filters.search !== ''

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const threshold = rangeThreshold(filters.range)
    return items.filter((l) => {
      if (filters.kind !== 'all' && l.kind !== filters.kind) return false
      if (filters.direction && !(l.selected ?? []).includes(filters.direction)) return false
      if (filters.slug && l.role !== filters.slug) return false
      if (threshold && new Date(l.created_at).getTime() < threshold) return false
      if (q && !`${l.name} ${l.phone} ${l.message}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [items, filters.kind, filters.direction, filters.slug, filters.range, search])

  const resetFilters = () => setFilters(DEFAULT_FILTERS)

  return (
    <>
      <PageHeader title="Заявки" subtitle="Журнал входящих заявок и откликов (только чтение)" />

      {status === 'ready' && items.length > 0 && (
        <FilterBar count={filtered.length} total={items.length} active={filtersActive} onReset={resetFilters}>
          <SegmentedControl
            ariaLabel="Тип заявки"
            value={filters.kind}
            onChange={(kind) => setFilters((f) => ({ ...f, kind }))}
            options={KIND_SEGMENTS}
          />
          <SegmentedControl
            ariaLabel="Период"
            value={filters.range}
            onChange={(range) => setFilters((f) => ({ ...f, range }))}
            options={RANGE_SEGMENTS}
          />
          <div className="w-44">
            <Listbox
              ariaLabel="Направление"
              value={filters.direction}
              onChange={(direction) => setFilters((f) => ({ ...f, direction }))}
              options={directionFacet}
            />
          </div>
          <div className="w-44">
            <Listbox
              ariaLabel="Вакансия (отклики)"
              value={filters.slug}
              onChange={(slug) => setFilters((f) => ({ ...f, slug }))}
              options={slugFacet}
            />
          </div>
          <SearchInput
            className="min-w-[180px] flex-1"
            ariaLabel="Поиск по имени, телефону, сообщению"
            placeholder="Имя, телефон, сообщение…"
            value={filters.search}
            onChange={(search) => setFilters((f) => ({ ...f, search }))}
          />
        </FilterBar>
      )}

      <Card>
        {status === 'loading' ? (
          <TableSkeleton rows={6} cols={8} />
        ) : status === 'error' ? (
          <EmptyState
            icon={Inbox}
            title="Не удалось загрузить"
            message="Проверьте, что бэкенд запущен, и попробуйте снова."
            action={<Button variant="secondary" onClick={load}>Повторить</Button>}
          />
        ) : items.length === 0 ? (
          <EmptyState icon={Inbox} title="Заявок пока нет" message="Здесь появятся заявки с формы и отклики на вакансии." />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="Ничего не найдено"
            message="Под текущие фильтры нет заявок. Измените условия или сбросьте фильтры."
            action={<Button variant="secondary" onClick={resetFilters}>Сбросить фильтры</Button>}
          />
        ) : (
          <div className="overflow-hidden">
            {/* table-fixed + capped widths + truncate => never overflows horizontally.
                Опыт/Возраст live only in the detail drawer now; lower-priority columns
                drop on narrower widths instead of forcing a horizontal scrollbar. */}
            <table className="w-full table-fixed text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                  <th className="w-[20%] px-4 py-3 font-semibold sm:w-[17%]">Имя</th>
                  <th className="hidden w-[15%] px-4 py-3 font-semibold md:table-cell">Контакт</th>
                  <th className="hidden w-[12%] px-4 py-3 font-semibold sm:table-cell">Телефон</th>
                  <th className="w-[26%] px-4 py-3 font-semibold sm:w-[12%]">Тип</th>
                  <th className="hidden px-4 py-3 font-semibold lg:table-cell">Сообщение</th>
                  <th className="hidden w-[8%] px-4 py-3 font-semibold lg:table-cell">Резюме</th>
                  <th className="w-[26%] px-4 py-3 font-semibold sm:w-[16%]">Дата</th>
                  <th className="w-[12%] px-4 py-3 text-right font-semibold sm:w-[9%]">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {filtered.map((l) => (
                  <tr
                    key={l.id}
                    onClick={() => setDetailId(l.id)}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setDetailId(l.id)
                      }
                    }}
                    aria-label={`Открыть заявку «${l.name}»`}
                    className="cursor-pointer outline-none transition-colors hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 focus-visible:bg-brand-50/60 dark:focus-visible:bg-brand-500/10"
                  >
                    <td className="px-4 py-3.5">
                      <div className="truncate font-semibold text-neutral-900 dark:text-neutral-100">{l.name}</div>
                    </td>
                    <td className="hidden px-4 py-3.5 md:table-cell">
                      <div className="truncate text-neutral-600 dark:text-neutral-300">{l.contact}</div>
                    </td>
                    <td className="hidden px-4 py-3.5 sm:table-cell">
                      <div className="truncate tabular-nums text-neutral-600 dark:text-neutral-300">{l.phone}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      {l.kind === 'application' ? (
                        <div className="flex flex-col items-start gap-1">
                          <Badge tone="violet">Отклик</Badge>
                          {l.role && <span className="max-w-full truncate text-xs text-neutral-500 dark:text-neutral-400">{l.role}</span>}
                        </div>
                      ) : (
                        <Badge tone="brand">Заявка</Badge>
                      )}
                    </td>
                    <td className="hidden px-4 py-3.5 lg:table-cell">
                      <div className="truncate text-neutral-600 dark:text-neutral-300">
                        {l.message ? (
                          l.message
                        ) : l.selected?.length ? (
                          <span className="text-neutral-400 dark:text-neutral-500">Направления: {l.selected.join(', ')}</span>
                        ) : (
                          <span className="text-neutral-300 dark:text-neutral-600">—</span>
                        )}
                      </div>
                    </td>
                    <td className="hidden px-4 py-3.5 lg:table-cell">
                      {l.resume ? (
                        <a
                          href={l.resume}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 dark:bg-brand-500/15 px-2.5 py-1.5 text-xs font-semibold text-brand-700 dark:text-brand-300 transition-colors hover:bg-brand-100 dark:hover:bg-brand-500/25"
                        >
                          <Download className="h-3.5 w-3.5" />
                          PDF
                        </a>
                      ) : (
                        <span className="text-neutral-300 dark:text-neutral-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="truncate whitespace-nowrap tabular-nums text-xs text-neutral-500 dark:text-neutral-400">
                        {fmtDate(l.created_at)}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setToDelete(l)
                          }}
                          className="rounded-lg p-2 text-neutral-400 dark:text-neutral-500 transition-colors hover:bg-red-50 dark:hover:bg-red-500/15 hover:text-red-600 dark:hover:text-red-400"
                          aria-label={`Удалить заявку «${l.name}»`}
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

      <LeadDetail
        id={detailId}
        open={detailId !== null}
        onClose={() => setDetailId(null)}
        onRequestDelete={(lead) => setToDelete(lead)}
      />

      <ConfirmDialog
        open={!!toDelete}
        title="Удалить заявку?"
        message={`Заявка «${toDelete?.name}» будет удалена без возможности восстановления${
          toDelete?.resume ? ', вместе с файлом резюме' : ''
        }.`}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  )
}
