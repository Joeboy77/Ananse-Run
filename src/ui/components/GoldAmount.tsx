import styles from './GoldAmount.module.css'

interface GoldAmountProps {
  value: number
  size?: 'sm' | 'md' | 'lg'
}

export function GoldAmount({ value, size = 'md' }: GoldAmountProps) {
  return (
    <span className={styles.gold} data-size={size}>
      <span className={styles.coin} aria-hidden />
      {value.toLocaleString()}
    </span>
  )
}
