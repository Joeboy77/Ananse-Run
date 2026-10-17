import styles from './ProgressBar.module.css'

interface ProgressBarProps {
  value: number
  color?: string
  label?: string
}

export function ProgressBar({ value, color, label }: ProgressBarProps) {
  const percent = Math.round(Math.min(1, Math.max(0, value)) * 100)
  return (
    <div
      className={styles.track}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
    >
      <div className={styles.fill} style={{ width: `${percent}%`, background: color }} />
    </div>
  )
}
