import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

type ToastKind = 'success' | 'error' | 'info'
type Toast = { id: number; kind: ToastKind; message: string; leaving?: boolean }

type ToastCtx = {
  toast: (kind: ToastKind, message: string) => void
  success: (m: string) => void
  error: (m: string) => void
  info: (m: string) => void
}

const Ctx = createContext<ToastCtx | undefined>(undefined)

const ICONS: Record<ToastKind, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
}
const ACCENT: Record<ToastKind, string> = {
  success: 'text-emerald-600 dark:text-emerald-400',
  error: 'text-red-600 dark:text-red-400',
  info: 'text-brand-600 dark:text-brand-400',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const idRef = useRef(0)

  // Animate out first (mark leaving), then unmount after the exit transition.
  const remove = useCallback((id: number) => {
    setToasts((t) => t.map((x) => (x.id === id ? { ...x, leaving: true } : x)))
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 220)
  }, [])

  const toast = useCallback(
    (kind: ToastKind, message: string) => {
      const id = ++idRef.current
      setToasts((t) => [...t, { id, kind, message }])
      window.setTimeout(() => remove(id), 4000)
    },
    [remove],
  )

  const value: ToastCtx = {
    toast,
    success: (m) => toast('success', m),
    error: (m) => toast('error', m),
    info: (m) => toast('info', m),
  }

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[200] flex w-[min(92vw,380px)] flex-col gap-2.5">
        {toasts.map((t) => {
          const Icon = ICONS[t.kind]
          return (
            <div
              key={t.id}
              role="status"
              className={`pointer-events-auto flex items-start gap-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-3.5 shadow-card transition-all duration-200 ease-out motion-reduce:transition-none motion-reduce:animate-none ${
                t.leaving ? 'translate-x-3 opacity-0' : 'animate-toast-in'
              }`}
            >
              <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${ACCENT[t.kind]}`} />
              <p className="flex-1 text-sm font-medium leading-snug text-neutral-800 dark:text-neutral-100">{t.message}</p>
              <button
                onClick={() => remove(t.id)}
                className="rounded-md p-0.5 text-neutral-400 dark:text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-700 dark:hover:text-neutral-200"
                aria-label="Закрыть"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>
    </Ctx.Provider>
  )
}

export function useToast() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
