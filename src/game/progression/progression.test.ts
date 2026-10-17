import { describe, expect, it } from 'vitest'
import { goldWeights } from '@/content/goldWeights'
import { MISSIONS_PER_SET, missionReward } from '@/content/missions'
import { tuning } from '@/config/tuning'
import { createRunStats, type RunStats } from '@/game/loop/runStats'
import { dailyOffer, dailyRewards, dayKey } from './daily'
import { applyRunToMissions, createMissionSet, niceRound } from './missions'
import { createProfile, normalizeProfile, scoreMultiplier, type Profile } from './profile'
import { applyRunResult, claimDaily } from './rewards'
import { equipCharacter, powerUpDuration, purchase } from './shop'

const stats = (overrides: Partial<RunStats>): RunStats => ({ ...createRunStats(), ...overrides })
const rich = (gold = 100_000): Profile => ({ ...createProfile(), gold })

describe('missions', () => {
  it('creates three distinct missions per set, deterministically', () => {
    const set = createMissionSet(0)
    expect(set).toHaveLength(MISSIONS_PER_SET)
    expect(new Set(set.map((m) => m.templateId)).size).toBe(MISSIONS_PER_SET)
    expect(createMissionSet(4)).toEqual(createMissionSet(4))
  })

  it('makes later sets harder', () => {
    const first = createMissionSet(0).map((m) => m.target)
    const later = createMissionSet(10).map((m) => m.target)
    expect(Math.max(...later)).toBeGreaterThan(Math.min(...first))
  })

  it('tracks best value for run missions and sums total missions', () => {
    const state = {
      setIndex: 0,
      level: 0,
      active: [
        { templateId: 'gold-run', target: 50, progress: 0, done: false },
        { templateId: 'slide-total', target: 10, progress: 0, done: false },
        { templateId: 'runs-total', target: 3, progress: 0, done: false },
      ],
    }
    const a = applyRunToMissions(state, stats({ gold: 30, dodgedHigh: 4 }))
    const b = applyRunToMissions(a.state, stats({ gold: 20, dodgedHigh: 4 }))
    expect(b.state.active[0]!.progress).toBe(30)
    expect(b.state.active[1]!.progress).toBe(8)
    expect(b.state.active[2]!.progress).toBe(2)
    expect(b.completed).toHaveLength(0)
  })

  it('raises the multiplier and starts a new set when all three are done', () => {
    const state = {
      setIndex: 0,
      level: 0,
      active: [
        { templateId: 'gold-run', target: 50, progress: 0, done: false },
        { templateId: 'runs-total', target: 1, progress: 0, done: false },
        { templateId: 'jump-total', target: 1, progress: 1, done: true },
      ],
    }
    const result = applyRunToMissions(state, stats({ gold: 60 }))
    expect(result.setCompleted).toBe(true)
    expect(result.completed).toHaveLength(2)
    expect(result.state.level).toBe(1)
    expect(result.state.setIndex).toBe(1)
    expect(result.state.active.every((m) => !m.done)).toBe(true)
  })

  it('rounds targets to friendly numbers', () => {
    expect(niceRound(7.4)).toBe(7)
    expect(niceRound(73)).toBe(75)
    expect(niceRound(1234)).toBe(1250)
    expect(niceRound(12_345)).toBe(12_300)
  })
})

describe('daily reward', () => {
  const claimed = (lastClaimDay: string, streak: number) => ({ lastClaimDay, streak })

  it('offers day one on first launch', () => {
    expect(dailyOffer({ lastClaimDay: null, streak: 0 }, '2026-10-17')).toMatchObject({
      available: true,
      streak: 1,
      gold: dailyRewards[0],
    })
  })

  it('is not available twice on the same day', () => {
    expect(dailyOffer(claimed('2026-10-17', 3), '2026-10-17').available).toBe(false)
  })

  it('grows the streak on consecutive days, across month ends', () => {
    expect(dailyOffer(claimed('2026-10-31', 3), '2026-11-01').streak).toBe(4)
  })

  it('resets gently after missed days', () => {
    expect(dailyOffer(claimed('2026-10-10', 6), '2026-10-17').streak).toBe(3)
    expect(dailyOffer(claimed('2026-10-10', 1), '2026-10-17').streak).toBe(1)
  })

  it('gives a Sankofa token every seventh day and caps gold', () => {
    const offer = dailyOffer(claimed('2026-10-16', 6), '2026-10-17')
    expect(offer.sankofa).toBe(1)
    expect(offer.gold).toBe(dailyRewards[dailyRewards.length - 1])
    expect(dailyOffer(claimed('2026-10-16', 20), '2026-10-17').gold).toBe(
      dailyRewards[dailyRewards.length - 1],
    )
  })

  it('claims once and updates the profile', () => {
    const first = claimDaily(createProfile(), '2026-10-17')!
    expect(first.profile.gold).toBe(dailyRewards[0])
    expect(claimDaily(first.profile, '2026-10-17')).toBeNull()
  })

  it('formats local day keys', () => {
    expect(dayKey(new Date(2026, 0, 5))).toBe('2026-01-05')
  })
})

describe('shop', () => {
  it('buys an upgrade and deducts gold', () => {
    const result = purchase(rich(1000), 'upgrade:magnet')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.profile.upgrades.magnet).toBe(1)
    expect(result.profile.gold).toBe(750)
  })

  it('refuses when gold is short', () => {
    expect(purchase(rich(10), 'upgrade:magnet')).toEqual({ ok: false, reason: 'insufficient-gold' })
  })

  it('stops at the max level', () => {
    let profile = rich()
    for (let i = 0; i < tuning.powerUps.maxLevel; i++) {
      const result = purchase(profile, 'upgrade:drum')
      if (result.ok) profile = result.profile
    }
    expect(profile.upgrades.drum).toBe(tuning.powerUps.maxLevel)
    expect(purchase(profile, 'upgrade:drum')).toEqual({ ok: false, reason: 'max-level' })
  })

  it('upgrades make power-ups last longer', () => {
    expect(powerUpDuration('magnet', 2)).toBeGreaterThan(powerUpDuration('magnet', 0))
  })

  it('buys consumables', () => {
    const sankofa = purchase(rich(), 'sankofa')
    const charm = purchase(rich(), 'charm')
    expect(sankofa.ok && sankofa.profile.sankofaTokens).toBe(createProfile().sankofaTokens + 1)
    expect(charm.ok && charm.profile.shieldCharms).toBe(1)
  })

  it('unlocks a character once and only equips owned ones', () => {
    const base = rich()
    expect(equipCharacter(base, 'aso').equipped.character).toBe('ananse')
    const bought = purchase(base, 'character:aso')
    expect(bought.ok).toBe(true)
    if (!bought.ok) return
    expect(purchase(bought.profile, 'character:aso')).toEqual({ ok: false, reason: 'owned' })
    expect(equipCharacter(bought.profile, 'aso').equipped.character).toBe('aso')
  })
})

describe('run rewards', () => {
  it('adds gold, best score and stats', () => {
    const { profile, summary } = applyRunResult(
      createProfile(),
      stats({ gold: 40, score: 900, distance: 800 }),
    )
    expect(profile.gold).toBeGreaterThanOrEqual(40)
    expect(profile.bestScore).toBe(900)
    expect(profile.stats.runs).toBe(1)
    expect(summary.newBest).toBe(true)
  })

  it('pays mission rewards', () => {
    const base = createProfile()
    base.missions.active = [
      { templateId: 'runs-total', target: 1, progress: 0, done: false },
      { templateId: 'gold-run', target: 9999, progress: 0, done: false },
      { templateId: 'jump-total', target: 9999, progress: 0, done: false },
    ]
    const { profile, summary } = applyRunResult(base, stats({ gold: 5 }))
    expect(summary.missionsCompleted).toHaveLength(1)
    expect(profile.gold).toBe(5 + missionReward(0))
  })

  it('gives a Sankofa token and multiplier for a finished set', () => {
    const base = createProfile()
    base.missions.active = base.missions.active.map((m) => ({ ...m, templateId: 'runs-total', target: 1 }))
    const { profile, summary } = applyRunResult(base, stats({}))
    expect(summary.setCompleted).toBe(true)
    expect(scoreMultiplier(profile)).toBe(2)
    expect(profile.sankofaTokens).toBe(base.sankofaTokens + 1)
  })

  it('rewards a full gold weight set once', () => {
    const base = { ...createProfile(), goldWeights: goldWeights.slice(1).map((w) => w.id) }
    const first = applyRunResult(base, stats({ goldWeights: [goldWeights[0]!.id] }))
    expect(first.summary.goldWeightSetComplete).toBe(true)
    expect(first.profile.gold).toBeGreaterThanOrEqual(tuning.goldWeights.setReward)
    const second = applyRunResult(first.profile, stats({ goldWeights: [goldWeights[0]!.id] }))
    expect(second.summary.goldWeightSetComplete).toBe(false)
    expect(second.summary.goldWeightsFound).toHaveLength(0)
  })
})

describe('profile', () => {
  it('fills defaults for missing or broken data', () => {
    expect(normalizeProfile(null)).toEqual(createProfile())
    const fixed = normalizeProfile({
      gold: -5,
      bestScore: 'x',
      upgrades: { magnet: 2 },
      equipped: { character: 'aso' },
    })
    expect(fixed.gold).toBe(0)
    expect(fixed.bestScore).toBe(0)
    expect(fixed.upgrades.magnet).toBe(2)
    expect(fixed.equipped.character).toBe('ananse')
  })

  it('keeps valid saved data', () => {
    const saved = { ...rich(1234), bestScore: 5000 }
    expect(normalizeProfile(JSON.parse(JSON.stringify(saved)))).toEqual(saved)
  })
})
