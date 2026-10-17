import { DEFAULT_CHARACTER } from '@/content/characters'
import { TIMED_POWER_UPS, type TimedPowerUpId } from '@/content/powerUps'
import { createMissionSet, type MissionsState } from './missions'

export interface DailyState {
  lastClaimDay: string | null
  streak: number
}

export interface Profile {
  saveVersion: number
  gold: number
  goldEarned: number
  bestScore: number
  upgrades: Record<TimedPowerUpId, number>
  sankofaTokens: number
  shieldCharms: number
  unlockedCharacters: string[]
  unlockedOutfits: string[]
  equipped: { character: string; outfit: string | null }
  missions: MissionsState
  goldWeights: string[]
  goldWeightSetClaimed: boolean
  daily: DailyState
  stats: { runs: number; totalDistance: number; totalGold: number }
}

export const createProfile = (): Profile => ({
  saveVersion: 0,
  gold: 0,
  goldEarned: 0,
  bestScore: 0,
  upgrades: { webSwing: 0, magnet: 0, drum: 0, springWeb: 0 },
  sankofaTokens: 1,
  shieldCharms: 0,
  unlockedCharacters: [DEFAULT_CHARACTER],
  unlockedOutfits: [],
  equipped: { character: DEFAULT_CHARACTER, outfit: null },
  missions: { setIndex: 0, level: 0, active: createMissionSet(0) },
  goldWeights: [],
  goldWeightSetClaimed: false,
  daily: { lastClaimDay: null, streak: 0 },
  stats: { runs: 0, totalDistance: 0, totalGold: 0 },
})

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const num = (value: unknown, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : fallback

const strings = (value: unknown, fallback: string[]): string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string') ? [...new Set(value)] : fallback

export const normalizeProfile = (raw: unknown): Profile => {
  const base = createProfile()
  if (!isRecord(raw)) return base

  const upgrades = isRecord(raw.upgrades) ? raw.upgrades : {}
  const equipped = isRecord(raw.equipped) ? raw.equipped : {}
  const missions = isRecord(raw.missions) ? raw.missions : {}
  const daily = isRecord(raw.daily) ? raw.daily : {}
  const stats = isRecord(raw.stats) ? raw.stats : {}
  const unlockedCharacters = strings(raw.unlockedCharacters, base.unlockedCharacters)
  if (!unlockedCharacters.includes(DEFAULT_CHARACTER)) unlockedCharacters.unshift(DEFAULT_CHARACTER)
  const unlockedOutfits = strings(raw.unlockedOutfits, [])
  const character =
    typeof equipped.character === 'string' && unlockedCharacters.includes(equipped.character)
      ? equipped.character
      : DEFAULT_CHARACTER
  const outfit =
    typeof equipped.outfit === 'string' && unlockedOutfits.includes(equipped.outfit) ? equipped.outfit : null
  const missionsValid = Array.isArray(missions.active) && missions.active.length > 0

  return {
    saveVersion: num(raw.saveVersion, 0),
    gold: num(raw.gold, 0),
    goldEarned: num(raw.goldEarned, 0),
    bestScore: num(raw.bestScore, 0),
    upgrades: Object.fromEntries(
      TIMED_POWER_UPS.map((id) => [id, Math.floor(num(upgrades[id], 0))]),
    ) as Record<TimedPowerUpId, number>,
    sankofaTokens: num(raw.sankofaTokens, base.sankofaTokens),
    shieldCharms: num(raw.shieldCharms, 0),
    unlockedCharacters,
    unlockedOutfits,
    equipped: { character, outfit },
    missions: missionsValid
      ? {
          setIndex: num(missions.setIndex, 0),
          level: num(missions.level, 0),
          active: missions.active as MissionsState['active'],
        }
      : base.missions,
    goldWeights: strings(raw.goldWeights, []),
    goldWeightSetClaimed: raw.goldWeightSetClaimed === true,
    daily: {
      lastClaimDay: typeof daily.lastClaimDay === 'string' ? daily.lastClaimDay : null,
      streak: num(daily.streak, 0),
    },
    stats: {
      runs: num(stats.runs, 0),
      totalDistance: num(stats.totalDistance, 0),
      totalGold: num(stats.totalGold, 0),
    },
  }
}

export const scoreMultiplier = (profile: Profile): number => 1 + profile.missions.level
