import { Inbox } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { PageHeader, Card } from '../components/Layout'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { TableSkeleton } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import type { Lead } from '../lib/types'
import { listLeads } from '../api/resources'

const fmtDate = (iso: string) => {
  const d = new Date(iso)
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export default function LeadsPage() {
  const [items, setItems] = useState<Lead[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      setItems(await listLeads())
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const counts = {
    total: items.length,
    leads: items.filter((l) => l.kind === 'lead').length,
    apps: items.filter((l) => l.kind === 'application').length,
  }

  return (
    <>
      <PageHeader
        title="Заявки"
        subtitle="Журнал входящих заявок и откликов (только чтение)"
        action={
          status === 'ready' && items.length > 0 ? (
            <div className="flex gap-2">
              <Badge tone="brand">Всего: {counts.total}</Badge>
              <Badge tone="neutral">Заявки: {counts.leads}</Badge>
              <Badge tone="violet">Отклики: {counts.apps}</Badge>
            </div>
          ) : undefined
        }
      />

      <Card>
        {status === 'loading' ? (
          <TableSkeleton rows={6} cols={6} />
        ) : status === 'error' ? (
          <EmptyState
            icon={Inbox}
            title="Не удалось загрузить"
            message="Проверьте, что бэкенд запущен, и попробуйте снова."
            action={<Button variant="secondary" onClick={load}>Повторить</Button>}
          />
        ) : items.length === 0 ? (
          <EmptyState icon={Inbox} title="Заявок пока нет" message="Здесь появятся заявки с формы и отклики на вакансии." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                  <th className="px-5 py-3 font-semibold">Имя</th>
                  <th className="px-5 py-3 font-semibold">Контакт</th>
                  <th className="px-5 py-3 font-semibold">Телефон</th>
                  <th className="px-5 py-3 font-semibold">Тип</th>
                  <th className="px-5 py-3 font-semibold">Сообщение</th>
                  <th className="px-5 py-3 text-right font-semibold">Дата</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {items.map((l) => (
                  <tr key={l.id} className="align-top transition-colors hover:bg-neutral-50/70">
                    <td className="px-5 py-3.5 font-semibold text-neutral-900">{l.name}</td>
                    <td className="px-5 py-3.5 text-neutral-600">{l.contact}</td>
                    <td className="px-5 py-3.5 tabular-nums text-neutral-600">{l.phone}</td>
                    <td className="px-5 py-3.5">
                      {l.kind === 'application' ? (
                        <div className="flex flex-col gap-1">
                          <Badge tone="violet">Отклик</Badge>
                          {l.role && <span className="text-xs text-neutral-500">{l.role}</span>}
                        </div>
                      ) : (
                        <Badge tone="brand">Заявка</Badge>
                      )}
                    </td>
                    <td className="max-w-xs px-5 py-3.5 text-neutral-600">
                      {l.message ? (
                        <span className="line-clamp-2">{l.message}</span>
                      ) : l.selected?.length ? (
                        <span className="text-neutral-400">Направления: {l.selected.join(', ')}</span>
                      ) : (
                        <span className="text-neutral-300">—</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-right text-xs text-neutral-500">
                      {fmtDate(l.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  )
}
