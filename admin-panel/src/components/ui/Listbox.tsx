import { Check, ChevronDown, type LucideIcon } from 'lucide-react'
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { usePresence } from '../../lib/usePresence'

export type ListboxOption = {
  value: string
  label: string
  Icon?: LucideIcon
  dotClass?: string
}

/**
 * Accessible custom select. Themed list (not the native OS dropdown), keyboard
 * operable: open with Enter/Space/↑/↓, navigate with ↑/↓/Home/End, select with
 * Enter, close with Esc, plus type-ahead. Roving focus across the options.
 */
export function Listbox({
  value,
  onChange,
  options,
  placeholder = 'Выберите…',
  ariaLabel,
}: {
  value: string
  onChange: (v: string) => void
  options: ListboxOption[]
  placeholder?: string
  ariaLabel?: string
}) {
  const [open, setOpen] = useState(false)
  const { mounted, show } = usePresence(open, 140)
  const [activeIndex, setActiveIndex] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([])
  const typeahead = useRef({ buffer: '', timer: 0 })
  const baseId = useId()
  const selectedIndex = options.findIndex((o) => o.value === value)
  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined

  const openMenu = (index = selectedIndex >= 0 ? selectedIndex : 0) => {
    setActiveIndex(index)
    setOpen(true)
  }
  const close = (refocus = true) => {
    setOpen(false)
    if (refocus) triggerRef.current?.focus()
  }
  const choose = (index: number) => {
    const opt = options[index]
    if (opt) onChange(opt.value)
    close()
  }

  // Close on outside click.
  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  // Move DOM focus to the active option whenever it changes while open.
  useEffect(() => {
    if (open) optionRefs.current[activeIndex]?.focus()
  }, [open, activeIndex])

  const move = (delta: number) => {
    setActiveIndex((i) => {
      const n = options.length
      return (((i + delta) % n) + n) % n
    })
  }

  const onTypeahead = (key: string) => {
    if (key.length !== 1) return
    window.clearTimeout(typeahead.current.timer)
    typeahead.current.buffer += key.toLowerCase()
    const buf = typeahead.current.buffer
    const idx = options.findIndex((o) => o.label.toLowerCase().startsWith(buf))
    if (idx >= 0) setActiveIndex(idx)
    typeahead.current.timer = window.setTimeout(() => (typeahead.current.buffer = ''), 600)
  }

  const onTriggerKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      openMenu()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      openMenu(selectedIndex >= 0 ? selectedIndex : options.length - 1)
    }
  }

  const onListKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); move(1); break
      case 'ArrowUp': e.preventDefault(); move(-1); break
      case 'Home': e.preventDefault(); setActiveIndex(0); break
      case 'End': e.preventDefault(); setActiveIndex(options.length - 1); break
      case 'Enter':
      case ' ': e.preventDefault(); choose(activeIndex); break
      // stopPropagation so Esc closes only this dropdown, not an enclosing
      // Drawer/modal that also listens for Escape on window.
      case 'Escape': e.preventDefault(); e.stopPropagation(); close(); break
      case 'Tab': setOpen(false); break
      default: onTypeahead(e.key)
    }
  }

  const renderInner = (o: ListboxOption) => (
    <>
      {o.Icon && <o.Icon className="h-[18px] w-[18px] text-brand-600" />}
      {o.dotClass && <span className={`h-3.5 w-3.5 rounded-full ${o.dotClass}`} />}
      <span className="truncate">{o.label}</span>
    </>
  )

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (open ? close(false) : openMenu())}
        onKeyDown={onTriggerKeyDown}
        className="flex h-11 w-full items-center gap-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3.5 text-sm text-neutral-900 dark:text-neutral-100 transition-colors hover:border-neutral-400 dark:hover:border-neutral-600 focus:border-brand-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
      >
        {selected ? renderInner(selected) : <span className="text-neutral-400 dark:text-neutral-500">{placeholder}</span>}
        <ChevronDown
          className={`ml-auto h-4 w-4 shrink-0 text-neutral-400 dark:text-neutral-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {mounted && (
        <ul
          role="listbox"
          aria-label={ariaLabel}
          aria-activedescendant={`${baseId}-opt-${activeIndex}`}
          onKeyDown={onListKeyDown}
          className={`scroll-thin absolute z-50 mt-1.5 max-h-60 w-full origin-top overflow-auto rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-1.5 shadow-lg transition duration-150 ease-out motion-reduce:transition-none ${
            show ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          {options.map((o, i) => {
            const isSelected = o.value === value
            return (
              <li key={o.value} role="none">
                <button
                  ref={(el) => (optionRefs.current[i] = el)}
                  id={`${baseId}-opt-${i}`}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  tabIndex={-1}
                  onClick={() => choose(i)}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm outline-none transition-colors ${
                    i === activeIndex ? 'bg-brand-50 dark:bg-brand-500/15 text-brand-700 dark:text-brand-300' : 'text-neutral-700 dark:text-neutral-200'
                  } ${isSelected ? 'font-semibold text-brand-700 dark:text-brand-300' : ''}`}
                >
                  {renderInner(o)}
                  {isSelected && <Check className="ml-auto h-4 w-4 text-brand-600" />}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
