import { motion } from 'framer-motion'
import { game } from '@/game/runtime'
import { scoreMultiplier } from '@/game/progression/profile'
import { useProfileStore } from '@/store/profileStore'
import { Button } from '@/ui/components/Button'
import { GoldAmount } from '@/ui/components/GoldAmount'
import { fade, fadeUp } from '@/ui/transitions/fade'
import { DailyRewardCard } from './DailyRewardCard'
import styles from './Overlay.module.css'

interface StartScreenProps {
  onShop: () => void
  onMissions: () => void
}

export function StartScreen({ onShop, onMissions }: StartScreenProps) {
  const profile = useProfileStore((state) => state.profile)
  const missionsLeft = profile.missions.active.filter((mission) => !mission.done).length

  return (
    <motion.section className={styles.overlay} {...fade}>
      <div className={styles.topBar}>
        <GoldAmount value={profile.gold} size="lg" />
        <span className={styles.chip}>x{scoreMultiplier(profile)}</span>
      </div>
      <motion.header {...fadeUp}>
        <h1 className={styles.title}>Ananse Run</h1>
        {profile.bestScore > 0 && (
          <p className={styles.subtitle}>Best {profile.bestScore.toLocaleString()}</p>
        )}
      </motion.header>
      <motion.div className={styles.actions} {...fadeUp}>
        <DailyRewardCard />
        <Button onClick={() => game.play()} autoFocus>
          Play
        </Button>
        <div className={styles.secondary}>
          <Button variant="ghost" onClick={onShop}>
            Shop
          </Button>
          <Button variant="ghost" onClick={onMissions}>
            Missions {missionsLeft > 0 && <span className={styles.count}>{missionsLeft}</span>}
          </Button>
        </div>
        <span className={styles.hint}>Swipe to move, jump and slide · Arrows or WASD on desktop</span>
      </motion.div>
    </motion.section>
  )
}
