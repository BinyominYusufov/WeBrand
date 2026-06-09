import { Menu, X } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Sidebar } from './Sidebar'

function Topbar({ onMenu }: { onMenu: () => void }) {
  const { username } = useAuth()
  const initial = (username || 'A').charAt(0).toUpperCase()
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-neutral-200 bg-white/80 px-4 backdrop-blur-md md:px-8">
      <button
        onClick={onMenu}
        className="rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-100 md:hidden"
        aria-label="Меню"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="flex-1" />
      <div className="flex items-center gap-2.5">
        <div className="text-right leading-tight">
          <div className="text-sm font-semibold text-neutral-800">{username || 'Администратор'}</div>
          <div className="text-[11px] text-neutral-400">Администратор</div>
        </div>
        <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white">
          {initial}
        </div>
      </div>
    </header>
  )
}

export function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-neutral-50">
      {/* Desktop / tablet sidebar (>= md) */}
      <div className="hidden md:block">
        <div className="fixed inset-y-0 left-0">
          <Sidebar />
        </div>
      </div>

      {/* Mobile sidebar (< md) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 animate-fade-in bg-neutral-950/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 animate-slide-in [animation-name:none]">
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute left-[17rem] top-4 rounded-lg bg-white/90 p-2 text-neutral-600 shadow"
            aria-label="Закрыть меню"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col md:pl-64">
        <Topbar onMenu={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-card ${className}`}>
      {children}
    </div>
  )
}
