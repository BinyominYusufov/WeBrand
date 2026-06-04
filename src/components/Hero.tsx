import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { ArrowRight, Sparkles, Rocket, Zap } from 'lucide-react'
import { heroTags, contacts } from '../data/content'
import { useModal } from '../context/ModalContext'

export default function Hero() {
  const { open: openModal } = useModal()
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], [0, 150])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <section
      id="top"
      ref={ref}
      className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden"
    >
      {/* Background mesh */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          style={{ y }}
          className="absolute top-32 left-[10%] w-[28rem] h-[28rem] bg-brand-600/25 rounded-full blur-3xl animate-float"
        />
        <motion.div
          style={{ y }}
          className="absolute bottom-20 right-[8%] w-[26rem] h-[26rem] bg-brand-400/25 rounded-full blur-3xl animate-float-slow"
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60rem] h-[60rem] bg-gradient-to-r from-brand-600/10 to-brand-400/10 rounded-full blur-3xl" />
        {/* Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      </div>

      <motion.div
        style={{ opacity }}
        className="max-w-7xl mx-auto px-6 lg:px-10 w-full"
      >
        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-center text-5xl sm:text-6xl lg:text-[7rem] font-extrabold tracking-tight text-neutral-900 leading-[1.02]"
        >
          Превращаем бизнес
          <br />
          в{' '}
          <span className="bg-gradient-to-r from-brand-700 via-brand-500 to-brand-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
            digital-бренд
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 text-center text-lg lg:text-xl text-neutral-600 max-w-2xl mx-auto text-balance leading-relaxed"
        >
          Разрабатываем сайты, выстраиваем бренд, привлекаем клиентов через SMM и контекстную рекламу. Комплексные решения, которые приносят прибыль.
        </motion.p>

        {/* Floating tags */}
        <div className="relative mt-14">
          <div className="flex flex-wrap justify-center gap-3">
            {heroTags.map((tag, i) => (
              <motion.div
                key={tag}
                initial={{ opacity: 0, scale: 0, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: 0.6 + i * 0.08,
                  type: 'spring',
                  stiffness: 120,
                }}
                whileHover={{ scale: 1.08, y: -4, rotate: [-1, 1, 0] }}
                className="px-6 py-3 rounded-full bg-white border border-neutral-200 shadow-sm font-semibold text-neutral-800 hover:border-brand-600 hover:text-brand-600 hover:shadow-xl hover:shadow-brand-600/10 transition-all cursor-default select-none"
              >
                {tag}
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={openModal}
            className="group px-8 py-4 rounded-full bg-neutral-900 text-white font-semibold shadow-xl hover:shadow-2xl transition-shadow flex items-center gap-3"
          >
            Связаться с нами
            <span className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center group-hover:rotate-45 transition-transform">
              <ArrowRight className="w-4 h-4 -rotate-45 group-hover:rotate-0 transition-transform" />
            </span>
          </motion.button>
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            href="#portfolio"
            className="px-8 py-4 rounded-full bg-white border-2 border-neutral-200 hover:border-brand-600 hover:text-brand-600 font-semibold transition-colors"
          >
            Смотреть работы
          </motion.a>
        </motion.div>

        {/* Floating decorative icons */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, type: 'spring' }}
          className="hidden lg:block absolute top-32 left-[6%] animate-float"
        >
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-2xl shadow-brand-600/40 rotate-12 flex items-center justify-center">
            <Rocket className="w-9 h-9 text-white" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, type: 'spring' }}
          className="hidden lg:block absolute top-40 right-[6%] animate-float-delay"
        >
          <div className="w-16 h-16 rounded-2xl bg-white shadow-2xl shadow-brand-600/20 -rotate-6 flex items-center justify-center border border-neutral-100">
            <Sparkles className="w-7 h-7 text-brand-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, type: 'spring' }}
          className="hidden lg:block absolute bottom-32 left-[12%] animate-float-slow"
        >
          <div className="w-14 h-14 rounded-2xl bg-neutral-900 shadow-2xl rotate-12 flex items-center justify-center">
            <Zap className="w-6 h-6 text-brand-400" />
          </div>
        </motion.div>

        {/* Phone hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="hidden lg:flex absolute bottom-10 right-10 items-center gap-3 text-sm text-neutral-500"
        >
          <span>или позвоните</span>
          <a
            href={`tel:${contacts.phoneRaw}`}
            className="font-semibold text-neutral-900 hover:text-brand-600 transition-colors"
          >
            {contacts.phone}
          </a>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="hidden lg:flex absolute bottom-10 left-1/2 -translate-x-1/2 flex-col items-center text-xs text-neutral-500 gap-2"
        >
          <span className="uppercase tracking-widest">Прокрутите</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-neutral-400 flex items-start justify-center p-1.5"
          >
            <div className="w-1 h-2 bg-neutral-400 rounded-full" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  )
}
