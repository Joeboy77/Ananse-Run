import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { tuning } from '@/config/tuning'
import { game } from '@/game/runtime'
import { useGameStore } from '@/store/gameStore'
import { useProfileStore } from '@/store/profileStore'
import { Button } from '@/ui/components/Button'
import { GoldAmount } from '@/ui/components/GoldAmount'
import { ProgressBar } from '@/ui/components/ProgressBar'
import { fade, fadeUp } from '@/ui/transitions/fade'
import styles from './Overlay.module.css'

function SankofaOffer() {
  const tokens = useProfileStore((state) => state.profile.sankofaTokens)
  const [left, setLeft] = useState<number>(tuning.sankofa.countdown)

  useEffect(() => {
    const started = performance.now()
    const id = window.setInterval(() => {
      const remaining = tuning.sankofa.countdown - (performance.now() - started) / 1000
      if (remaining <= 0) {
        window.clearInterval(id)
        game.declineContinue()
      }
      setLeft(Math.max(0, remaining))
    }, 100)
    return () => window.clearInterval(id)
  }, [])

  return (
    <div className={styles.sankofa}>
      <Button onClick={() => game.continueRun()}>Sankofa · continue</Button>
      <ProgressBar value={left / tuning.sankofa.countdown} label="Time left to continue" />
      <span className={styles.hint}>
        Uses 1 of your {tokens} tokens ·{' '}
        <button type="button" className={styles.link} onClick={() => game.declineContinue()}>
          No thanks
        </button>
      </span>
    </div>
  )
}

export function GameOverScreen() {
  const score = useGameStore((state) => state.score)
  const gold = useGameStore((state) => state.gold)
  const summary = useGameStore((state) => state.summary)
  const continueOffer = useGameStore((state) => state.continueOffer)
  const best = useProfileStore((state) => state.profile.bestScore)

  return (
    <motion.section className={styles.overlay} {...fade}>
      <motion.div className={styles.stats} {...fadeUp}>
        <span className={styles.label}>Score</span>
        <span className={styles.bigNumber}>{score.toLocaleString()}</span>
        {summary?.newBest && <span className={styles.badge}>New best</span>}
        <div className={styles.row}>
          <GoldAmount value={gold} />
          <span>Best {Math.max(best, score).toLocaleString()}</span>
        </div>
        {summary && (
          <ul className={styles.results}>
            {summary.missionsCompleted.map((mission) => (
              <li key={mission.text}>
                Mission complete: {mission.text} <GoldAmount value={mission.reward} size="sm" />
              </li>
            ))}
            {summary.setCompleted && <li>Mission set complete! Multiplier is now x{summary.multiplier}</li>}
            {summary.goldWeightsFound.map((name) => (
              <li key={name}>Gold weight found: {name}</li>
            ))}
            {summary.goldWeightSetComplete && <li>Full gold weight set! Bonus gold awarded</li>}
          </ul>
        )}
      </motion.div>
      <motion.div className={styles.actions} {...fadeUp}>
        {continueOffer ? (
          <SankofaOffer />
        ) : (
          <>
            <Button onClick={() => game.restart()} autoFocus>
              Run again
            </Button>
            <Button variant="ghost" onClick={() => game.home()}>
              Home
            </Button>
            <span className={styles.hint}>Space or Enter to restart</span>
          </>
        )}
      </motion.div>
    </motion.section>
  )
}
