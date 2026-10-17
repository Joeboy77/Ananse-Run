import { normalizeProfile, type Profile } from '@/game/progression/profile'
import type { KeyValueStore } from './keyValueStore'

const PROFILE_KEY = 'profile'

export interface ProfileRepository {
  load(): Promise<Profile>
  save(profile: Profile): Promise<void>
}

export const createProfileRepository = (store: KeyValueStore): ProfileRepository => {
  let queue: Promise<unknown> = Promise.resolve()
  return {
    async load() {
      try {
        return normalizeProfile(await store.get(PROFILE_KEY))
      } catch {
        return normalizeProfile(null)
      }
    },
    save(profile) {
      const write = queue.then(() => store.set(PROFILE_KEY, profile))
      queue = write.catch(() => undefined)
      return write
    },
  }
}
