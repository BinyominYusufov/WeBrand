import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'

type Theme = 'light' | 'dark'
const KEY = 'wb_admin_theme'

function initialTheme(): Theme {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved === 'light' || saved === 'dark') return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

const Ctx = createContext<{ theme: Theme; toggle: () => void } | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  // The <html> class is set pre-render by the inline script in index.html; keep
  // React state in sync so the toggle re-renders and persists the choice.
  const [theme, setTheme] = useState<Theme>(initialTheme)
  const transitionTimer = useRef<number>(0)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    try {
      localStorage.setItem(KEY, theme)
    } catch {
      /* ignore */
    }
  }, [theme])

  const toggle = useCallback(() => {
    // Animate only the colour change, and only during the switch — add the
    // transition class just before flipping the theme, then remove it. Skipped
    // entirely under reduced-motion (instant switch, no artefacts).
    const root = document.documentElement
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!reduce) {
      root.classList.add('theme-transitions')
      window.clearTimeout(transitionTimer.current)
      transitionTimer.current = window.setTimeout(() => root.classList.remove('theme-transitions'), 280)
    }
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }, [])

  return <Ctx.Provider value={{ theme, toggle }}>{children}</Ctx.Provider>
}

export function useTheme() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
