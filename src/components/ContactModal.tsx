import {
  motion,
  AnimatePresence,
  useReducedMotion,
  type Variants,
} from 'framer-motion'
import {
  X,
  ArrowRight,
  User,
  AtSign,
  Phone,
  MessageSquare,
  Loader2,
  Clock,
  ShieldCheck,
  Send,
} from 'lucide-react'
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ComponentType,
} from 'react'
import { useModal } from '../context/ModalContext'
import { contacts } from '../data/content'

type FormState = {
  name: string
  contact: string
  phone: string
  comment: string
}
type Errors = Partial<Record<keyof FormState, string>>
type Status = 'idle' | 'sending' | 'sent'

const PHONE_PREFIX = '+992 '
const initial: FormState = { name: '', contact: '', phone: PHONE_PREFIX, comment: '' }

const EASE = [0.16, 1, 0.3, 1] as const

// ---- Validation rules / limits ----
const COMMENT_MAX = 500
const NAME_RE = /^[A-Za-zА-Яа-яЁё][A-Za-zА-Яа-яЁё\s'’-]*$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const TG_RE = /^@?[A-Za-z0-9_]{5,32}$/

// Tajik phone: 9 national digits after the fixed "+992 " prefix
const nationalDigits = (v: string) => {
  let d = v.replace(/\D/g, '')
  if (d.startsWith('992')) d = d.slice(3)
  return d.slice(0, 9)
}
const formatPhone = (d: string) => {
  let out = d.slice(0, 2)
  if (d.length > 2) out += ' ' + d.slice(2, 5)
  if (d.length > 5) out += ' ' + d.slice(5, 7)
  if (d.length > 7) out += ' ' + d.slice(7, 9)
  return out
}

function validate(key: keyof FormState, value: string): string | undefined {
  if (key === 'name') {
    const t = value.trim()
    if (!t) return 'Введите имя'
    if (t.length < 2) return 'Минимум 2 символа'
    if (t.length > 50) return 'Максимум 50 символов'
    if (!NAME_RE.test(t)) return 'Только буквы, пробел и дефис'
    return undefined
  }
  if (key === 'contact') {
    const t = value.trim()
    if (!t) return 'Укажите почту или Telegram'
    if (t.length > 60) return 'Слишком длинно (макс. 60)'
    if (!EMAIL_RE.test(t) && !TG_RE.test(t))
      return 'Введите корректную почту или Telegram (@username)'
    return undefined
  }
  if (key === 'phone') {
    if (nationalDigits(value).length !== 9) return 'Введите 9 цифр номера'
    return undefined
  }
  return undefined // comment is optional, length is hard-capped by maxLength
}

export default function ContactModal() {
  const { isOpen, close } = useModal()
  const reduce = useReducedMotion()

  const [form, setForm] = useState<FormState>(initial)
  const [errors, setErrors] = useState<Errors>({})
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({})
  const [status, setStatus] = useState<Status>('idle')

  const modalRef = useRef<HTMLDivElement>(null)
  const firstFieldRef = useRef<HTMLInputElement>(null)
  const restoreFocusRef = useRef<HTMLElement | null>(null)

  // Body scroll lock
  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [isOpen])

  // Focus first field on open; return focus to trigger on close
  useEffect(() => {
    if (!isOpen) return
    restoreFocusRef.current = document.activeElement as HTMLElement | null
    const t = setTimeout(() => firstFieldRef.current?.focus(), reduce ? 0 : 180)
    return () => {
      clearTimeout(t)
      restoreFocusRef.current?.focus?.()
    }
  }, [isOpen, reduce])

  const reset = () => {
    setForm(initial)
    setErrors({})
    setTouched({})
    setStatus('idle')
  }

  const handleClose = () => {
    reset()
    close()
  }

  const update =
    (key: keyof FormState) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value
      setForm((f) => ({ ...f, [key]: value }))
      if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
    }

  // Phone: keep the fixed "+992 " prefix, accept only digits, cap at 9, auto-format
  const onPhoneChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const digits = nationalDigits(e.target.value)
    setForm((f) => ({ ...f, phone: PHONE_PREFIX + formatPhone(digits) }))
    if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }))
  }

  const REQUIRED = ['name', 'contact', 'phone'] as const

  const handleBlur = (key: keyof FormState) => () => {
    setTouched((t) => ({ ...t, [key]: true }))
    setErrors((prev) => ({ ...prev, [key]: validate(key, form[key]) }))
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (status !== 'idle') return // block double / spam submits
    const next: Errors = {}
    REQUIRED.forEach((k) => {
      const err = validate(k, form[k])
      if (err) next[k] = err
    })
    setErrors(next)
    setTouched({ name: true, contact: true, phone: true })
    if (Object.keys(next).length) {
      const firstBad = REQUIRED.find((k) => next[k])
      if (firstBad) document.getElementById(`cm-${firstBad}`)?.focus()
      return
    }
    setStatus('sending')
    // TODO: wire to backend (Telegram bot / API)
    setTimeout(() => setStatus('sent'), reduce ? 200 : 850)
  }

  // Auto-close shortly after the success moment lands
  useEffect(() => {
    if (status !== 'sent') return
    const t = setTimeout(handleClose, 2600)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  // Focus trap + Esc, scoped to the dialog
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation()
      handleClose()
      return
    }
    if (e.key !== 'Tab' || !modalRef.current) return
    const nodes = modalRef.current.querySelectorAll<HTMLElement>(
      'a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',
    )
    if (!nodes.length) return
    const first = nodes[0]
    const last = nodes[nodes.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  const phoneFilled = nationalDigits(form.phone).length > 0
  const filledCount = [
    form.name.trim().length > 0,
    form.contact.trim().length > 0,
    phoneFilled,
    form.comment.trim().length > 0,
  ].filter(Boolean).length
  const progress = Math.round((filledCount / 4) * 100)

  // Gate the submit button: valid required fields + not already sending/sent
  const isValid =
    !validate('name', form.name) &&
    !validate('contact', form.contact) &&
    !validate('phone', form.phone)
  const canSubmit = isValid && status === 'idle'

  const fieldStagger: Variants = {
    hidden: {},
    show: { transition: reduce ? {} : { staggerChildren: 0.07, delayChildren: 0.12 } },
  }
  const fieldItem: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          onKeyDown={onKeyDown}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-neutral-950/55 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Dialog */}
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cm-title"
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 16 }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className="relative w-full max-w-md md:max-w-[58rem] max-h-[92vh] overflow-hidden rounded-[1.75rem] bg-white shadow-[0_40px_120px_-20px_rgba(16,24,40,0.55)] ring-1 ring-black/5"
          >
            <AnimatePresence mode="wait">
              {status === 'sent' ? (
                <Success key="success" reduce={!!reduce} />
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex max-h-[92vh] flex-col md:flex-row"
                >
                  <BrandPanel reduce={!!reduce} />

                  {/* Form side */}
                  <div className="relative flex-1 overflow-y-auto px-6 py-6 sm:px-9 sm:py-9">
                    <button
                      type="button"
                      onClick={handleClose}
                      aria-label="Закрыть"
                      className="absolute right-4 top-4 z-30 grid h-10 w-10 place-items-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                    >
                      <X className="h-5 w-5" />
                    </button>

                    <h2 id="cm-title" className="text-2xl font-extrabold tracking-tight text-neutral-900">
                      Напишите нам
                    </h2>
                    <p className="mt-1.5 text-sm text-neutral-500">
                      Заполните форму, и мы вернёмся с предложением.
                    </p>

                    {/* Completion progress */}
                    <div className="mt-5 flex items-center gap-3" aria-hidden="true">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-100">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-600"
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: reduce ? 0 : 0.45, ease: EASE }}
                        />
                      </div>
                      <span className="w-9 text-right text-xs font-semibold tabular-nums text-neutral-400">
                        {progress}%
                      </span>
                    </div>

                    <motion.form
                      onSubmit={handleSubmit}
                      noValidate
                      variants={fieldStagger}
                      initial="hidden"
                      animate="show"
                      className="mt-6 space-y-3.5"
                    >
                      <motion.div variants={fieldItem}>
                        <Field
                          id="cm-name"
                          label="Имя"
                          icon={User}
                          value={form.name}
                          onChange={update('name')}
                          onBlur={handleBlur('name')}
                          error={touched.name ? errors.name : undefined}
                          inputRef={firstFieldRef}
                          autoComplete="name"
                          maxLength={50}
                          required
                        />
                      </motion.div>

                      <motion.div variants={fieldItem}>
                        <Field
                          id="cm-contact"
                          label="Почта или телеграм"
                          icon={AtSign}
                          value={form.contact}
                          onChange={update('contact')}
                          onBlur={handleBlur('contact')}
                          error={touched.contact ? errors.contact : undefined}
                          inputMode="email"
                          autoCapitalize="none"
                          autoCorrect="off"
                          maxLength={60}
                          required
                        />
                      </motion.div>

                      <motion.div variants={fieldItem}>
                        <Field
                          id="cm-phone"
                          label="Номер телефона"
                          icon={Phone}
                          value={form.phone}
                          onChange={onPhoneChange}
                          onBlur={handleBlur('phone')}
                          error={touched.phone ? errors.phone : undefined}
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          maxLength={17}
                          required
                        />
                      </motion.div>

                      <motion.div variants={fieldItem}>
                        <Field
                          id="cm-comment"
                          label="Комментарий"
                          icon={MessageSquare}
                          value={form.comment}
                          onChange={update('comment')}
                          multiline
                          maxLength={COMMENT_MAX}
                          showCounter
                        />
                      </motion.div>

                      <motion.div variants={fieldItem} className="flex items-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={handleClose}
                          className="rounded-xl px-5 py-3.5 text-sm font-semibold text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
                        >
                          Отмена
                        </button>
                        <motion.button
                          type="submit"
                          disabled={!canSubmit}
                          whileHover={reduce || !canSubmit ? undefined : { scale: 1.02, y: -1 }}
                          whileTap={canSubmit ? { scale: 0.98 } : undefined}
                          transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                          className="group relative flex flex-[1.6] items-center justify-center gap-2 overflow-hidden rounded-xl bg-brand-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/30 transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:bg-brand-600"
                        >
                          {status === 'sending' ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Отправляем…
                            </>
                          ) : (
                            <>
                              Отправить
                              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                            </>
                          )}
                        </motion.button>
                      </motion.div>
                    </motion.form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ----------------------------- Brand panel ----------------------------- */

function BrandPanel({ reduce }: { reduce: boolean }) {
  const panelStagger: Variants = {
    hidden: {},
    show: { transition: reduce ? {} : { staggerChildren: 0.08, delayChildren: 0.05 } },
  }
  const item: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 px-6 py-6 text-white md:w-[42%] md:px-8 md:py-10">
      {/* Drifting mesh orbs */}
      {!reduce && (
        <>
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -left-16 -top-10 h-56 w-56 rounded-full bg-white/20 blur-3xl"
            animate={{ x: [0, 30, 0], y: [0, 24, 0], scale: [1, 1.12, 1] }}
            transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -bottom-16 -right-12 h-64 w-64 rounded-full bg-brand-900/50 blur-3xl"
            animate={{ x: [0, -26, 0], y: [0, -20, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          />
        </>
      )}
      {/* Grid texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff0f_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0f_1px,transparent_1px)] bg-[size:34px_34px] [mask-image:radial-gradient(ellipse_at_top_left,black,transparent_75%)]"
      />

      <motion.div
        variants={panelStagger}
        initial="hidden"
        animate="show"
        className="relative flex h-full flex-col"
      >
        <motion.span
          variants={item}
          className="inline-flex w-fit items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-brand-100"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-brand-200" />
          Новый проект
        </motion.span>

        <motion.h3
          variants={item}
          className="mt-4 text-2xl font-extrabold leading-[1.1] tracking-tight md:mt-6 md:text-[2.6rem]"
        >
          Расскажите
          <br />о задаче
        </motion.h3>

        <motion.p
          variants={item}
          className="mt-3 max-w-xs text-sm leading-relaxed text-brand-100/90 md:text-[15px]"
        >
          Обсудим цели, предложим решение и оценим сроки. Без воды и навязчивых звонков.
        </motion.p>

        {/* Trust chips */}
        <motion.div variants={item} className="mt-7 hidden space-y-3 sm:block">
          <Chip icon={Clock} title="Отвечаем за пару часов" sub="в рабочее время" />
          <Chip icon={ShieldCheck} title="30+ компаний доверяют" sub="медицина, e-commerce, услуги" />
        </motion.div>

        {/* Quick contacts pinned to bottom on desktop */}
        <motion.div variants={item} className="mt-7 hidden gap-2 md:mt-auto md:flex md:flex-col">
          <a
            href={contacts.telegram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-white/90 transition-colors hover:text-white"
          >
            <Send className="h-4 w-4" />
            Написать в Telegram
          </a>
          <a
            href={`tel:${contacts.phoneRaw}`}
            className="inline-flex w-fit items-center gap-2 text-sm font-medium text-brand-100/80 transition-colors hover:text-white"
          >
            <Phone className="h-4 w-4" />
            {contacts.phone}
          </a>
        </motion.div>
      </motion.div>
    </div>
  )
}

function Chip({
  icon: Icon,
  title,
  sub,
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  sub: string
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/15 ring-1 ring-white/15 backdrop-blur-sm">
        <Icon className="h-4 w-4 text-white" />
      </span>
      <div className="leading-tight">
        <div className="text-sm font-semibold text-white">{title}</div>
        <div className="text-xs text-brand-100/75">{sub}</div>
      </div>
    </div>
  )
}

/* ------------------------------- Field --------------------------------- */

type FieldProps = {
  id: string
  label: string
  icon: ComponentType<{ className?: string }>
  value: string
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onBlur?: () => void
  error?: string
  type?: string
  inputMode?: 'text' | 'email' | 'tel'
  autoComplete?: string
  autoCapitalize?: string
  autoCorrect?: string
  required?: boolean
  multiline?: boolean
  maxLength?: number
  showCounter?: boolean
  inputRef?: React.Ref<HTMLInputElement>
}

function Field({
  id,
  label,
  icon: Icon,
  value,
  onChange,
  onBlur,
  error,
  type = 'text',
  inputMode,
  autoComplete,
  autoCapitalize,
  autoCorrect,
  required,
  multiline,
  maxLength,
  showCounter,
  inputRef,
}: FieldProps) {
  const errId = `${id}-err`
  const base =
    'peer w-full rounded-xl border bg-white pl-11 pr-4 text-neutral-900 outline-none transition-all placeholder:text-transparent'
  const tone = error
    ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-100'
    : 'border-neutral-200 hover:border-neutral-300 focus:border-brand-600 focus:ring-4 focus:ring-brand-100'

  return (
    <div>
      <div className="relative">
        <Icon
          className={`pointer-events-none absolute left-4 z-10 h-4 w-4 transition-colors peer-focus:text-brand-600 ${
            multiline ? 'top-[1.15rem]' : 'top-1/2 -translate-y-1/2'
          } ${error ? 'text-rose-400' : 'text-neutral-400'}`}
        />
        {multiline ? (
          <textarea
            id={id}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            rows={3}
            maxLength={maxLength}
            placeholder={label}
            aria-invalid={!!error}
            aria-describedby={error ? errId : undefined}
            className={`${base} ${tone} resize-none pb-2 pt-6`}
          />
        ) : (
          <input
            id={id}
            ref={inputRef}
            type={type}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            inputMode={inputMode}
            autoComplete={autoComplete}
            autoCapitalize={autoCapitalize}
            autoCorrect={autoCorrect}
            required={required}
            maxLength={maxLength}
            placeholder={label}
            aria-invalid={!!error}
            aria-describedby={error ? errId : undefined}
            className={`${base} ${tone} pb-2 pt-6`}
          />
        )}
        {/* Floating label */}
        <label
          htmlFor={id}
          className={`pointer-events-none absolute left-11 top-2 text-xs font-medium transition-all
            peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-[15px] peer-placeholder-shown:font-normal
            peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:font-medium
            ${multiline ? 'peer-placeholder-shown:top-[1.15rem] peer-placeholder-shown:translate-y-0' : ''}
            ${error ? 'text-rose-500 peer-focus:text-rose-500' : 'text-neutral-500 peer-focus:text-brand-600'}`}
        >
          {label}
          {required && <span className={error ? 'text-rose-400' : 'text-brand-500'}> *</span>}
        </label>
      </div>
      {showCounter && maxLength != null && (
        <div
          aria-hidden="true"
          className={`mt-1 pr-1 text-right text-xs tabular-nums ${
            value.length >= maxLength
              ? 'text-rose-500'
              : value.length >= maxLength * 0.9
                ? 'text-amber-600'
                : 'text-neutral-400'
          }`}
        >
          {value.length}/{maxLength}
        </div>
      )}
      <AnimatePresence>
        {error && (
          <motion.p
            id={errId}
            role="alert"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden pl-1 pt-1.5 text-xs font-medium text-rose-600"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ------------------------------ Success -------------------------------- */

function Success({ reduce }: { reduce: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative flex flex-col items-center overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 px-8 py-16 text-center text-white"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff0d_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0d_1px,transparent_1px)] bg-[size:34px_34px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)]"
      />

      {/* Checkmark + soft expanding rings */}
      <div className="relative mb-7 grid h-24 w-24 place-items-center">
        {!reduce &&
          [0, 1].map((i) => (
            <motion.span
              key={i}
              className="absolute inset-0 rounded-full border border-white/40"
              initial={{ scale: 0.6, opacity: 0.7 }}
              animate={{ scale: 2.1, opacity: 0 }}
              transition={{ duration: 1.6, ease: 'easeOut', delay: 0.3 + i * 0.35, repeat: Infinity, repeatDelay: 0.6 }}
            />
          ))}
        <motion.div
          initial={reduce ? { scale: 1 } : { scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 16, delay: 0.05 }}
          className="grid h-24 w-24 place-items-center rounded-full bg-white shadow-2xl shadow-brand-900/40"
        >
          <svg viewBox="0 0 52 52" className="h-12 w-12">
            <motion.path
              d="M14 27l8 8 16-17"
              fill="none"
              stroke="#2B5ED3"
              strokeWidth={5}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: reduce ? 0 : 0.5, ease: 'easeOut', delay: reduce ? 0 : 0.35 }}
            />
          </svg>
        </motion.div>
      </div>

      <motion.h2
        id="cm-title"
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: reduce ? 0 : 0.45 }}
        className="text-3xl font-extrabold tracking-tight"
      >
        Спасибо!
      </motion.h2>
      <motion.p
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: reduce ? 0 : 0.55 }}
        className="mt-3 max-w-xs text-[15px] leading-relaxed text-brand-100/90"
      >
        Заявка получена. Свяжемся с вами в течение пары часов.
      </motion.p>
    </motion.div>
  )
}
