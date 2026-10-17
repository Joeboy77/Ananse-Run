import { describe, expect, it } from 'vitest'
import { Pool } from './pool'

describe('pool', () => {
  it('reuses released items without allocating', () => {
    const pool = new Pool(2, () => ({ active: false, id: 0 }))
    const a = pool.acquire()!
    const b = pool.acquire()!
    expect(pool.acquire()).toBeNull()
    pool.release(a)
    expect(pool.acquire()).toBe(a)
    expect(pool.activeCount).toBe(2)
    pool.releaseAll()
    expect(pool.activeCount).toBe(0)
    expect(b.active).toBe(false)
  })
})
