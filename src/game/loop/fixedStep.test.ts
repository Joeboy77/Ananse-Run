import { describe, expect, it } from 'vitest'
import { createFixedStepper } from './fixedStep'

describe('fixed stepper', () => {
  it('runs whole steps and returns the leftover fraction', () => {
    const stepper = createFixedStepper(60, 5)
    let steps = 0
    const alpha = stepper.advance(2.5 / 60, () => steps++)
    expect(steps).toBe(2)
    expect(alpha).toBeCloseTo(0.5)
  })

  it('caps steps after a long frame', () => {
    const stepper = createFixedStepper(60, 5)
    let steps = 0
    stepper.advance(3, () => steps++)
    expect(steps).toBe(5)
  })
})
