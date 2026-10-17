import { create } from 'zustand'
import type { RunPhase } from '@/game/loop/runPhase'

interface GameState {
  phase: RunPhase
  score: number
  gold: number
  best: number
  newBest: boolean
}

export const useGameStore = create<GameState>(() => ({
  phase: 'menu',
  score: 0,
  gold: 0,
  best: 0,
  newBest: false,
}))
