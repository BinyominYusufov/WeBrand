import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export function EmptyState({
  icon: Icon,
  title,
  message,
  action,
}: {
  icon: LucideIcon
  title: string
  message: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 dark:bg-brand-500/15 text-brand-600 dark:text-brand-300">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="mt-4 text-base font-bold text-neutral-900 dark:text-neutral-100">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-neutral-500 dark:text-neutral-400">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
