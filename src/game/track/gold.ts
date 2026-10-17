export interface Gold {
  active: boolean
  lane: number
  x: number
  y: number
  z: number
}

export const createGold = (): Gold => ({ active: false, lane: 1, x: 0, y: 0, z: 0 })
