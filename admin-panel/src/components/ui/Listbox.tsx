import { Check, ChevronDown, type LucideIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export type ListboxOption = {
  value: string
  label: string
  Icon?: LucideIcon
  dotClass?: string
}

export function Listbox({
  value,
  onChange,
  options,
  placeholder = 'Выберите…',
}: {
  value: string
  onChange: (v: string) => void
  options: ListboxOption[]
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = options.find((o) => o.value === value)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const renderInner = (o: ListboxOption) => (
    <>
      {o.Icon && <o.Icon className="h-[18px] w-[18px] text-brand-600" />}
      {o.dotClass && <span className={`h-3.5 w-3.5 rounded-full ${o.dotClass}`} />}
      <span className="truncate">{o.label}</span>
    </>
  )

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 w-full items-center gap-2.5 rounded-xl border border-neutral-300 bg-white px-3.5 text-sm text-neutral-900 transition-colors hover:border-neutral-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {selected ? (
          renderInner(selected)
        ) : (
          <span className="text-neutral-400">{placeholder}</span>
        )}
        <ChevronDown className="ml-auto h-4 w-4 shrink-0 text-neutral-400" />
      </button>

      {open && (
        <ul
          role="listbox"
          className="scroll-thin absolute z-50 mt-1.5 max-h-60 w-full animate-fade-in overflow-auto rounded-xl border border-neutral-200 bg-white p-1.5 shadow-lg"
        >
          {options.map((o) => {
            const active = o.value === value
            return (
              <li key={o.value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(o.value)
                    setOpen(false)
                  }}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                    active ? 'bg-brand-50 font-semibold text-brand-700' : 'text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  {renderInner(o)}
                  {active && <Check className="ml-auto h-4 w-4 text-brand-600" />}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
