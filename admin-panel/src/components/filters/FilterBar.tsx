import { RotateCcw } from 'lucide-react'
import type { ReactNode } from 'react'

/**
 * Slim filter bar above a table: filter controls on the left, a live result
 * count + Reset on the right. Wraps gracefully on tablet.
 */
export function FilterBar({
  children,
  count,
  total,
  active,
  onReset,
}: {
  children: ReactNode
  count: number
  total: number
  active: boolean
  onReset: () => void
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3.5 py-3 shadow-card">
      <div className="flex flex-1 flex-wrap items-center gap-2.5">{children}</div>

      <div className="ml-auto flex items-center gap-3 pl-1">
        <span className="whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400" aria-live="polite">
          Показано <span className="font-semibold text-neutral-800 dark:text-neutral-200">{count}</span> из {total}
        </span>
        {active && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-neutral-500 dark:text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-800 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Сбросить
          </button>
        )}
      </div>
    </div>
  )
}
