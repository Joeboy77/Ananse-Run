import { describe, expect, it } from 'vitest'
import { createRng } from './rng'

describe('rng', () => {
  it('is deterministic for a seed', () => {
    const a = createRng(42)
    const b = createRng(42)
    expect(Array.from({ length: 5 }, () => a.next())).toEqual(Array.from({ length: 5 }, () => b.next()))
  })

  it('stays within range', () => {
    const rng = createRng(7)
    for (let i = 0; i < 1000; i++) {
      const value = rng.int(3)
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(3)
    }
  })
})

describe('rng state', () => {
  it('replays from a saved state', () => {
    const rng = createRng(5)
    rng.next()
    const saved = rng.getState()
    const a = [rng.next(), rng.next()]
    rng.setState(saved)
    expect([rng.next(), rng.next()]).toEqual(a)
  })
})
