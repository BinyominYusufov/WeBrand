import { X } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import { usePresence } from '../../lib/usePresence'

export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
}: {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
}) {
  const { mounted, show } = usePresence(open, 260)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 z-[150]">
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-neutral-950/40 backdrop-blur-[2px] transition-opacity duration-300 ease-out motion-reduce:transition-none ${
          show ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`absolute right-0 top-0 flex h-full w-full max-w-xl flex-col bg-white dark:bg-neutral-900 shadow-drawer transition-transform duration-[260ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
          show ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="flex items-start justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="-mr-2 rounded-lg p-2 text-neutral-400 dark:text-neutral-500 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-200"
            aria-label="Закрыть"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="scroll-thin flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {footer && (
          <footer className="flex items-center justify-end gap-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-800/50 px-6 py-4">
            {footer}
          </footer>
        )}
      </div>
    </div>
  )
}
