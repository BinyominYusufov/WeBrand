import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import type { SubService } from '../data/content'

export type ServiceDetailPayload = {
  parent: string
  sub: SubService
}

type ModalContextType = {
  // Contact modal
  isOpen: boolean
  open: () => void
  close: () => void

  // Service detail modal
  serviceDetail: ServiceDetailPayload | null
  openServiceDetail: (payload: ServiceDetailPayload) => void
  closeServiceDetail: () => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [serviceDetail, setServiceDetail] = useState<ServiceDetailPayload | null>(null)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])

  const openServiceDetail = useCallback((payload: ServiceDetailPayload) => {
    setServiceDetail(payload)
  }, [])
  const closeServiceDetail = useCallback(() => setServiceDetail(null), [])

  return (
    <ModalContext.Provider
      value={{ isOpen, open, close, serviceDetail, openServiceDetail, closeServiceDetail }}
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
