import { motion } from 'framer-motion'
import { partners } from '../data/content'

export default function Partners() {
  return (
    <section className="relative py-24 lg:py-32 bg-neutral-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-bold text-brand-600 uppercase tracking-[0.2em]">
            — Партнёры
          </span>
          <h2 className="mt-5 text-5xl lg:text-7xl font-extrabold tracking-tight text-neutral-900 leading-[1.05]">
            Нам доверяют
          </h2>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-neutral-600 leading-relaxed">
            Компании из разных отраслей выбирают Webrand для роста своего бизнеса.
          </p>
        </motion.div>
      </div>

      {/* Marquee */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-neutral-50 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-neutral-50 to-transparent z-10 pointer-events-none" />

        <div className="flex gap-5 mb-5 animate-marquee w-max">
          {[...partners, ...partners].map((p, i) => (
            <PartnerCard key={`a-${i}`} name={p} />
          ))}
        </div>
        <div className="flex gap-5 animate-marquee-reverse w-max">
          {[...partners, ...partners].reverse().map((p, i) => (
            <PartnerCard key={`b-${i}`} name={p} variant="dark" />
          ))}
        </div>
      </div>
    </section>
  )
}

function PartnerCard({
  name,
  variant = 'light',
}: {
  name: string
  variant?: 'light' | 'dark'
}) {
  const isDark = variant === 'dark'
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.03 }}
      className={`shrink-0 px-10 py-7 rounded-2xl border min-w-[220px] flex items-center justify-center transition-all group ${
        isDark
          ? 'bg-neutral-900 border-neutral-800 hover:border-brand-500'
          : 'bg-white border-neutral-200 hover:border-brand-600 hover:shadow-lg'
      }`}
    >
      <span
        className={`text-xl font-bold transition-colors ${
          isDark
            ? 'text-white group-hover:text-brand-400'
            : 'text-neutral-700 group-hover:text-brand-600'
        }`}
      >
        {name}
      </span>
    </motion.div>
  )
}
