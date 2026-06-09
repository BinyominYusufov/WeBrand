import { Briefcase, FolderKanban, Inbox, LogOut, type LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV: { to: string; label: string; Icon: LucideIcon }[] = [
  { to: '/vacancies', label: 'Вакансии', Icon: Briefcase },
  { to: '/projects', label: 'Проекты', Icon: FolderKanban },
  { to: '/leads', label: 'Заявки', Icon: Inbox },
]

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { logout } = useAuth()

  return (
    <aside className="flex h-full w-64 flex-col border-r border-neutral-200 bg-white">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 shadow-sm shadow-brand-600/30">
          <svg viewBox="0 0 32 32" className="h-5 w-5">
            <path
              d="M7 10l3.2 12L14 13l3.8 9L21 10"
              fill="none"
              stroke="#fff"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="leading-tight">
          <div className="text-sm font-extrabold tracking-tight text-neutral-900">Webrand</div>
          <div className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
            Админ-панель
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-2">
        {NAV.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={`h-[18px] w-[18px] ${isActive ? 'text-brand-600' : 'text-neutral-400 group-hover:text-neutral-600'}`}
                />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="border-t border-neutral-200 p-3">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-neutral-600 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Выход
        </button>
      </div>
    </aside>
  )
}
