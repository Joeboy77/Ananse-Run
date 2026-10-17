import { tuning } from '@/config/tuning'
import type { Rng } from '@/game/core/rng'
import type { ChunkDef } from './chunkTypes'

const RECENT_MEMORY = 2

export const difficultyAt = (elapsed: number): number =>
  Math.min(tuning.difficulty.maxLevel, Math.floor(elapsed / tuning.difficulty.secondsPerLevel))

export class ChunkGenerator {
  private recent: string[] = []
  private readonly pool: readonly ChunkDef[]
  private readonly rng: Rng

  constructor(pool: readonly ChunkDef[], rng: Rng) {
    this.pool = pool
    this.rng = rng
  }

  reset(): void {
    this.recent = []
  }

  next(level: number): ChunkDef {
    const eligible = this.pool.filter((chunk) => chunk.difficulty <= level)
    const fresh = eligible.filter((chunk) => !this.recent.includes(chunk.id))
    const candidates = fresh.length > 0 ? fresh : eligible
    const weights = candidates.map((chunk) => (chunk.difficulty === level ? 3 : 1))
    const total = weights.reduce((sum, weight) => sum + weight, 0)

    let roll = this.rng.next() * total
    let picked = candidates[candidates.length - 1]!
    for (let i = 0; i < candidates.length; i++) {
      roll -= weights[i]!
      if (roll < 0) {
        picked = candidates[i]!
        break
      }
    }

    this.recent.push(picked.id)
    if (this.recent.length > RECENT_MEMORY) this.recent.shift()
    return picked
  }
}
