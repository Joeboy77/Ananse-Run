import { isDebug } from '@/debug/isDebug'

export interface CharacterAsset {
  model: string
  extraArms?: string
}

export interface AssetManifest {
  characters: Partial<Record<string, CharacterAsset>>
  props: Record<string, string>
  textures: Record<string, string>
  audio: Record<string, string>
}

export const assets: AssetManifest = {
  characters: {
    ananse: {
      model: '/assets/characters/ananse/ananse.glb',
      extraArms: '/assets/characters/ananse/ananse_extra_arms.glb',
    },
  },
  props: {},
  textures: {},
  audio: {},
}

const previewOverride = (): CharacterAsset | null => {
  if (typeof window === 'undefined' || !isDebug()) return null
  const params = new URLSearchParams(window.location.search)
  const model = params.get('model')
  if (!model?.startsWith('/assets/')) return null
  const arms = params.get('arms')
  return { model, extraArms: arms?.startsWith('/assets/') ? arms : undefined }
}

export const characterAsset = (id: string): CharacterAsset | null =>
  previewOverride() ?? assets.characters[id] ?? assets.characters.ananse ?? null
