export const assets = {
  characters: {},
  props: {},
  textures: {},
  audio: {},
} as const satisfies Record<string, Record<string, string>>

export type AssetManifest = typeof assets
