import { Lock, User, LogIn } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Field, Input } from '../components/ui/Field'

export default function Login() {
  const { status, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string })?.from || '/vacancies'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (status === 'authed') return <Navigate to={from} replace />

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username.trim(), password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось войти')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-600 to-brand-800 p-12 text-white lg:flex">
        <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_top_left,black,transparent_70%)]" />
        <div className="relative flex items-center gap-2.5">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 backdrop-blur">
            <svg viewBox="0 0 32 32" className="h-6 w-6" aria-hidden="true">
              <text x="16" y="22" fontFamily="Manrope, sans-serif" fontSize="18" fontWeight="800" fill="#fff" textAnchor="middle">W</text>
            </svg>
          </div>
          <span className="text-lg font-extrabold tracking-tight">Webrand</span>
        </div>
        <div className="relative">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight">
            Панель управления<br />контентом сайта
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-white/80">
            Управляйте вакансиями, проектами и заявками. Изменения сразу видны на публичном сайте.
          </p>
        </div>
        <div className="relative text-sm text-white/60">© {new Date().getFullYear()} Webrand</div>
      </div>

      {/* Form panel */}
      <div className="flex w-full items-center justify-center bg-white dark:bg-neutral-900 px-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100">Вход в панель</h2>
            <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">Войдите с учётной записью администратора.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <Field label="Имя пользователя" required>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  autoComplete="username"
                  autoFocus
                  required
                  className="pl-11"
                />
              </div>
            </Field>

            <Field label="Пароль" required>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="pl-11"
                />
              </div>
            </Field>

            {error && (
              <div className="rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 px-3.5 py-2.5 text-sm font-medium text-red-700 dark:text-red-300">
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} icon={<LogIn className="h-4 w-4" />} className="w-full">
              Войти
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
