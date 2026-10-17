import { tuning } from '@/config/tuning'
import { defaultDepth } from '@/game/obstacles/types'
import type { ChunkDef, ChunkObstacle } from './chunkTypes'
import { LANES } from './lanes'

const { chunkLength, edgeMargin } = tuning.track

export const obstacleLength = (obstacle: ChunkObstacle): number =>
  obstacle.length ?? defaultDepth[obstacle.kind] ?? 1

const blocksLane = (obstacle: ChunkObstacle): boolean => obstacle.kind === 'full'

export const blockedRows = (chunk: ChunkDef): boolean[][] =>
  LANES.map((lane) => {
    const rows = Array.from({ length: chunkLength }, () => false)
    for (const obstacle of chunk.obstacles) {
      if (obstacle.lane !== lane || !blocksLane(obstacle)) continue
      const end = obstacle.at + obstacleLength(obstacle)
      for (let row = Math.floor(obstacle.at); row < Math.ceil(end); row++) rows[row] = true
    }
    return rows
  })

export const hasClearPath = (chunk: ChunkDef): boolean => {
  const blocked = blockedRows(chunk)
  const free = (lane: number, row: number) => !blocked[lane]![row]
  let reachable = LANES.map((lane) => free(lane, 0))

  for (let row = 1; row < chunkLength; row++) {
    reachable = LANES.map((lane) => {
      if (!free(lane, row)) return false
      if (reachable[lane]) return true
      return [lane - 1, lane + 1].some(
        (from) =>
          from >= 0 && from < LANES.length && reachable[from] && free(from, row) && free(lane, row - 1),
      )
    })
    if (!reachable.some(Boolean)) return false
  }
  return true
}

export const respectsEdges = (chunk: ChunkDef): boolean =>
  chunk.obstacles.every(
    (obstacle) =>
      obstacle.at >= edgeMargin && obstacle.at + obstacleLength(obstacle) <= chunkLength - edgeMargin,
  ) &&
  chunk.gold.every((gold) => gold.at >= 0 && gold.at + (gold.count - 1) * tuning.gold.spacing <= chunkLength)
