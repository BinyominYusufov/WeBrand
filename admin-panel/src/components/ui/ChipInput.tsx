import { X } from 'lucide-react'
import { useState, type KeyboardEvent } from 'react'

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

  const add = () => {
    const t = draft.trim()
    if (t && !value.includes(t)) onChange([...value, t])
    setDraft('')
  }
  const remove = (t: string) => onChange(value.filter((x) => x !== t))

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      add()
    } else if (e.key === 'Backspace' && !draft && value.length) {
      remove(value[value.length - 1])
    }
  }

  return (
    <div className="flex min-h-[2.75rem] flex-wrap items-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-2.5 py-1.5 transition-colors focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/30">
      {value.map((t) => (
        <span
          key={t}
          className="inline-flex items-center gap-1 rounded-lg bg-brand-50 py-1 pl-2.5 pr-1.5 text-xs font-semibold text-brand-700"
        >
          {t}
          <button
            type="button"
            onClick={() => remove(t)}
            className="rounded text-brand-400 transition-colors hover:bg-brand-100 hover:text-brand-700"
            aria-label={`Удалить ${t}`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={add}
        placeholder={value.length ? '' : placeholder}
        className="h-7 min-w-[8rem] flex-1 bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
      />
    </div>
  )
}
