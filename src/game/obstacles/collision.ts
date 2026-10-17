export interface Range {
  min: number
  max: number
}

export const overlaps = (a: Range, b: Range): boolean => a.min < b.max && a.max > b.min

export interface AxisOverlap {
  x: boolean
  y: boolean
  z: boolean
}

export type HitKind = 'none' | 'front' | 'side'

export const classifyHit = (now: AxisOverlap, before: AxisOverlap): HitKind => {
  if (!(now.x && now.y && now.z)) return 'none'
  if (before.z && before.y && !before.x) return 'side'
  if (before.z && before.x && !before.y) return 'side'
  return 'front'
}
