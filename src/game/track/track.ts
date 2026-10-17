import { tuning } from '@/config/tuning'
import { createObstacle, isWalkable, obstacleHeights, type Obstacle } from '@/game/obstacles/types'
import type { ChunkDef } from './chunkTypes'
import { createGold, type Gold } from './gold'
import { laneToX } from './lanes'
import { obstacleLength } from './pathCheck'
import { Pool } from './pool'

const { chunkLength, chunksAlive, despawnBehind } = tuning.track
const { spacing, baseHeight, arcHeight } = tuning.gold
const spawnHorizon = -chunkLength * chunksAlive
const startOffset = 6
const walkableTolerance = 0.1

export interface Span {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}

export class Track {
  readonly obstacles = new Pool<Obstacle>(tuning.pools.obstacles, createObstacle)
  readonly gold = new Pool<Gold>(tuning.pools.gold, createGold)
  spawnCursor = startOffset
  scroll = 0

  reset(): void {
    this.obstacles.releaseAll()
    this.gold.releaseAll()
    this.spawnCursor = startOffset
    this.scroll = 0
  }

  needsChunk(): boolean {
    return this.spawnCursor > spawnHorizon
  }

  spawn(chunk: ChunkDef): void {
    const origin = this.spawnCursor

    for (const def of chunk.obstacles) {
      const obstacle = this.obstacles.acquire()
      if (!obstacle) break
      const depth = obstacleLength(def)
      const heights = obstacleHeights[def.kind]
      obstacle.kind = def.kind
      obstacle.lane = def.lane
      obstacle.x = laneToX(def.lane)
      obstacle.depth = depth
      obstacle.z = origin - def.at - depth / 2
      obstacle.bottom = heights.bottom
      obstacle.top = heights.top
    }

    for (const def of chunk.gold) {
      const lift = def.elevated ? tuning.obstacles.platform.height : 0
      for (let i = 0; i < def.count; i++) {
        const gold = this.gold.acquire()
        if (!gold) break
        const arc = def.pattern === 'arc' && def.count > 1 ? Math.sin((Math.PI * i) / (def.count - 1)) : 0
        gold.lane = def.lane
        gold.x = laneToX(def.lane)
        gold.y = lift + baseHeight + arc * arcHeight
        gold.z = origin - def.at - i * spacing
      }
    }

    this.spawnCursor = origin - chunkLength
  }

  advance(distance: number): void {
    this.spawnCursor += distance
    this.scroll += distance

    for (const obstacle of this.obstacles.items) {
      if (!obstacle.active) continue
      obstacle.z += distance
      if (obstacle.z - obstacle.depth / 2 > despawnBehind) this.obstacles.release(obstacle)
    }

    for (const gold of this.gold.items) {
      if (!gold.active) continue
      gold.z += distance
      if (gold.z > despawnBehind) this.gold.release(gold)
    }
  }

  supportHeight(span: Span, feet: number): number {
    let support = 0
    for (const obstacle of this.obstacles.items) {
      if (!obstacle.active || !isWalkable(obstacle.kind)) continue
      if (obstacle.top > feet + walkableTolerance || obstacle.top <= support) continue
      if (!overlapsSpan(obstacle, span)) continue
      support = obstacle.top
    }
    return support
  }
}

export const overlapsSpan = (obstacle: Obstacle, span: Span): boolean => {
  const halfWidth = tuning.obstacles.width / 2
  const halfDepth = obstacle.depth / 2
  return (
    obstacle.x - halfWidth < span.maxX &&
    obstacle.x + halfWidth > span.minX &&
    obstacle.z - halfDepth < span.maxZ &&
    obstacle.z + halfDepth > span.minZ
  )
}
