import { describe, expect, it } from 'vitest'
import { PowerUpSystem } from './powerUpSystem'

describe('power-up system', () => {
  it('runs a timed power-up for its configured duration', () => {
    const system = new PowerUpSystem()
    system.configure({ webSwing: 6, magnet: 2, drum: 10, springWeb: 8 })
    system.activate('magnet')
    expect(system.isActive('magnet')).toBe(true)
    expect(system.step(1.5)).toEqual([])
    expect(system.step(1)).toEqual(['magnet'])
    expect(system.isActive('magnet')).toBe(false)
  })

  it('refreshes the timer when picked up again', () => {
    const system = new PowerUpSystem()
    system.activate('drum')
    system.step(5)
    system.activate('drum')
    expect(system.remaining.drum).toBe(system.durations.drum)
  })

  it('keeps the shield until used', () => {
    const system = new PowerUpSystem()
    system.activate('shield')
    system.step(100)
    expect(system.isActive('shield')).toBe(true)
  })
})
