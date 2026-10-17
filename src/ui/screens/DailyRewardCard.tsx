import { motion } from 'framer-motion'
import { dailyOffer, dayKey } from '@/game/progression/daily'
import { claimDaily } from '@/game/progression/rewards'
import { showToast } from '@/store/gameStore'
import { commitProfile, getProfile, useProfileStore } from '@/store/profileStore'
import { GoldAmount } from '@/ui/components/GoldAmount'
import { fadeUp } from '@/ui/transitions/fade'
import styles from './DailyRewardCard.module.css'

export function DailyRewardCard() {
  const daily = useProfileStore((state) => state.profile.daily)
  const loaded = useProfileStore((state) => state.loaded)
  const today = dayKey(new Date())
  const offer = dailyOffer(daily, today)
  if (!loaded || !offer.available) return null

  const claim = () => {
    const result = claimDaily(getProfile(), today)
    if (!result) return
    commitProfile(result.profile)
    showToast(`+${result.gold} gold${result.sankofa ? ' and a Sankofa token' : ''}`)
  }

  return (
    <motion.div className={styles.card} {...fadeUp}>
      <div>
        <div className={styles.title}>Daily reward · Day {offer.streak}</div>
        <GoldAmount value={offer.gold} />
        {offer.sankofa > 0 && <span className={styles.extra}> + Sankofa token</span>}
      </div>
      <button type="button" className={styles.claim} onClick={claim}>
        Claim
      </button>
    </motion.div>
  )
}
