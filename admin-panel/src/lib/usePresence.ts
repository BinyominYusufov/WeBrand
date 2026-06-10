import { useEffect, useState } from 'react'

const prefersReduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Delayed-unmount presence for enter/exit transitions without an animation lib.
 *
 * - `mounted` stays true through the exit animation so the element is rendered
 *   until it finishes closing (no abrupt unmount).
 * - `show` flips on the frame after mount (drives the enter transition) and off
 *   when `open` goes false (drives the exit transition).
 *
 * Under `prefers-reduced-motion` the enter is immediate and the unmount delay is
 * zero, so open/close are effectively instant with no artefacts.
 */
export function usePresence(open: boolean, duration = 220) {
  const [mounted, setMounted] = useState(open)
  // Always start hidden so a component that mounts already-open (e.g. a form
  // drawer mounted on demand, or remounted via `key`) still plays its enter
  // animation instead of snapping straight to the open state.
  const [show, setShow] = useState(false)

  useEffect(() => {
    const reduce = prefersReduced()
    if (open) {
      setMounted(true)
      if (reduce) {
        setShow(true)
        return
      }
      // Two RAFs so the element paints in its "from" state before flipping.
      let raf2 = 0
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setShow(true))
      })
      return () => {
        cancelAnimationFrame(raf1)
        cancelAnimationFrame(raf2)
      }
    }
    setShow(false)
    const t = window.setTimeout(() => setMounted(false), reduce ? 0 : duration)
    return () => window.clearTimeout(t)
  }, [open, duration])

  return { mounted, show }
}
