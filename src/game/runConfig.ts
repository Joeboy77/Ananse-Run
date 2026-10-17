import { goldWeights } from '@/content/goldWeights'
import { TIMED_POWER_UPS } from '@/content/powerUps'
import { scoreMultiplier, type Profile } from '@/game/progression/profile'
import { powerUpDuration } from '@/game/progression/shop'
import type { RunConfig } from '@/game/loop/simulation'
import type { PowerUpTimes } from '@/game/powerups/powerUpSystem'

export const runConfigFor = (profile: Profile): RunConfig => ({
  durations: Object.fromEntries(
    TIMED_POWER_UPS.map((id) => [id, powerUpDuration(id, profile.upgrades[id])]),
  ) as PowerUpTimes,
  multiplier: scoreMultiplier(profile),
  missingGoldWeights: goldWeights
    .map((weight) => weight.id)
    .filter((id) => !profile.goldWeights.includes(id)),
})
