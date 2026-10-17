import { describe, expect, it } from 'vitest'
import { clampLane, LANES, laneToX } from './lanes'
import { tuning } from '@/config/tuning'

describe('lanes', () => {
  it('places three lanes centred on x = 0', () => {
    expect(LANES.map(laneToX)).toEqual([-tuning.lanes.width, 0, tuning.lanes.width])
  })

  it('clamps out-of-range lanes', () => {
    expect(clampLane(-1)).toBe(0)
    expect(clampLane(3)).toBe(2)
    expect(clampLane(1)).toBe(1)
  })
})
