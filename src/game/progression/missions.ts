import {
  findMissionTemplate,
  MAX_MULTIPLIER_LEVEL,
  missionTemplates,
  MISSIONS_PER_SET,
} from '@/content/missions'
import { createRng } from '@/game/core/rng'
import type { RunStats } from '@/game/loop/runStats'

export interface ActiveMission {
  templateId: string
  target: number
  progress: number
  done: boolean
}

export interface MissionsState {
  setIndex: number
  level: number
  active: ActiveMission[]
}

export interface MissionsUpdate {
  state: MissionsState
  completed: ActiveMission[]
  setCompleted: boolean
}

export const niceRound = (value: number): number => {
  if (value < 20) return Math.max(1, Math.round(value))
  if (value < 200) return Math.round(value / 5) * 5
  if (value < 2000) return Math.round(value / 50) * 50
  return Math.round(value / 100) * 100
}

export const createMissionSet = (setIndex: number): ActiveMission[] => {
  const rng = createRng(setIndex * 7919 + 17)
  const pool = [...missionTemplates]
  const picked: ActiveMission[] = []
  while (picked.length < MISSIONS_PER_SET && pool.length > 0) {
    const [template] = pool.splice(rng.int(pool.length), 1)
    if (!template) break
    picked.push({
      templateId: template.id,
      target: niceRound(template.base * (1 + 0.5 * setIndex)),
      progress: 0,
      done: false,
    })
  }
  return picked
}

export const describeMission = (mission: ActiveMission): string =>
  findMissionTemplate(mission.templateId)?.describe(mission.target) ?? 'Unknown mission'

export const applyRunToMissions = (state: MissionsState, stats: RunStats): MissionsUpdate => {
  const completed: ActiveMission[] = []
  const active = state.active.map((mission) => {
    const template = findMissionTemplate(mission.templateId)
    if (!template || mission.done) return mission
    const value = template.measure(stats)
    const progress = Math.min(
      mission.target,
      template.scope === 'run' ? Math.max(mission.progress, value) : mission.progress + value,
    )
    const next = { ...mission, progress, done: progress >= mission.target }
    if (next.done) completed.push(next)
    return next
  })

  if (!active.every((mission) => mission.done)) {
    return { state: { ...state, active }, completed, setCompleted: false }
  }

  const setIndex = state.setIndex + 1
  return {
    state: {
      setIndex,
      level: Math.min(MAX_MULTIPLIER_LEVEL, state.level + 1),
      active: createMissionSet(setIndex),
    },
    completed,
    setCompleted: true,
  }
}
