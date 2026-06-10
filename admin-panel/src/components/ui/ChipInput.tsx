import { X } from 'lucide-react'
import { useRef, useState, type KeyboardEvent, type MouseEvent } from 'react'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Shared tag chip-input (used by the vacancy & project forms). Container matches
 * the other form inputs (height/radius/border + soft brand focus ring), grows as
 * chips wrap. Chips are pills with a real × button; new chips fade/scale in,
 * removed chips fade/scale out — both honour prefers-reduced-motion.
 */
export function ChipInput({
  value,
  onChange,
  placeholder = 'Введите и нажмите Enter',
}: {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
}) {
  const [draft, setDraft] = useState('')
  // Tags currently playing their exit animation (still in `value` until it ends).
  const [exiting, setExiting] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const add = () => {
    const t = draft.trim()
    if (t && !value.includes(t)) onChange([...value, t])
    setDraft('')
  }

  const remove = (t: string) => {
    if (prefersReducedMotion()) {
      onChange(value.filter((x) => x !== t))
      return
    }
    if (exiting.includes(t)) return
    setExiting((e) => [...e, t])
    window.setTimeout(() => {
      onChange(value.filter((x) => x !== t))
      setExiting((e) => e.filter((x) => x !== t))
    }, 120)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      add()
    } else if (e.key === 'Backspace' && !draft && value.length) {
      remove(value[value.length - 1])
    }
  }

  // Clicking the empty area of the field (not a chip/×) focuses the input.
  const focusOnBlankClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      e.preventDefault()
      inputRef.current?.focus()
    }
  }

  return (
    <div
      onMouseDown={focusOnBlankClick}
      className="flex min-h-[2.75rem] cursor-text flex-wrap items-center gap-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2.5 py-1.5 transition-colors focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/25"
    >
      {value.map((t) => {
        const isExiting = exiting.includes(t)
        return (
          <span
            key={t}
            className={`inline-flex items-center gap-1 rounded-lg bg-brand-50 dark:bg-brand-500/20 py-1 pl-2.5 pr-1 text-xs font-semibold text-brand-700 dark:text-brand-100 ring-1 ring-inset ring-brand-200/70 dark:ring-brand-400/25 motion-reduce:animate-none ${
              isExiting ? 'animate-chip-out pointer-events-none' : 'animate-chip-in'
            }`}
          >
            {t}
            <button
              type="button"
              onClick={() => remove(t)}
              disabled={isExiting}
              className="grid h-[18px] w-[18px] place-items-center rounded-full text-brand-500 dark:text-brand-200/80 transition-colors hover:bg-brand-200/70 dark:hover:bg-brand-400/30 hover:text-brand-800 dark:hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50"
              aria-label={`Удалить тег ${t}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        )
      })}
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={add}
        placeholder={value.length ? 'Ещё тег…' : placeholder}
        className="h-7 min-w-[8rem] flex-1 bg-transparent px-1 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none"
      />
    </div>
  )
}
