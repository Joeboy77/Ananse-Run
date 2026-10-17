import type { ObstacleKind } from '@/game/obstacles/types'
import type { LaneIndex } from './lanes'

export interface ChunkObstacle {
  kind: ObstacleKind
  lane: LaneIndex
  at: number
  length?: number
}

export interface ChunkGold {
  lane: LaneIndex
  at: number
  count: number
  pattern: 'line' | 'arc'
  elevated?: boolean
}

export interface ChunkDef {
  id: string
  difficulty: number
  obstacles: readonly ChunkObstacle[]
  gold: readonly ChunkGold[]
}
