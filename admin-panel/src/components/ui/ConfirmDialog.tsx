import { AlertTriangle } from 'lucide-react'
import { useEffect } from 'react'
import { Button } from './Button'
import { usePresence } from '../../lib/usePresence'

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Удалить',
  loading,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  const { mounted, show } = usePresence(open, 200)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCancel()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 z-[170] flex items-center justify-center p-4">
      <div
        onClick={onCancel}
        className={`absolute inset-0 bg-neutral-950/45 backdrop-blur-[2px] transition-opacity duration-200 ease-out motion-reduce:transition-none ${
          show ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        className={`relative w-full max-w-md rounded-2xl bg-white dark:bg-neutral-900 p-6 shadow-xl transition-all duration-200 ease-out motion-reduce:transition-none ${
          show ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95'
        }`}
      >
        <div className="flex gap-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-red-50 dark:bg-red-500/15">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">{title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">{message}</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Отмена
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
