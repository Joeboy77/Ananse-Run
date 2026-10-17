export type QualityTier = 'low' | 'high'

export const graphics = {
  maxPixelRatio: { low: 1, high: 2 },
  clearColor: '#f6c27a',
  fog: { color: '#f6c27a', near: 40, far: 190 },
  character: {
    facingY: Math.PI,
    crossFade: 0.12,
    runTimeScaleMax: 1.7,
    toonSteps: [0.45, 0.75, 1],
    stumbleClipTime: 0.5,
    armsTuckedScale: 0.85,
    armsReachAngle: -1.1,
    armsLambda: 8,
  },
} as const
