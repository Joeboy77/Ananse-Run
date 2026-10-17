export const tuning = {
  lanes: {
    count: 3,
    width: 2.5,
    switchDuration: 0.12,
  },
  speed: {
    start: 12,
    max: 32,
    rampAmount: 0.6,
    rampInterval: 10,
    easeBand: 4,
  },
  jump: {
    height: 2.6,
    duration: 0.6,
    fastDropSpeed: 30,
  },
  slide: {
    duration: 0.6,
    height: 0.9,
  },
  player: {
    height: 1.8,
    radius: 0.4,
    halfWidth: 0.35,
    halfDepth: 0.35,
  },
  input: {
    bufferMs: 150,
    swipeMinDistancePx: 30,
  },
  simulation: {
    stepHz: 60,
    maxStepsPerFrame: 5,
  },
  stumble: {
    window: 4,
  },
  crash: {
    gameOverDelay: 0.8,
  },
  score: {
    perUnit: 1,
  },
  track: {
    chunkLength: 40,
    chunksAlive: 5,
    despawnBehind: 14,
    edgeMargin: 4,
  },
  difficulty: {
    secondsPerLevel: 30,
    maxLevel: 3,
  },
  obstacles: {
    width: 2,
    low: { height: 1, depth: 1.2 },
    high: { bottom: 1.2, top: 2.6, depth: 0.5 },
    full: { height: 3.2 },
    platform: { height: 1.8 },
  },
  gold: {
    valuePerPickup: 1,
    spacing: 2,
    baseHeight: 0.9,
    arcHeight: 2.2,
    pickupHalfSize: 0.9,
  },
  pools: {
    obstacles: 96,
    gold: 384,
  },
  camera: {
    height: 3.2,
    distance: 6.4,
    lookAhead: 10,
    lookHeight: 1.2,
    followX: 0.75,
    followYFactor: 0.45,
    lambdaX: 10,
    lambdaY: 6,
    fovMin: 62,
    fovMax: 74,
    tiltPerUnitSpeed: 0.006,
    tiltLambda: 10,
    shakeDecay: 1.6,
    shakeMagnitude: 0.45,
    stumbleTrauma: 0.35,
    crashTrauma: 0.7,
  },
} as const

export type Tuning = typeof tuning
