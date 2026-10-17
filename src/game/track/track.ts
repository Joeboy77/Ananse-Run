import { tuning } from '@/config/tuning'
import {
  createObstacle,
  obstacleWidth,
  isWalkable,
  obstacleHeights,
  okadaHeights,
  type Obstacle,
} from '@/game/obstacles/types'
import type { ChunkDef, ChunkPiece, ChunkSlot } from './chunkTypes'
import { createGold, type Gold } from './gold'
import { laneToX } from './lanes'
import { createPickup, type Pickup, type PickupChoice } from './pickups'
import { pieceLength } from './pieces'
import { Pool } from './pool'

const { chunkLength, chunksAlive, despawnBehind } = tuning.track
const { spacing, baseHeight, arcHeight } = tuning.gold
const { moving } = tuning
const spawnHorizon = -chunkLength * chunksAlive
const startOffset = 6
const walkableTolerance = 0.4

export interface Span {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}

export type PickupPicker = (slot: ChunkSlot) => PickupChoice | null

export class Track {
  readonly obstacles = new Pool<Obstacle>(tuning.pools.obstacles, createObstacle)
  readonly gold = new Pool<Gold>(tuning.pools.gold, createGold)
  readonly pickups = new Pool<Pickup>(tuning.pools.pickups, createPickup)
  spawnCursor = startOffset
  scroll = 0
  spawned = 0

  reset(): void {
    this.obstacles.releaseAll()
    this.gold.releaseAll()
    this.pickups.releaseAll()
    this.spawnCursor = startOffset
    this.scroll = 0
    this.spawned = 0
  }

  needsChunk(): boolean {
    return this.spawnCursor > spawnHorizon
  }

  spawn(chunk: ChunkDef, pickPickup?: PickupPicker): void {
    const origin = this.spawnCursor
    for (const piece of chunk.obstacles) this.spawnPiece(piece, origin)

    for (const def of chunk.gold) {
      const lift = def.elevated ? tuning.obstacles.platform.height : 0
      for (let i = 0; i < def.count; i++) {
        const arc = def.pattern === 'arc' && def.count > 1 ? Math.sin((Math.PI * i) / (def.count - 1)) : 0
        this.spawnGold(laneToX(def.lane), lift + baseHeight + arc * arcHeight, origin - def.at - i * spacing)
      }
    }

    if (pickPickup) {
      for (const slot of chunk.slots ?? []) {
        const choice = pickPickup(slot)
        if (!choice) continue
        const pickup = this.pickups.acquire()
        if (!pickup) break
        pickup.type = choice.type
        if (choice.type === 'powerUp') pickup.powerUp = choice.powerUp
        else pickup.weightId = choice.weightId
        pickup.x = laneToX(slot.lane)
        pickup.y = (slot.elevated ? tuning.obstacles.platform.height : 0) + tuning.powerUps.hoverHeight
        pickup.z = origin - slot.at
      }
    }

    this.spawnCursor = origin - chunkLength
  }

  spawnGold(x: number, y: number, z: number): void {
    const gold = this.gold.acquire()
    if (!gold) return
    gold.x = x
    gold.y = y
    gold.z = z
  }

  advance(distance: number, dt: number): void {
    this.spawnCursor += distance
    this.scroll += distance

    for (const obstacle of this.obstacles.items) {
      if (!obstacle.active) continue
      obstacle.prevX = obstacle.x
      obstacle.prevZ = obstacle.z
      obstacle.z += distance
      this.move(obstacle, dt)
      if (obstacle.z - obstacle.depth / 2 > despawnBehind) this.obstacles.release(obstacle)
    }

    for (const gold of this.gold.items) {
      if (!gold.active) continue
      gold.z += distance
      if (gold.z > despawnBehind) this.gold.release(gold)
    }

    for (const pickup of this.pickups.items) {
      if (!pickup.active) continue
      pickup.z += distance
      if (pickup.z > despawnBehind) this.pickups.release(pickup)
    }
  }

  clearObstacles(minZ: number, maxZ: number): void {
    for (const obstacle of this.obstacles.items) {
      if (!obstacle.active) continue
      if (obstacle.z + obstacle.depth / 2 > minZ && obstacle.z - obstacle.depth / 2 < maxZ) {
        this.obstacles.release(obstacle)
      }
    }
  }

  supportHeight(span: Span, feet: number): number {
    let support = 0
    for (const obstacle of this.obstacles.items) {
      if (!obstacle.active || !overlapsSpan(obstacle, span)) continue
      if (obstacle.kind === 'ramp') {
        const along = Math.min(1, Math.max(0, (obstacle.z + obstacle.depth / 2 + span.maxZ) / obstacle.depth))
        const height = along * obstacle.top
        if (height > support && feet >= height - tuning.ramp.stepTolerance) support = height
        continue
      }
      if (!isWalkable(obstacle.kind)) continue
      if (obstacle.top > feet + walkableTolerance || obstacle.top <= support) continue
      support = obstacle.top
    }
    return support
  }

  private spawnPiece(piece: ChunkPiece, origin: number): void {
    const obstacle = this.obstacles.acquire()
    if (!obstacle) return
    const depth = pieceLength(piece)
    obstacle.lane = piece.lane
    obstacle.depth = depth
    obstacle.z = origin - piece.at - depth / 2
    obstacle.x = laneToX(piece.lane)
    obstacle.vx = 0
    obstacle.vz = 0
    obstacle.moving = false
    obstacle.passed = false
    obstacle.variant = Math.imul(++this.spawned, 2654435761) >>> 16

    switch (piece.kind) {
      case 'oncoming':
        obstacle.kind = 'full'
        obstacle.motion = 'oncoming'
        obstacle.visual = 'trotro'
        obstacle.vz = moving.oncomingSpeed
        break
      case 'okada': {
        const side = piece.lane === 2 ? 1 : -1
        obstacle.kind = 'full'
        obstacle.motion = 'crossing'
        obstacle.visual = 'okada'
        obstacle.x = side * moving.crossingStartX
        obstacle.vx = -side * moving.crossingSpeed
        break
      }
      default:
        obstacle.kind = piece.kind
        obstacle.motion = 'none'
        obstacle.visual = piece.kind
    }

    const heights = obstacle.visual === 'okada' ? okadaHeights : obstacleHeights[obstacle.kind]
    obstacle.bottom = heights.bottom
    obstacle.top = heights.top
    obstacle.prevX = obstacle.x
    obstacle.prevZ = obstacle.z
  }

  private move(obstacle: Obstacle, dt: number): void {
    if (obstacle.motion === 'none') return
    if (!obstacle.moving) {
      const threshold =
        obstacle.motion === 'oncoming' ? moving.activationDistance : moving.crossingActivationDistance
      if (obstacle.z > -threshold) obstacle.moving = true
      else return
    }
    obstacle.x += obstacle.vx * dt
    obstacle.z += obstacle.vz * dt
  }
}

export const overlapsSpan = (obstacle: Obstacle, span: Span): boolean => {
  const halfDepth = obstacle.depth / 2
  const halfWidth = obstacleWidth(obstacle) / 2
  return (
    obstacle.x - halfWidth < span.maxX &&
    obstacle.x + halfWidth > span.minX &&
    obstacle.z - halfDepth < span.maxZ &&
    obstacle.z + halfDepth > span.minZ
  )
}
