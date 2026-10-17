import type { LaneIndex } from './lanes'

export type PieceKind = 'low' | 'high' | 'full' | 'platform' | 'ramp' | 'oncoming' | 'okada'

export interface ChunkPiece {
  kind: PieceKind
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

export interface ChunkSlot {
  lane: LaneIndex
  at: number
  elevated?: boolean
}

export interface ChunkDef {
  id: string
  difficulty: number
  obstacles: readonly ChunkPiece[]
  gold: readonly ChunkGold[]
  slots?: readonly ChunkSlot[]
}
