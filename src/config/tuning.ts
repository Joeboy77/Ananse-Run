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
  },
  jump: {
    height: 2.6,
    duration: 0.6,
  },
  slide: {
    duration: 0.6,
  },
  input: {
    bufferMs: 150,
    swipeMinDistancePx: 30,
  },
  simulation: {
    stepHz: 60,
    maxStepsPerFrame: 5,
  },
  track: {
    chunkLength: 40,
    chunksAlive: 5,
  },
  gold: {
    valuePerPickup: 1,
  },
  player: {
    height: 1.8,
    radius: 0.4,
  },
} as const

export type Tuning = typeof tuning
