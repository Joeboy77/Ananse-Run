import type { RunStats } from '@/game/loop/runStats'

export type MissionScope = 'run' | 'total'

export interface MissionTemplate {
  id: string
  scope: MissionScope
  base: number
  describe: (target: number) => string
  measure: (stats: RunStats) => number
}

export const missionTemplates: readonly MissionTemplate[] = [
  {
    id: 'gold-run',
    scope: 'run',
    base: 50,
    describe: (n) => `Collect ${n} gold dust in one run`,
    measure: (s) => s.gold,
  },
  {
    id: 'score-run',
    scope: 'run',
    base: 1000,
    describe: (n) => `Score ${n.toLocaleString()} in one run`,
    measure: (s) => s.score,
  },
  {
    id: 'clean-run',
    scope: 'run',
    base: 300,
    describe: (n) => `Run ${n} metres without stumbling`,
    measure: (s) => Math.floor(s.cleanDistanceMax),
  },
  {
    id: 'rooftops-run',
    scope: 'run',
    base: 2,
    describe: (n) => `Reach ${n} rooftops in one run`,
    measure: (s) => s.rooftops,
  },
  {
    id: 'slide-total',
    scope: 'total',
    base: 10,
    describe: (n) => `Slide under ${n} awnings`,
    measure: (s) => s.dodgedHigh,
  },
  {
    id: 'jump-total',
    scope: 'total',
    base: 15,
    describe: (n) => `Jump over ${n} crates`,
    measure: (s) => s.dodgedLow,
  },
  {
    id: 'powerups-total',
    scope: 'total',
    base: 3,
    describe: (n) => `Collect ${n} power-ups`,
    measure: (s) => s.powerUps,
  },
  {
    id: 'gold-total',
    scope: 'total',
    base: 300,
    describe: (n) => `Collect ${n} gold dust in total`,
    measure: (s) => s.gold,
  },
  {
    id: 'runs-total',
    scope: 'total',
    base: 3,
    describe: (n) => `Play ${n} runs`,
    measure: () => 1,
  },
]

export const findMissionTemplate = (id: string): MissionTemplate | undefined =>
  missionTemplates.find((template) => template.id === id)

export const MISSIONS_PER_SET = 3
export const MAX_MULTIPLIER_LEVEL = 29
export const missionReward = (setIndex: number): number => 100 + 50 * setIndex
