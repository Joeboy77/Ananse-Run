import { isDebug } from '@/debug/isDebug'
import type { ObstacleVisual } from '@/game/obstacles/types'
import assetIndex from './assetIndex.json'

export interface CharacterAsset {
  model: string
  extraArms?: string
}

export interface PropAsset {
  model: string
  visual: ObstacleVisual
  rotationY?: number
}

export interface AssetManifest {
  characters: Partial<Record<string, CharacterAsset>>
  props: Record<string, PropAsset>
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
  props: {
    crates: { model: '/assets/props/obstacle_crates.glb', visual: 'low' },
    basin: { model: '/assets/props/obstacle_basin.glb', visual: 'low' },
    sacks: { model: '/assets/props/obstacle_sacks.glb', visual: 'low' },
    dog: { model: '/assets/props/obstacle_dog.glb', visual: 'low' },
    signboard: { model: '/assets/props/obstacle_signboard.glb', visual: 'high' },
    kiosk: { model: '/assets/props/obstacle_kiosk.glb', visual: 'full' },
    chairs: { model: '/assets/props/obstacle_chairs.glb', visual: 'full' },
    cart: { model: '/assets/props/obstacle_cart.glb', visual: 'full' },
    trotroParked: { model: '/assets/props/obstacle_trotro.glb', visual: 'full', rotationY: Math.PI },
    trotroOncoming: { model: '/assets/props/obstacle_trotro.glb', visual: 'trotro' },
    okada: { model: '/assets/props/obstacle_okada.glb', visual: 'okada', rotationY: Math.PI / 2 },
  },
  textures: {},
  audio: {},
}

const available = new Set<string>(assetIndex)

export const availableProps = (): PropAsset[] =>
  Object.values(assets.props).filter((prop) => available.has(prop.model))

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
