import { tuning } from '@/config/tuning'
import type { LaneIndex } from '@/game/track/lanes'

export type ObstacleKind = 'low' | 'high' | 'full' | 'platform'

export interface Obstacle {
  active: boolean
  kind: ObstacleKind
  lane: LaneIndex
  x: number
  z: number
  depth: number
  bottom: number
  top: number
}

const { obstacles } = tuning

export const obstacleHeights: Record<ObstacleKind, { bottom: number; top: number }> = {
  low: { bottom: 0, top: obstacles.low.height },
  high: { bottom: obstacles.high.bottom, top: obstacles.high.top },
  full: { bottom: 0, top: obstacles.full.height },
  platform: { bottom: 0, top: obstacles.platform.height },
}

export const defaultDepth: Partial<Record<ObstacleKind, number>> = {
  low: obstacles.low.depth,
  high: obstacles.high.depth,
}

export const isWalkable = (kind: ObstacleKind): boolean => kind === 'low' || kind === 'platform'

export const createObstacle = (): Obstacle => ({
  active: false,
  kind: 'low',
  lane: 1,
  x: 0,
  z: 0,
  depth: 1,
  bottom: 0,
  top: 1,
})
