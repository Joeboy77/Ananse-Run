import { beforeEach, describe, expect, it } from 'vitest'
import { Player } from './player'
import { tuning } from '@/config/tuning'
import { laneToX } from '@/game/track/lanes'

const dt = 1 / 60

describe('player', () => {
  let player: Player

  beforeEach(() => {
    player = new Player()
    player.reset()
  })

  it('switches lanes within the configured time', () => {
    player.tryAction('left')
    const steps = Math.ceil(tuning.lanes.switchDuration / dt)
    for (let i = 0; i < steps; i++) player.step(dt, 0)
    expect(player.x).toBeCloseTo(laneToX(0))
    expect(player.lane).toBe(0)
  })

  it('stays in the outer lane when pushed further', () => {
    player.tryAction('right')
    player.tryAction('right')
    expect(player.lane).toBe(2)
  })

  it('jumps to the configured height and lands after the configured duration', () => {
    player.tryAction('jump')
    let peak = 0
    let airSteps = 0
    while (!player.grounded || airSteps === 0) {
      player.step(dt, 0)
      peak = Math.max(peak, player.y)
      airSteps++
      if (airSteps > 200) break
    }
    expect(peak).toBeCloseTo(tuning.jump.height, 1)
    expect(airSteps * dt).toBeCloseTo(tuning.jump.duration, 1)
  })

  it('cannot jump while airborne', () => {
    player.tryAction('jump')
    player.step(dt, 0)
    expect(player.tryAction('jump')).toBe(false)
  })

  it('slides with a lower height and recovers', () => {
    player.tryAction('slide')
    expect(player.height).toBe(tuning.slide.height)
    for (let i = 0; i < Math.ceil(tuning.slide.duration / dt) + 1; i++) player.step(dt, 0)
    expect(player.height).toBe(tuning.player.height)
  })

  it('drops fast and slides on landing when sliding in the air', () => {
    player.tryAction('jump')
    for (let i = 0; i < 10; i++) player.step(dt, 0)
    player.tryAction('slide')
    let steps = 0
    while (!player.grounded && steps < 100) {
      player.step(dt, 0)
      steps++
    }
    expect(steps * dt).toBeLessThan(tuning.jump.duration / 2)
    expect(player.sliding).toBe(true)
  })

  it('falls when support disappears', () => {
    player.step(dt, 0)
    player.y = 1.8
    player.step(dt, 1.8)
    player.step(dt, 0)
    expect(player.grounded).toBe(false)
  })
})
