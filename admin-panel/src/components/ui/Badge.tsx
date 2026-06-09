import type { ReactNode } from 'react'

type Tone = 'green' | 'neutral' | 'brand' | 'violet' | 'amber'

const TONES: Record<Tone, string> = {
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  neutral: 'bg-neutral-100 text-neutral-600 ring-neutral-500/20',
  brand: 'bg-brand-50 text-brand-700 ring-brand-600/20',
  violet: 'bg-violet-50 text-violet-700 ring-violet-600/20',
  amber: 'bg-amber-50 text-amber-700 ring-amber-600/20',
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
      <span className={`h-1.5 w-1.5 rounded-full ${published ? 'bg-emerald-500' : 'bg-neutral-400'}`} />
      {published ? 'Опубликовано' : 'Черновик'}
    </Badge>
  )
}
