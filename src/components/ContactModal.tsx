import { motion, AnimatePresence } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { useModal } from '../context/ModalContext'

type FormState = {
  name: string
  contact: string
  phone: string
  comment: string
}

const initial: FormState = { name: '', contact: '', phone: '+992 ', comment: '' }

export default function ContactModal() {
  const { isOpen, close } = useModal()
  const [form, setForm] = useState<FormState>(initial)
  const [sent, setSent] = useState(false)

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }
  }, [isOpen])

  // ESC to close
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, close])

  const update = (key: keyof FormState) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    // TODO: подключить отправку (Telegram bot / API)
    setSent(true)
    setTimeout(() => {
      setSent(false)
      setForm(initial)
      close()
    }, 2000)
  }

  const handleCancel = () => {
    setForm(initial)
    close()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          aria-modal="true"
          role="dialog"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCancel}
            className="absolute inset-0 bg-neutral-900/50 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-7 sm:p-8 max-h-[92vh] overflow-y-auto"
          >
            <button
              type="button"
              onClick={handleCancel}
              aria-label="Закрыть"
              className="absolute top-4 right-4 z-30 w-11 h-11 rounded-full hover:bg-neutral-100 active:bg-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors touch-manipulation"
            >
              <X className="w-5 h-5" />
            </button>

            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="py-12 text-center"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                    className="w-20 h-20 rounded-full bg-emerald-500 mx-auto flex items-center justify-center mb-5 shadow-xl shadow-emerald-500/30"
                  >
                    <Check className="w-10 h-10 text-white" strokeWidth={3} />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-neutral-900">Спасибо!</h3>
                  <p className="mt-2 text-neutral-600">Мы свяжемся с вами в течение дня.</p>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <h3 className="text-2xl font-bold text-neutral-900 mb-6">Напишите нам</h3>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <FloatingInput
                      label="Имя"
                      value={form.name}
                      onChange={update('name')}
                      required
                    />
                    <FloatingInput
                      label="Почта или телеграм"
                      value={form.contact}
                      onChange={update('contact')}
                      required
                    />
                    <FloatingInput
                      label="Номер телефона"
                      value={form.phone}
                      onChange={update('phone')}
                      type="tel"
                    />
                    <FloatingTextarea
                      label="Комментарий"
                      value={form.comment}
                      onChange={update('comment')}
                    />

                    <div className="flex gap-3 pt-3">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleCancel}
                        className="flex-1 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors shadow-lg shadow-brand-600/25"
                      >
                        Отмена
                      </motion.button>
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        className="flex-1 py-3.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-semibold transition-colors shadow-lg"
                      >
                        Отправить
                      </motion.button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

type InputProps = {
  label: string
  value: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  type?: string
  required?: boolean
}

function FloatingInput({ label, value, onChange, type = 'text', required }: InputProps) {
  return (
    <div className="relative">
      <input
        id={label}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder=" "
        className="peer w-full px-4 pt-6 pb-2 rounded-xl border border-neutral-200 bg-white text-neutral-900 focus:border-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-100 transition-all"
      />
      <label
        htmlFor={label}
        className="absolute left-4 text-neutral-400 transition-all pointer-events-none
          top-2 text-xs
          peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base
          peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-brand-600"
      >
        {label}
      </label>
    </div>
  )
}

type TextareaProps = {
  label: string
  value: string
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void
}

function FloatingTextarea({ label, value, onChange }: TextareaProps) {
  return (
    <div className="relative">
      <textarea
        id={label}
        value={value}
        onChange={onChange}
        placeholder=" "
        rows={4}
        className="peer w-full px-4 pt-6 pb-2 rounded-xl border border-neutral-200 bg-white text-neutral-900 focus:border-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-100 transition-all resize-none"
      />
      <label
        htmlFor={label}
        className="absolute left-4 text-neutral-400 transition-all pointer-events-none
          top-2 text-xs
          peer-placeholder-shown:top-5 peer-placeholder-shown:text-base
          peer-focus:top-2 peer-focus:text-xs peer-focus:text-brand-600"
      >
        {label}
      </label>
    </div>
  )
}
