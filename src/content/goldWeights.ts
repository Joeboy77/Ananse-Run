export interface GoldWeightDef {
  id: string
  name: string
  proverbId: string
}

export const goldWeights: readonly GoldWeightDef[] = [
  { id: 'gw-council', name: 'Council weight', proverbId: 'proverb-tikoro' },
  { id: 'gw-child', name: 'Child weight', proverbId: 'proverb-abofra-nyame' },
  { id: 'gw-bird', name: 'Bird weight', proverbId: 'proverb-sankofa' },
  { id: 'gw-hand', name: 'Hand weight', proverbId: 'proverb-nsateaa' },
  { id: 'gw-tree', name: 'Tree weight', proverbId: 'proverb-dua-koro' },
  { id: 'gw-hen', name: 'Hen weight', proverbId: 'proverb-kakra-kakra' },
]
