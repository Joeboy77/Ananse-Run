import { motion } from 'framer-motion'
import { goldWeights } from '@/content/goldWeights'
import { missionReward } from '@/content/missions'
import { describeMission } from '@/game/progression/missions'
import { scoreMultiplier } from '@/game/progression/profile'
import { useProfileStore } from '@/store/profileStore'
import { GoldAmount } from '@/ui/components/GoldAmount'
import { ProgressBar } from '@/ui/components/ProgressBar'
import { ScreenHeader } from '@/ui/components/ScreenHeader'
import { fade } from '@/ui/transitions/fade'
import styles from './Screen.module.css'

export function MissionsScreen({ onBack }: { onBack: () => void }) {
  const profile = useProfileStore((state) => state.profile)
  const { missions } = profile
  const reward = missionReward(missions.setIndex)

  return (
    <motion.section className={styles.screen} {...fade}>
      <ScreenHeader title="Missions" onBack={onBack} />
      <div className={styles.body}>
        <div className={styles.multiplier}>
          <span className={styles.multiplierValue}>x{scoreMultiplier(profile)}</span>
          <span>score multiplier</span>
        </div>
        <p className={styles.notice}>
          Finish all three missions to raise your multiplier and earn a Sankofa token.
        </p>
        {missions.active.map((mission) => (
          <div key={mission.templateId} className={styles.card}>
            <div>
              <h3 className={styles.cardTitle}>{describeMission(mission)}</h3>
              <p className={styles.cardText}>
                {mission.progress.toLocaleString()} / {mission.target.toLocaleString()}
              </p>
            </div>
            {mission.done ? (
              <span className={styles.done}>Done</span>
            ) : (
              <GoldAmount value={reward} size="sm" />
            )}
            <div className={styles.full}>
              <ProgressBar value={mission.progress / mission.target} label={describeMission(mission)} />
            </div>
          </div>
        ))}
        <h3 className={styles.sectionTitle}>
          Gold weights {profile.goldWeights.length} / {goldWeights.length}
        </h3>
        {goldWeights.map((weight) => {
          const found = profile.goldWeights.includes(weight.id)
          return (
            <div key={weight.id} className={styles.card}>
              <div>
                <h3 className={styles.cardTitle}>{found ? weight.name : '???'}</h3>
                <p className={styles.cardText}>
                  {found ? 'Proverb awaiting cultural review' : 'Keep running to find this weight'}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </motion.section>
  )
}
