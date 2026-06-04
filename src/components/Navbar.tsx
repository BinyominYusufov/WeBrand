import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Phone } from 'lucide-react'
import { nav, contacts } from '../data/content'
import { useModal } from '../context/ModalContext'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { open: openModal } = useModal()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-lg shadow-[0_1px_0_0_rgba(0,0,0,0.05)]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
        <a href="#top" className="flex items-center group select-none">
          <motion.img
            whileHover={{ scale: 1.05 }}
            src="/logos/main-logo.png"
            alt="Webrand"
            className="h-9 sm:h-10 w-auto object-contain"
          />
        </a>

        <nav className="hidden lg:flex items-center gap-10">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="relative text-sm font-semibold text-neutral-700 hover:text-brand-600 transition-colors group"
            >
              {item.label}
              <span className="absolute -bottom-1.5 left-0 w-0 h-0.5 bg-brand-600 group-hover:w-full transition-all duration-300" />
            </a>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-5">
          <a
            href={`tel:${contacts.phoneRaw}`}
            className="flex items-center gap-2 text-sm font-semibold text-neutral-700 hover:text-brand-600 transition-colors"
          >
            <Phone className="w-4 h-4" />
            {contacts.phone}
          </a>
          <motion.button
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={openModal}
            className="px-5 py-2.5 rounded-full bg-brand-600 text-white text-sm font-semibold shadow-lg shadow-brand-600/25 hover:shadow-xl hover:shadow-brand-600/40 transition-all"
          >
            Напишите нам
          </motion.button>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="lg:hidden p-2 text-neutral-900"
          aria-label="Меню"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden overflow-hidden bg-white border-t"
          >
            <div className="px-6 py-6 flex flex-col gap-4">
              {nav.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="text-base font-medium text-neutral-700"
                >
                  {item.label}
                </a>
              ))}
              <a
                href={`tel:${contacts.phoneRaw}`}
                className="flex items-center gap-2 text-base font-medium text-neutral-700"
              >
                <Phone className="w-4 h-4" />
                {contacts.phone}
              </a>
              <button
                onClick={() => {
                  setOpen(false)
                  openModal()
                }}
                className="mt-2 px-5 py-3 rounded-full bg-brand-600 text-white text-center font-semibold"
              >
                Напишите нам
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
