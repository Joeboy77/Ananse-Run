import { describe, expect, it } from 'vitest'
import { createRng } from '@/game/core/rng'
import { tuning } from '@/config/tuning'
import { chunks } from './chunks'
import { ChunkGenerator, difficultyAt, MAX_LEVEL } from './generator'

describe('chunk generator', () => {
  it('only picks chunks at or below the level', () => {
    const generator = new ChunkGenerator(chunks, createRng(3))
    for (let i = 0; i < 200; i++) expect(generator.next(0).difficulty).toBe(0)
  })

  it('does not repeat any of the last few chunks when alternatives exist', () => {
    const generator = new ChunkGenerator(chunks, createRng(9))
    const history: string[] = []
    for (let i = 0; i < 500; i++) {
      const id = generator.next(MAX_LEVEL).id
      expect(history.slice(-tuning.difficulty.recentMemory)).not.toContain(id)
      history.push(id)
    }
  })

  it('favours chunks at the current level', () => {
    const generator = new ChunkGenerator(chunks, createRng(21))
    const picks = Array.from({ length: 600 }, () => generator.next(3).difficulty)
    const atLevel = picks.filter((d) => d === 3).length
    const easy = picks.filter((d) => d === 0).length
    expect(atLevel).toBeGreaterThan(easy)
  })

  it('is deterministic for a seed', () => {
    const a = new ChunkGenerator(chunks, createRng(11))
    const b = new ChunkGenerator(chunks, createRng(11))
    const ids = (g: ChunkGenerator) => Array.from({ length: 20 }, () => g.next(2).id)
    expect(ids(a)).toEqual(ids(b))
  })

  it('raises difficulty at the configured times and caps it', () => {
    expect(difficultyAt(0)).toBe(0)
    expect(difficultyAt(tuning.difficulty.levelStartTimes[1])).toBe(1)
    expect(difficultyAt(65)).toBe(2)
    expect(difficultyAt(10_000)).toBe(MAX_LEVEL)
  })

  it('has chunks for every level', () => {
    for (let level = 0; level <= MAX_LEVEL; level++) {
      expect(chunks.some((chunk) => chunk.difficulty === level)).toBe(true)
    }
  })
})
