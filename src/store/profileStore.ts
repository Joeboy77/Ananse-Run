import { create } from 'zustand'
import { createProfile, type Profile } from '@/game/progression/profile'
import { createBrowserStore } from '@/services/save/keyValueStore'
import { createProfileRepository } from '@/services/save/profileRepository'

interface ProfileState {
  profile: Profile
  loaded: boolean
}

export const useProfileStore = create<ProfileState>(() => ({
  profile: createProfile(),
  loaded: false,
}))

const repository = createProfileRepository(createBrowserStore())

export const loadProfile = async (): Promise<void> => {
  const profile = await repository.load()
  useProfileStore.setState({ profile, loaded: true })
}

export const getProfile = (): Profile => useProfileStore.getState().profile

export const isProfileLoaded = (): boolean => useProfileStore.getState().loaded

export const commitProfile = (profile: Profile): void => {
  if (!isProfileLoaded()) return
  const versioned = { ...profile, saveVersion: profile.saveVersion + 1 }
  useProfileStore.setState({ profile: versioned })
  void repository.save(versioned).catch(() => undefined)
}
