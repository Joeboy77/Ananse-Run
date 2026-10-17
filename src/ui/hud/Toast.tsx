import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import styles from './Toast.module.css'

const TOAST_MS = 1800

export function Toast() {
  const toast = useGameStore((state) => state.toast)

  useEffect(() => {
    if (!toast) return
    const id = window.setTimeout(() => {
      if (useGameStore.getState().toast?.id === toast.id) useGameStore.setState({ toast: null })
    }, TOAST_MS)
    return () => window.clearTimeout(id)
  }, [toast])

  return (
    <div className={styles.anchor} aria-live="polite">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            className={styles.toast}
            initial={{ opacity: 0, y: -12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
