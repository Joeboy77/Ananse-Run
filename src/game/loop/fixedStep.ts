export interface FixedStepper {
  readonly step: number
  advance(frameDelta: number, update: (step: number) => void): number
  reset(): void
}

export const createFixedStepper = (stepHz: number, maxStepsPerFrame: number): FixedStepper => {
  const step = 1 / stepHz
  let accumulator = 0
  return {
    step,
    advance(frameDelta, update) {
      accumulator = Math.min(accumulator + frameDelta, step * maxStepsPerFrame)
      while (accumulator >= step) {
        update(step)
        accumulator -= step
      }
      return accumulator / step
    },
    reset() {
      accumulator = 0
    },
  }
}
