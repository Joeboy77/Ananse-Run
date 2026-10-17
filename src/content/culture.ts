export type CultureEntryKind = 'twi-word' | 'proverb' | 'adinkra' | 'place' | 'story'

export interface CultureEntry {
  id: string
  kind: CultureEntryKind
  original: string
  english: string
  note?: string
  verified: boolean
}

export const culture: readonly CultureEntry[] = []

export const verifiedCulture = (): readonly CultureEntry[] => culture.filter((entry) => entry.verified)
