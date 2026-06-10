import type { ReactNode } from 'react'

type Tone = 'green' | 'neutral' | 'brand' | 'violet' | 'amber'

const TONES: Record<Tone, string> = {
  green: 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-emerald-600/20 dark:ring-emerald-400/25',
  neutral: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 ring-neutral-500/20 dark:ring-neutral-400/20',
  brand: 'bg-brand-50 dark:bg-brand-500/15 text-brand-700 dark:text-brand-300 ring-brand-600/20 dark:ring-brand-400/25',
  violet: 'bg-violet-50 dark:bg-violet-500/15 text-violet-700 dark:text-violet-300 ring-violet-600/20 dark:ring-violet-400/25',
  amber: 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 ring-amber-600/20 dark:ring-amber-400/25',
}

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${TONES[tone]}`}
    >
      {children}
    </span>
  )
}

export function PublishBadge({ published }: { published: boolean }) {
  return (
    <Badge tone={published ? 'green' : 'neutral'}>
      <span className={`h-1.5 w-1.5 rounded-full ${published ? 'bg-emerald-500' : 'bg-neutral-400 dark:bg-neutral-500'}`} />
      {published ? 'Опубликовано' : 'Черновик'}
    </Badge>
  )
}
