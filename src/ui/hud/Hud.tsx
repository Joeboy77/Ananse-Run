import { useGameStore } from '@/store/gameStore'
import styles from './Hud.module.css'

export function Hud() {
  const score = useGameStore((state) => state.score)
  const gold = useGameStore((state) => state.gold)

  return (
    <div className={styles.hud}>
      <div className={styles.score}>{score.toLocaleString()}</div>
      <div className={styles.gold}>
        <span className={styles.coin} aria-hidden />
        {gold}
      </div>
    </div>
  )
}
