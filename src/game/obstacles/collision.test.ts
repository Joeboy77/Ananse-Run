import { describe, expect, it } from 'vitest'
import { classifyHit, overlaps } from './collision'

const all = { x: true, y: true, z: true }

describe('collision', () => {
  it('detects range overlap', () => {
    expect(overlaps({ min: 0, max: 1 }, { min: 0.5, max: 2 })).toBe(true)
    expect(overlaps({ min: 0, max: 1 }, { min: 1, max: 2 })).toBe(false)
  })

  it('treats running into an obstacle as a front hit', () => {
    expect(classifyHit(all, { x: true, y: true, z: false })).toBe('front')
  })

  it('treats switching into the side of an obstacle as a side clip', () => {
    expect(classifyHit(all, { x: false, y: true, z: true })).toBe('side')
  })

  it('treats a vertical bump as a side clip', () => {
    expect(classifyHit(all, { x: true, y: false, z: true })).toBe('side')
  })

  it('reports no hit without full overlap', () => {
    expect(classifyHit({ x: true, y: false, z: true }, all)).toBe('none')
  })
})
