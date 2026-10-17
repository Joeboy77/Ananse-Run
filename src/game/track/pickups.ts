import type { PowerUpId } from '@/content/powerUps'

export type PickupType = 'powerUp' | 'goldWeight'

export interface Pickup {
  active: boolean
  type: PickupType
  powerUp: PowerUpId
  weightId: string
  x: number
  y: number
  z: number
}

export type PickupChoice = { type: 'powerUp'; powerUp: PowerUpId } | { type: 'goldWeight'; weightId: string }

export const createPickup = (): Pickup => ({
  active: false,
  type: 'powerUp',
  powerUp: 'magnet',
  weightId: '',
  x: 0,
  y: 0,
  z: 0,
})
