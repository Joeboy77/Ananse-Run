import { tuning } from '@/config/tuning'
import type { LaneIndex } from '@/game/track/lanes'

export type ObstacleKind = 'low' | 'high' | 'full' | 'platform' | 'ramp'
export type ObstacleMotion = 'none' | 'oncoming' | 'crossing'
export type ObstacleVisual = 'low' | 'high' | 'full' | 'platform' | 'ramp' | 'trotro' | 'okada'

export interface Obstacle {
  active: boolean
  kind: ObstacleKind
  motion: ObstacleMotion
  visual: ObstacleVisual
  lane: LaneIndex
  x: number
  z: number
  prevX: number
  prevZ: number
  vx: number
  vz: number
  moving: boolean
  passed: boolean
  variant: number
  depth: number
  bottom: number
  top: number
}

const { obstacles, moving } = tuning

export const obstacleHeights: Record<ObstacleKind, { bottom: number; top: number }> = {
  low: { bottom: 0, top: obstacles.low.height },
  high: { bottom: obstacles.high.bottom, top: obstacles.high.top },
  full: { bottom: 0, top: obstacles.full.height },
  platform: { bottom: 0, top: obstacles.platform.height },
  ramp: { bottom: 0, top: obstacles.platform.height },
}

export const okadaHeights = { bottom: 0, top: moving.okadaHeight }

export const obstacleWidth = (obstacle: Pick<Obstacle, 'visual'>): number =>
  obstacle.visual === 'okada' ? moving.okadaLength : obstacles.width

export const isWalkable = (kind: ObstacleKind): boolean => kind === 'low' || kind === 'platform'

export const isSolid = (kind: ObstacleKind): boolean => kind !== 'ramp'

export const createObstacle = (): Obstacle => ({
  active: false,
  kind: 'low',
  motion: 'none',
  visual: 'low',
  lane: 1,
  x: 0,
  z: 0,
  prevX: 0,
  prevZ: 0,
  vx: 0,
  vz: 0,
  moving: false,
  passed: false,
  variant: 0,
  depth: 1,
  bottom: 0,
  top: 1,
})
