import { motion } from 'framer-motion'
import { game } from '@/game/runtime'
import { useGameStore } from '@/store/gameStore'
import { Button } from '@/ui/components/Button'
import { fade, fadeUp } from '@/ui/transitions/fade'
import styles from './Overlay.module.css'

export function GameOverScreen() {
  const score = useGameStore((state) => state.score)
  const gold = useGameStore((state) => state.gold)
  const best = useGameStore((state) => state.best)
  const newBest = useGameStore((state) => state.newBest)

  return (
    <motion.section className={styles.overlay} {...fade}>
      <motion.div className={styles.stats} {...fadeUp}>
        <span className={styles.label}>Score</span>
        <span className={styles.bigNumber}>{score.toLocaleString()}</span>
        {newBest && <span className={styles.badge}>New best</span>}
        <div className={styles.row}>
          <span className={styles.goldText}>{gold} gold</span>
          <span>Best {best.toLocaleString()}</span>
        </div>
      </motion.div>
      <motion.div className={styles.actions} {...fadeUp}>
        <Button onClick={() => game.restart()} autoFocus>
          Run again
        </Button>
        <span className={styles.hint}>Space or Enter to restart</span>
      </motion.div>
    </motion.section>
  )
}
