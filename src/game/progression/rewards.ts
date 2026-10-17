import { tuning } from '@/config/tuning'
import { goldWeights } from '@/content/goldWeights'
import { missionReward } from '@/content/missions'
import type { RunStats } from '@/game/loop/runStats'
import { dailyOffer } from './daily'
import { applyRunToMissions, describeMission } from './missions'
import type { Profile } from './profile'

export interface RunSummary {
  gold: number
  score: number
  newBest: boolean
  missionsCompleted: { text: string; reward: number }[]
  setCompleted: boolean
  multiplier: number
  goldWeightsFound: string[]
  goldWeightSetComplete: boolean
}

export const applyRunResult = (
  profile: Profile,
  stats: RunStats,
): { profile: Profile; summary: RunSummary } => {
  const missions = applyRunToMissions(profile.missions, stats)
  const reward = missionReward(profile.missions.setIndex)
  const missionGold = missions.completed.length * reward

  const foundIds = stats.goldWeights.filter((id) => !profile.goldWeights.includes(id))
  const collected = [...profile.goldWeights, ...foundIds]
  const setComplete =
    !profile.goldWeightSetClaimed && goldWeights.every((weight) => collected.includes(weight.id))
  const weightGold = setComplete ? tuning.goldWeights.setReward : 0

  const gold = stats.gold + missionGold + weightGold
  const newBest = stats.score > profile.bestScore

  const next: Profile = {
    ...profile,
    gold: profile.gold + gold,
    goldEarned: profile.goldEarned + gold,
    bestScore: Math.max(profile.bestScore, stats.score),
    sankofaTokens: profile.sankofaTokens + (missions.setCompleted ? 1 : 0),
    missions: missions.state,
    goldWeights: collected,
    goldWeightSetClaimed: profile.goldWeightSetClaimed || setComplete,
    stats: {
      runs: profile.stats.runs + 1,
      totalDistance: profile.stats.totalDistance + stats.distance,
      totalGold: profile.stats.totalGold + stats.gold,
    },
  }

  return {
    profile: next,
    summary: {
      gold: stats.gold,
      score: stats.score,
      newBest,
      missionsCompleted: missions.completed.map((mission) => ({ text: describeMission(mission), reward })),
      setCompleted: missions.setCompleted,
      multiplier: 1 + missions.state.level,
      goldWeightsFound: foundIds.map((id) => goldWeights.find((weight) => weight.id === id)?.name ?? id),
      goldWeightSetComplete: setComplete,
    },
  }
}

export const claimDaily = (
  profile: Profile,
  today: string,
): { profile: Profile; gold: number; sankofa: number } | null => {
  const offer = dailyOffer(profile.daily, today)
  if (!offer.available) return null
  return {
    profile: {
      ...profile,
      gold: profile.gold + offer.gold,
      goldEarned: profile.goldEarned + offer.gold,
      sankofaTokens: profile.sankofaTokens + offer.sankofa,
      daily: { lastClaimDay: today, streak: offer.streak },
    },
    gold: offer.gold,
    sankofa: offer.sankofa,
  }
}
