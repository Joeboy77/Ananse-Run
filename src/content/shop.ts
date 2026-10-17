import { TIMED_POWER_UPS, type TimedPowerUpId } from './powerUps'
import { characters, outfits } from './characters'

export const upgradeCosts: readonly number[] = [250, 600, 1200, 2500, 5000]

export type ShopItem =
  | { kind: 'upgrade'; id: `upgrade:${TimedPowerUpId}`; powerUp: TimedPowerUpId }
  | { kind: 'sankofa'; id: 'sankofa'; cost: number }
  | { kind: 'charm'; id: 'charm'; cost: number }
  | { kind: 'character'; id: `character:${string}`; refId: string; cost: number }
  | { kind: 'outfit'; id: `outfit:${string}`; refId: string; cost: number }

export const shopItems: readonly ShopItem[] = [
  ...TIMED_POWER_UPS.map((powerUp) => ({ kind: 'upgrade', id: `upgrade:${powerUp}`, powerUp }) as const),
  { kind: 'sankofa', id: 'sankofa', cost: 500 },
  { kind: 'charm', id: 'charm', cost: 300 },
  ...characters
    .filter((character) => character.cost > 0)
    .map(
      (character) =>
        ({
          kind: 'character',
          id: `character:${character.id}`,
          refId: character.id,
          cost: character.cost,
        }) as const,
    ),
  ...outfits.map(
    (outfit) => ({ kind: 'outfit', id: `outfit:${outfit.id}`, refId: outfit.id, cost: outfit.cost }) as const,
  ),
]

export const findShopItem = (id: string): ShopItem | undefined => shopItems.find((item) => item.id === id)
