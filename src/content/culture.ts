export type CultureEntryKind = 'twi-word' | 'proverb' | 'adinkra' | 'place' | 'story'

export interface CultureEntry {
  id: string
  kind: CultureEntryKind
  original: string
  english: string
  note?: string
  verified: boolean
}

export const culture: readonly CultureEntry[] = [
  {
    id: 'adinkra-gye-nyame',
    kind: 'adinkra',
    original: 'Gye Nyame',
    english: 'Except God; the supremacy of God',
    note: 'Used as the Shield power-up name.',
    verified: false,
  },
  {
    id: 'adinkra-sankofa',
    kind: 'adinkra',
    original: 'Sankofa',
    english: 'Go back and get it; learn from the past',
    note: 'Used as the continue item name.',
    verified: false,
  },
  {
    id: 'proverb-tikoro',
    kind: 'proverb',
    original: 'Tikoro nkɔ agyina.',
    english: 'One head does not go into council.',
    note: 'Candidate for a gold weight. Check spelling and meaning.',
    verified: false,
  },
  {
    id: 'proverb-abofra-nyame',
    kind: 'proverb',
    original: 'Obi nkyerɛ abofra Nyame.',
    english: 'No one shows a child the Supreme Being.',
    note: 'Candidate for a gold weight. Check spelling and meaning.',
    verified: false,
  },
  {
    id: 'proverb-sankofa',
    kind: 'proverb',
    original: 'Sɛ wo werɛ fi na wosankofa a, yenkyi.',
    english: 'It is not wrong to go back for what you forgot.',
    note: 'Candidate for a gold weight. Check spelling and meaning.',
    verified: false,
  },
  {
    id: 'proverb-nsateaa',
    kind: 'proverb',
    original: 'Nsateaa nyinaa nnyɛ pɛ.',
    english: 'The fingers are not all equal.',
    note: 'Candidate for a gold weight. Check spelling and meaning.',
    verified: false,
  },
  {
    id: 'proverb-dua-koro',
    kind: 'proverb',
    original: 'Dua koro gye mframa a, ebu.',
    english: 'When a single tree faces the wind, it breaks.',
    note: 'Candidate for a gold weight. Check spelling and meaning.',
    verified: false,
  },
  {
    id: 'proverb-kakra-kakra',
    kind: 'proverb',
    original: 'Kakra kakra, akokɔ nom nsuo.',
    english: 'Little by little, the hen drinks water.',
    note: 'Candidate for a gold weight. Check spelling and meaning.',
    verified: false,
  },
]

export const findCulture = (id: string): CultureEntry | undefined => culture.find((entry) => entry.id === id)

export const verifiedCulture = (): readonly CultureEntry[] => culture.filter((entry) => entry.verified)
