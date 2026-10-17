export interface CharacterDef {
  id: string
  name: string
  cost: number
  color: string
}

export interface OutfitDef {
  id: string
  name: string
  cost: number
  accent: string
}

export const DEFAULT_CHARACTER = 'ananse'

export const characters: readonly CharacterDef[] = [
  { id: 'ananse', name: 'Ananse', cost: 0, color: '#f2b705' },
  { id: 'ntikuma', name: 'Ntikuma', cost: 5000, color: '#ff8c42' },
  { id: 'aso', name: 'Aso', cost: 8000, color: '#e85d75' },
]

export const outfits: readonly OutfitDef[] = [
  { id: 'market-day', name: 'Market-day outfit', cost: 1500, accent: '#2a9d8f' },
  { id: 'batakari', name: 'Batakari smock', cost: 2500, accent: '#6d4c41' },
  { id: 'kente-festival', name: 'Kente festival wear', cost: 3000, accent: '#0f7b3e' },
]
