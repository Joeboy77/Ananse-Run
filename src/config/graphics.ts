export type QualityTier = 'low' | 'high'

export const graphics = {
  maxPixelRatio: { low: 1, high: 2 },
  clearColor: '#f6c27a',
  fog: { color: '#f6c27a', near: 30, far: 140 },
} as const
