import { useProfileStore } from '@/store/profileStore'
import { GoldAmount } from './GoldAmount'
import styles from './ScreenHeader.module.css'

interface ScreenHeaderProps {
  title: string
  onBack: () => void
}

export function ScreenHeader({ title, onBack }: ScreenHeaderProps) {
  const gold = useProfileStore((state) => state.profile.gold)
  return (
    <header className={styles.header}>
      <button type="button" className={styles.back} onClick={onBack} aria-label="Back">
        ‹
      </button>
      <h2 className={styles.title}>{title}</h2>
      <GoldAmount value={gold} />
    </header>
  )
}
