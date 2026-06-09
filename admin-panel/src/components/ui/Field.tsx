import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

const baseControl =
  'w-full rounded-xl border bg-white px-3.5 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 disabled:bg-neutral-100'

export function Label({
  children,
  required,
  htmlFor,
  hint,
}: {
  children: ReactNode
  required?: boolean
  htmlFor?: string
  hint?: string
}) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-semibold text-neutral-700">
      {children}
      {required && <span className="ml-0.5 text-brand-600">*</span>}
      {hint && <span className="ml-2 font-normal text-neutral-400">{hint}</span>}
    </label>
  )
}

export function FieldError({ children }: { children?: string }) {
  if (!children) return null
  return <p className="mt-1.5 text-xs font-medium text-red-600">{children}</p>
}

export function Field({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  hint?: string
  children: ReactNode
}) {
  return (
    <div>
      <Label required={required} hint={hint}>
        {label}
      </Label>
      {children}
      <FieldError>{error}</FieldError>
    </div>
  )
}

export function Input({ className = '', error, ...rest }: InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  return (
    <input
      {...rest}
      className={`${baseControl} h-11 ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/30' : 'border-neutral-300'} ${className}`}
    />
  )
}

export function Textarea({
  className = '',
  error,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }) {
  return (
    <textarea
      {...rest}
      className={`${baseControl} resize-y py-2.5 ${error ? 'border-red-400' : 'border-neutral-300'} ${className}`}
    />
  )
}

export function Select({
  className = '',
  error,
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & { error?: boolean }) {
  return (
    <select
      {...rest}
      className={`${baseControl} h-11 cursor-pointer appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%23737373" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>')] bg-[length:18px] bg-[right_0.75rem_center] bg-no-repeat pr-10 ${error ? 'border-red-400' : 'border-neutral-300'} ${className}`}
    >
      {children}
    </select>
  )
}
