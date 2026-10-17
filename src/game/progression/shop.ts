import { tuning } from '@/config/tuning'
import { findShopItem, upgradeCosts } from '@/content/shop'
import type { TimedPowerUpId } from '@/content/powerUps'
import type { Profile } from './profile'

export type PurchaseFailure = 'not-found' | 'insufficient-gold' | 'max-level' | 'owned'

export type PurchaseResult = { ok: true; profile: Profile } | { ok: false; reason: PurchaseFailure }

export const upgradeCost = (level: number): number | null =>
  level < tuning.powerUps.maxLevel ? (upgradeCosts[level] ?? null) : null

export const powerUpDuration = (id: TimedPowerUpId, level: number): number =>
  tuning.powerUps.durations[id] + tuning.powerUps.durationPerLevel[id] * level

export const itemCost = (profile: Profile, itemId: string): number | null => {
  const item = findShopItem(itemId)
  if (!item) return null
  return item.kind === 'upgrade' ? upgradeCost(profile.upgrades[item.powerUp]) : item.cost
}

export const purchase = (profile: Profile, itemId: string): PurchaseResult => {
  const item = findShopItem(itemId)
  if (!item) return { ok: false, reason: 'not-found' }

  if (item.kind === 'character' && profile.unlockedCharacters.includes(item.refId)) {
    return { ok: false, reason: 'owned' }
  }
  if (item.kind === 'outfit' && profile.unlockedOutfits.includes(item.refId)) {
    return { ok: false, reason: 'owned' }
  }

  const cost = itemCost(profile, itemId)
  if (cost === null) return { ok: false, reason: 'max-level' }
  if (profile.gold < cost) return { ok: false, reason: 'insufficient-gold' }

  const next: Profile = { ...profile, gold: profile.gold - cost }
  switch (item.kind) {
    case 'upgrade':
      next.upgrades = { ...profile.upgrades, [item.powerUp]: profile.upgrades[item.powerUp] + 1 }
      break
    case 'sankofa':
      next.sankofaTokens = profile.sankofaTokens + 1
      break
    case 'charm':
      next.shieldCharms = profile.shieldCharms + 1
      break
    case 'character':
      next.unlockedCharacters = [...profile.unlockedCharacters, item.refId]
      break
    case 'outfit':
      next.unlockedOutfits = [...profile.unlockedOutfits, item.refId]
      break
  }
  return { ok: true, profile: next }
}

export const equipCharacter = (profile: Profile, id: string): Profile =>
  profile.unlockedCharacters.includes(id)
    ? { ...profile, equipped: { ...profile.equipped, character: id } }
    : profile

export const equipOutfit = (profile: Profile, id: string | null): Profile =>
  id === null || profile.unlockedOutfits.includes(id)
    ? { ...profile, equipped: { ...profile.equipped, outfit: id } }
    : profile
