import { powerUpInfo } from '@/content/powerUps'
import { game } from '@/game/runtime'
import { useGameStore } from '@/store/gameStore'
import { useProfileStore } from '@/store/profileStore'
import { ProgressBar } from '@/ui/components/ProgressBar'
import styles from './Hud.module.css'

export function Hud() {
  const score = useGameStore((state) => state.score)
  const gold = useGameStore((state) => state.gold)
  const multiplier = useGameStore((state) => state.multiplier)
  const drum = useGameStore((state) => state.drum)
  const shield = useGameStore((state) => state.shield)
  const powerUps = useGameStore((state) => state.powerUps)
  const charms = useProfileStore((state) => state.profile.shieldCharms)

  return (
    <>
      <div className={styles.hud}>
        <div className={styles.score}>{score.toLocaleString()}</div>
        <div className={styles.meta}>
          <span className={styles.multiplier} data-boost={drum}>
            x{multiplier * (drum ? 2 : 1)}
          </span>
          <span className={styles.gold}>
            <span className={styles.coin} aria-hidden />
            {gold}
          </span>
        </div>
      </div>
      <div className={styles.powerUps}>
        {shield && (
          <div className={styles.powerUp}>
            <span className={styles.icon} style={{ background: powerUpInfo.shield.color }} aria-hidden>
              ◆
            </span>
            <span className={styles.name}>{powerUpInfo.shield.short}</span>
          </div>
        )}
        {powerUps.map((powerUp) => (
          <div key={powerUp.id} className={styles.powerUp}>
            <span className={styles.icon} style={{ background: powerUpInfo[powerUp.id].color }} aria-hidden>
              {powerUpInfo[powerUp.id].short[0]}
            </span>
            <span className={styles.name}>{powerUpInfo[powerUp.id].short}</span>
            <div className={styles.bar}>
              <ProgressBar
                value={powerUp.remaining / powerUp.duration}
                color={powerUpInfo[powerUp.id].color}
                label={`${powerUpInfo[powerUp.id].name} time left`}
              />
            </div>
          </div>
        ))}
      </div>
      {charms > 0 && !shield && (
        <button type="button" className={styles.charm} onClick={() => game.useCharm()}>
          <span className={styles.icon} style={{ background: powerUpInfo.shield.color }} aria-hidden>
            ◆
          </span>
          Shield ×{charms}
          <span className={styles.charmHint}>double-tap</span>
        </button>
      )}
    </>
  )
}
