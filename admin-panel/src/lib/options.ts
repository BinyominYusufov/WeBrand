import { Palette, Megaphone, Handshake, Code2, Target, Clapperboard, type LucideIcon } from 'lucide-react'

// The 6 icon names the backend accepts (ICON_CHOICES) + their lucide components.
export const ICON_OPTIONS: { value: string; Icon: LucideIcon }[] = [
  { value: 'Palette', Icon: Palette },
  { value: 'Megaphone', Icon: Megaphone },
  { value: 'Handshake', Icon: Handshake },
  { value: 'Code2', Icon: Code2 },
  { value: 'Target', Icon: Target },
  { value: 'Clapperboard', Icon: Clapperboard },
]

export const ICON_MAP: Record<string, LucideIcon> = Object.fromEntries(
  ICON_OPTIONS.map((o) => [o.value, o.Icon]),
)

// Accent tokens the backend accepts for vacancies (ACCENT_CHOICES).
export const ACCENT_OPTIONS = ['brand-500', 'brand-600', 'brand-700'] as const

// Literal classes so they survive Tailwind JIT.
export const ACCENT_DOT: Record<string, string> = {
  'brand-500': 'bg-brand-500',
  'brand-600': 'bg-brand-600',
  'brand-700': 'bg-brand-700',
}
export const ACCENT_TEXT: Record<string, string> = {
  'brand-500': 'text-brand-500',
  'brand-600': 'text-brand-600',
  'brand-700': 'text-brand-700',
}

export const CATEGORY_OPTIONS = ['Разработка', 'SMM'] as const
