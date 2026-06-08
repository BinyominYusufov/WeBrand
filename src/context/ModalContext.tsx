import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import type { SubService } from '../data/content'

export type ServiceDetailPayload = {
  parent: string
  sub: SubService
}

type ModalContextType = {
  // Contact modal
  isOpen: boolean
  open: (preselect?: string[]) => void
  close: () => void
  /** Direction ids to pre-select in the contact form (e.g. ["dev"]). */
  contactPreselect: string[]

  // Service detail modal
  serviceDetail: ServiceDetailPayload | null
  openServiceDetail: (payload: ServiceDetailPayload) => void
  closeServiceDetail: () => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [contactPreselect, setContactPreselect] = useState<string[]>([])
  const [serviceDetail, setServiceDetail] = useState<ServiceDetailPayload | null>(null)

  const open = useCallback((preselect?: string[]) => {
    // Guard: callers often pass `open` straight to onClick, which would hand us
    // a MouseEvent — only honour an actual array of direction ids.
    setContactPreselect(Array.isArray(preselect) ? preselect : [])
    setIsOpen(true)
  }, [])
  const close = useCallback(() => setIsOpen(false), [])

  const openServiceDetail = useCallback((payload: ServiceDetailPayload) => {
    setServiceDetail(payload)
  }, [])
  const closeServiceDetail = useCallback(() => setServiceDetail(null), [])

  return (
    <ModalContext.Provider
      value={{ isOpen, open, close, contactPreselect, serviceDetail, openServiceDetail, closeServiceDetail }}
    >
      {children}
    </ModalContext.Provider>
  )
}

export function useModal() {
  const ctx = useContext(ModalContext)
  if (!ctx) throw new Error('useModal must be used inside ModalProvider')
  return ctx
}
