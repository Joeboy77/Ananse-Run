import type { DailyState } from './profile'

export const dailyRewards: readonly number[] = [50, 75, 100, 150, 200, 250, 400]
export const DAILY_TOKEN_DAY = 7

export const dayKey = (date: Date): string => {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

const dayNumber = (key: string): number => {
  const [year, month, day] = key.split('-').map(Number)
  return Math.round(Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1) / 86_400_000)
}

export interface DailyOffer {
  available: boolean
  streak: number
  gold: number
  sankofa: number
}

export const dailyOffer = (daily: DailyState, today: string): DailyOffer => {
  if (daily.lastClaimDay === today) {
    return { available: false, streak: daily.streak, gold: 0, sankofa: 0 }
  }
  const gap = daily.lastClaimDay === null ? Infinity : dayNumber(today) - dayNumber(daily.lastClaimDay)
  const streak =
    gap === 1 ? daily.streak + 1 : daily.lastClaimDay === null ? 1 : Math.max(1, Math.ceil(daily.streak / 2))
  const index = Math.min(streak, dailyRewards.length) - 1
  return {
    available: true,
    streak,
    gold: dailyRewards[index] ?? 0,
    sankofa: streak % DAILY_TOKEN_DAY === 0 ? 1 : 0,
  }
}
