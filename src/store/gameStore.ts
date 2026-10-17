import { create } from 'zustand'
import type { TimedPowerUpId } from '@/content/powerUps'
import type { RunPhase } from '@/game/loop/runPhase'
import type { RunSummary } from '@/game/progression/rewards'

export interface HudPowerUp {
  id: TimedPowerUpId
  remaining: number
  duration: number
}

interface GameState {
  phase: RunPhase
  score: number
  gold: number
  multiplier: number
  drum: boolean
  shield: boolean
  powerUps: HudPowerUp[]
  continueOffer: boolean
  summary: RunSummary | null
  toast: { id: number; text: string } | null
}

export const useGameStore = create<GameState>(() => ({
  phase: 'menu',
  score: 0,
  gold: 0,
  multiplier: 1,
  drum: false,
  shield: false,
  powerUps: [],
  continueOffer: false,
  summary: null,
  toast: null,
}))

let toastId = 0

export const showToast = (text: string): void => {
  useGameStore.setState({ toast: { id: ++toastId, text } })
}
