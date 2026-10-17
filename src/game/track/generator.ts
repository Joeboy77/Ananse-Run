import { tuning } from '@/config/tuning'
import type { Rng } from '@/game/core/rng'
import type { ChunkDef } from './chunkTypes'

const { levelStartTimes, recentMemory } = tuning.difficulty

export const MAX_LEVEL = levelStartTimes.length - 1

export const difficultyAt = (elapsed: number): number => {
  let level = 0
  for (let i = 0; i < levelStartTimes.length; i++) if (elapsed >= levelStartTimes[i]!) level = i
  return level
}

const weightFor = (difficulty: number, level: number): number => {
  if (difficulty === level) return 3
  if (difficulty === level - 1) return 2
  return 1
}

export class ChunkGenerator {
  recent: string[] = []
  private readonly pool: readonly ChunkDef[]
  private readonly rng: Rng

  constructor(pool: readonly ChunkDef[], rng: Rng) {
    this.pool = pool
    this.rng = rng
  }

  reset(): void {
    this.recent.length = 0
  }

  next(level: number): ChunkDef {
    const eligible = this.pool.filter((chunk) => chunk.difficulty <= level)
    const fresh = eligible.filter((chunk) => !this.recent.includes(chunk.id))
    const candidates = fresh.length > 0 ? fresh : eligible
    const total = candidates.reduce((sum, chunk) => sum + weightFor(chunk.difficulty, level), 0)

    let roll = this.rng.next() * total
    let picked = candidates[candidates.length - 1]!
    for (const chunk of candidates) {
      roll -= weightFor(chunk.difficulty, level)
      if (roll < 0) {
        picked = chunk
        break
      }
    }

    this.recent.push(picked.id)
    if (this.recent.length > recentMemory) this.recent.shift()
    return picked
  }
}
