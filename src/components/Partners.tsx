import { motion } from 'framer-motion'
import { partners, type Partner } from '../data/content'

export default function Partners() {
  const withLogo = partners.filter((p) => p.logo)
  const withoutLogo = partners.filter((p) => !p.logo)

  // Distribute partners across 2 rows for visual balance
  const row1 = [...withLogo, ...withoutLogo.slice(0, Math.ceil(withoutLogo.length / 2))]
  const row2 = [...withoutLogo.slice(Math.ceil(withoutLogo.length / 2)), ...withLogo]

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
          {[...row1, ...row1].map((p, i) => (
            <PartnerCard key={`a-${i}`} partner={p} />
          ))}
        </div>
        <div className="flex gap-5 animate-marquee-reverse w-max">
          {[...row2, ...row2].map((p, i) => (
            <PartnerCard key={`b-${i}`} partner={p} variant="dark" />
          ))}
        </div>
      </div>
    </section>
  )
}

function PartnerCard({
  partner,
  variant = 'light',
}: {
  partner: Partner
  variant?: 'light' | 'dark'
}) {
  const isDark = variant === 'dark'
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.04 }}
      className={`shrink-0 h-28 px-8 rounded-2xl border min-w-[200px] flex items-center justify-center transition-all group ${
        isDark
          ? 'bg-neutral-900 border-neutral-800 hover:border-brand-500'
          : 'bg-white border-neutral-200 hover:border-brand-600 hover:shadow-lg'
      }`}
    >
      {partner.logo ? (
        <img
          src={partner.logo}
          alt={partner.name}
          className={`max-h-16 max-w-[140px] object-contain transition-all ${
            isDark
              ? 'brightness-110 grayscale group-hover:grayscale-0'
              : 'grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100'
          }`}
          loading="lazy"
        />
      ) : (
        <span
          className={`text-xl font-bold transition-colors ${
            isDark
              ? 'text-white group-hover:text-brand-400'
              : 'text-neutral-700 group-hover:text-brand-600'
          }`}
        >
          {partner.name}
        </span>
      )}
    </motion.div>
  )
}
