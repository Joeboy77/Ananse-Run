export type TimedPowerUpId = 'webSwing' | 'magnet' | 'drum' | 'springWeb'
export type PowerUpId = TimedPowerUpId | 'shield'

export const TIMED_POWER_UPS: readonly TimedPowerUpId[] = ['webSwing', 'magnet', 'drum', 'springWeb']
export const POWER_UPS: readonly PowerUpId[] = [...TIMED_POWER_UPS, 'shield']

export interface PowerUpInfo {
  name: string
  short: string
  effect: string
  color: string
}

export const powerUpInfo: Record<PowerUpId, PowerUpInfo> = {
  webSwing: {
    name: 'Web Swing',
    short: 'Swing',
    effect: 'Swing above the lanes, untouchable',
    color: '#e8e2d0',
  },
  shield: { name: 'Gye Nyame Shield', short: 'Shield', effect: 'Absorbs one crash', color: '#4fb3ff' },
  magnet: {
    name: 'Kente Magnet',
    short: 'Magnet',
    effect: 'Pulls in gold from every lane',
    color: '#e0412f',
  },
  drum: { name: 'Talking Drum', short: 'Drum', effect: 'Doubles score and gold', color: '#9b5de5' },
  springWeb: { name: 'Spring Web', short: 'Spring', effect: 'Super jumps', color: '#3ccf6e' },
}
