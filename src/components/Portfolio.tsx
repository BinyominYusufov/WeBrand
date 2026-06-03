import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { portfolio, type PortfolioItem } from '../data/content'

type Filter = 'Все' | 'Разработка' | 'SMM'

const filters: Filter[] = ['Все', 'Разработка', 'SMM']

const pathToFilter: Record<string, Filter> = {
  '/': 'Все',
  '/devprojects': 'Разработка',
  '/smmprojects': 'SMM',
}

const filterToPath: Record<Filter, string> = {
  Все: '/',
  Разработка: '/devprojects',
  SMM: '/smmprojects',
}

export default function Portfolio() {
  const location = useLocation()
  const navigate = useNavigate()

  const active: Filter = pathToFilter[location.pathname] ?? 'Все'

  // Scroll to portfolio section if user lands directly on a filter URL
  useEffect(() => {
    if (location.pathname !== '/') {
      const id = window.setTimeout(() => {
        document
          .getElementById('portfolio')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 250)
      return () => window.clearTimeout(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSetFilter = (f: Filter) => {
    if (f === active) return
    navigate(filterToPath[f])
  }

  const list =
    active === 'Все' ? portfolio : portfolio.filter((p) => p.category === active)

  return (
    <section id="portfolio" className="relative py-24 lg:py-32 bg-white scroll-mt-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between mb-12 flex-wrap gap-6"
        >
          <div>
            <span className="text-sm font-bold text-brand-600 uppercase tracking-[0.2em]">
              — Портфолио
            </span>
            <h2 className="mt-5 text-5xl lg:text-7xl font-extrabold tracking-tight text-neutral-900 leading-[1.05]">
              Наши работы
            </h2>
          </div>
          <p className="max-w-md text-lg text-neutral-600 leading-relaxed">
            Реальные кейсы — реальные результаты для бизнеса наших клиентов.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="inline-flex p-1.5 rounded-full bg-neutral-100 mb-10 border border-neutral-200"
        >
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => handleSetFilter(f)}
              className={`relative px-6 py-2.5 rounded-full text-sm font-semibold transition-colors ${
                active === f
                  ? 'text-white'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {active === f && (
                <motion.div
                  layoutId="filter-pill"
                  className="absolute inset-0 bg-brand-600 rounded-full shadow-lg shadow-brand-600/30"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{f}</span>
            </button>
          ))}
        </motion.div>

        <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          <AnimatePresence mode="popLayout">
            {list.map((item, i) => (
              <ProjectCard key={item.id} item={item} index={i} />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}

function ProjectCard({ item, index }: { item: PortfolioItem; index: number }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ duration: 0.5, delay: (index % 6) * 0.06 }}
      whileHover={{ y: -8 }}
      className="group relative rounded-3xl overflow-hidden bg-white border border-neutral-200 hover:border-brand-600 hover:shadow-2xl hover:shadow-brand-600/10 transition-all"
    >
      <div
        className="relative aspect-[4/3] overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${item.accent}15, ${item.accent}05 50%, #ffffff)`,
        }}
      >
        <ProjectVisual item={item} />

        <div className="absolute top-4 left-4 z-10">
          <span className="px-3 py-1.5 rounded-full bg-white/95 backdrop-blur text-xs font-bold text-neutral-900 shadow-sm">
            {item.category}
          </span>
        </div>
      </div>

      <div className="p-6 lg:p-7">
        <h3 className="text-xl font-bold text-neutral-900 leading-tight">
          {item.name}{' '}
          <span className="text-neutral-400 font-normal text-base">
            — {item.subtitle}
          </span>
        </h3>
        <p className="mt-3 text-sm text-neutral-600 leading-relaxed line-clamp-2">
          {item.description}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {item.tags.map((t) => (
            <span
              key={t}
              className="px-3 py-1 rounded-full bg-neutral-100 text-xs font-medium text-neutral-700 group-hover:bg-brand-50 group-hover:text-brand-700 transition-colors"
            >
              {t}
            </span>
          ))}
        </div>

        {item.url ? (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 w-full py-3.5 rounded-full bg-brand-600 text-white font-semibold flex items-center justify-center gap-2 group-hover:bg-brand-700 transition-colors shadow-lg shadow-brand-600/20 group-hover:shadow-xl group-hover:shadow-brand-600/30"
          >
            Смотреть кейс
            <ExternalLink className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        ) : (
          <div className="mt-6 w-full py-3.5 rounded-full bg-neutral-100 text-neutral-500 font-semibold flex items-center justify-center gap-2 cursor-not-allowed">
            Кейс скоро
          </div>
        )}
      </div>
    </motion.article>
  )
}

function ProjectVisual({ item }: { item: PortfolioItem }) {
  const initials = item.name.slice(0, 4).toUpperCase()
  return (
    <div className="absolute inset-0 flex items-center justify-center p-6">
      <motion.div
        whileHover={{ scale: 1.05, rotate: -2 }}
        transition={{ type: 'spring' }}
        className="relative"
      >
        <div
          className="absolute inset-0 blur-2xl rounded-full opacity-40"
          style={{ background: item.accent }}
        />
        <div className="relative w-44 h-32 rounded-3xl bg-white shadow-xl border border-neutral-100 flex items-center justify-center overflow-hidden">
          {item.logo ? (
            <img
              src={item.logo}
              alt={item.name}
              className="max-h-20 max-w-[140px] object-contain"
              loading="lazy"
            />
          ) : (
            <div className="text-center px-6">
              <div
                className="text-4xl font-extrabold mb-2 tracking-tight"
                style={{ color: item.accent }}
              >
                {initials}
              </div>
              <div className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold">
                {item.category}
              </div>
            </div>
          )}
        </div>

        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute -top-3 -right-3 w-6 h-6 rounded-full shadow-md"
          style={{ background: item.accent }}
        />
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
          className="absolute -bottom-2 -left-2 w-4 h-4 rounded-full bg-white border-2 shadow"
          style={{ borderColor: item.accent }}
        />
      </motion.div>
    </div>
  )
}
