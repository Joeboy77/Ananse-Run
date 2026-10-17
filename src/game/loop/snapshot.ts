import { tuning } from '@/config/tuning'
import { Chaser } from '@/game/chaser/chaser'
import { createObstacle, type Obstacle } from '@/game/obstacles/types'
import { Player } from '@/game/player/player'
import { PowerUpSystem } from '@/game/powerups/powerUpSystem'
import { createGold, type Gold } from '@/game/track/gold'
import { createPickup, type Pickup } from '@/game/track/pickups'
import type { Pool } from '@/game/track/pool'
import { createRunStats, type RunStats } from './runStats'

export class SimSnapshot {
  elapsed = 0
  distance = 0
  speed = 0
  gold = 0
  scoreAccum = 0
  cleanDistance = 0
  lastSupport = 0
  skyCursor = 0
  skyLane = 1
  skyCount = 0
  rngState = 0
  spawnCursor = 0
  scroll = 0
  readonly recent: string[] = []
  readonly missingWeights: string[] = []
  readonly stats: RunStats = createRunStats()
  readonly player = new Player()
  readonly powerUps = new PowerUpSystem()
  readonly chaser = new Chaser()
  readonly obstacles: Obstacle[] = Array.from({ length: tuning.pools.obstacles }, createObstacle)
  readonly goldItems: Gold[] = Array.from({ length: tuning.pools.gold }, createGold)
  readonly pickups: Pickup[] = Array.from({ length: tuning.pools.pickups }, createPickup)
}

export const copyStrings = (target: string[], source: readonly string[]): void => {
  target.length = 0
  for (const value of source) target.push(value)
}

export const copyStats = (target: RunStats, source: RunStats): void => {
  const weights = target.goldWeights
  Object.assign(target, source)
  target.goldWeights = weights
  copyStrings(weights, source.goldWeights)
}

export const savePool = <T extends { active: boolean }>(pool: Pool<T>, target: T[]): void => {
  pool.items.forEach((item, index) => Object.assign(target[index]!, item))
}

export const loadPool = <T extends { active: boolean }>(pool: Pool<T>, source: readonly T[]): void => {
  pool.items.forEach((item, index) => Object.assign(item, source[index]!))
  pool.rebuildFree()
}
