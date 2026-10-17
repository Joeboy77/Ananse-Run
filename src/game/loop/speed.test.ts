import { describe, expect, it } from 'vitest'
import { speedAt } from './speed'
import { tuning } from '@/config/tuning'

describe('speed curve', () => {
  it('starts at the start speed', () => {
    expect(speedAt(0)).toBe(tuning.speed.start)
  })

  it('ramps by the configured amount per interval', () => {
    expect(speedAt(tuning.speed.rampInterval)).toBeCloseTo(tuning.speed.start + tuning.speed.rampAmount)
  })

  it('never exceeds the max and keeps rising', () => {
    let previous = 0
    for (let t = 0; t < 1200; t += 5) {
      const speed = speedAt(t)
      expect(speed).toBeLessThanOrEqual(tuning.speed.max)
      expect(speed).toBeGreaterThanOrEqual(previous)
      previous = speed
    }
  })
})
