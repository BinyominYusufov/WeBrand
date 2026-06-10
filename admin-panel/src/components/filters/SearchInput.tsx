import { Search, X } from 'lucide-react'

/** Controlled search box (icon + clear). Debounce lives in the parent (useDebounce). */
export function SearchInput({
  value,
  onChange,
  placeholder = 'Поиск…',
  ariaLabel = 'Поиск',
  className = '',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  ariaLabel?: string
  className?: string
}) {
  return (
    <div className={`relative ${className}`}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="h-11 w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 pl-10 pr-9 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 [&::-webkit-search-cancel-button]:appearance-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Очистить поиск"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-neutral-400 dark:text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
