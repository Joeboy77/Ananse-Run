import { describe, expect, it } from 'vitest'
import { createProfile } from '@/game/progression/profile'
import { createMemoryStore } from './keyValueStore'
import { createProfileRepository } from './profileRepository'

describe('profile repository', () => {
  it('returns a fresh profile when nothing is saved', async () => {
    const repo = createProfileRepository(createMemoryStore())
    expect(await repo.load()).toEqual(createProfile())
  })

  it('round-trips a saved profile', async () => {
    const repo = createProfileRepository(createMemoryStore())
    await repo.save({ ...createProfile(), gold: 321, bestScore: 999, saveVersion: 1 })
    const loaded = await repo.load()
    expect(loaded.gold).toBe(321)
    expect(loaded.bestScore).toBe(999)
    expect(loaded.saveVersion).toBe(1)
  })

  it('keeps the last write when saves overlap', async () => {
    const repo = createProfileRepository(createMemoryStore())
    await Promise.all([
      repo.save({ ...createProfile(), gold: 1 }),
      repo.save({ ...createProfile(), gold: 2 }),
    ])
    expect((await repo.load()).gold).toBe(2)
  })

  it('falls back to a fresh profile when storage fails', async () => {
    const repo = createProfileRepository({
      get: () => Promise.reject(new Error('blocked')),
      set: () => Promise.resolve(),
    })
    expect(await repo.load()).toEqual(createProfile())
  })
})
