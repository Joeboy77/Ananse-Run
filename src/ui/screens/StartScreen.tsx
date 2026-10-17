import { motion } from 'framer-motion'
import { game } from '@/game/runtime'
import { useGameStore } from '@/store/gameStore'
import { Button } from '@/ui/components/Button'
import { fade, fadeUp } from '@/ui/transitions/fade'
import styles from './Overlay.module.css'

export function StartScreen() {
  const best = useGameStore((state) => state.best)

  return (
    <motion.section className={styles.overlay} {...fade}>
      <motion.header {...fadeUp}>
        <h1 className={styles.title}>Ananse Run</h1>
        {best > 0 && <p className={styles.subtitle}>Best {best.toLocaleString()}</p>}
      </motion.header>
      <motion.div className={styles.actions} {...fadeUp}>
        <Button onClick={() => game.play()} autoFocus>
          Play
        </Button>
        <span className={styles.hint}>Swipe to move, jump and slide · Arrows or WASD on desktop</span>
      </motion.div>
    </motion.section>
  )
}
