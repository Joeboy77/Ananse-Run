import { describe, expect, it } from 'vitest'
import { createRng } from '@/game/core/rng'
import { tuning } from '@/config/tuning'
import { chunks } from './chunks'
import { ChunkGenerator, difficultyAt } from './generator'

describe('chunk generator', () => {
  it('only picks chunks at or below the level', () => {
    const generator = new ChunkGenerator(chunks, createRng(3))
    for (let i = 0; i < 200; i++) expect(generator.next(0).difficulty).toBe(0)
  })

  it('never repeats the previous chunk when alternatives exist', () => {
    const generator = new ChunkGenerator(chunks, createRng(9))
    let previous = ''
    for (let i = 0; i < 500; i++) {
      const id = generator.next(3).id
      expect(id).not.toBe(previous)
      previous = id
    }
  })

  it('is deterministic for a seed', () => {
    const a = new ChunkGenerator(chunks, createRng(11))
    const b = new ChunkGenerator(chunks, createRng(11))
    const ids = (g: ChunkGenerator) => Array.from({ length: 20 }, () => g.next(2).id)
    expect(ids(a)).toEqual(ids(b))
  })

  it('raises difficulty over time and caps it', () => {
    expect(difficultyAt(0)).toBe(0)
    expect(difficultyAt(tuning.difficulty.secondsPerLevel)).toBe(1)
    expect(difficultyAt(10_000)).toBe(tuning.difficulty.maxLevel)
  })
})
