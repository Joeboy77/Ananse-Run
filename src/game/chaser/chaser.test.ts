import { describe, expect, it } from 'vitest'
import { tuning } from '@/config/tuning'
import { Chaser } from './chaser'

const run = (chaser: Chaser, seconds: number) => {
  for (let t = 0; t < seconds; t += 1 / 60) chaser.step(1 / 60)
}

describe('chaser', () => {
  it('is visible at the start of a run and drops back after clean running', () => {
    const chaser = new Chaser()
    chaser.reset()
    expect(chaser.visible).toBe(true)
    run(chaser, tuning.chaser.introDuration + 3)
    expect(chaser.visible).toBe(false)
  })

  it('closes in after a stumble', () => {
    const chaser = new Chaser()
    chaser.reset()
    run(chaser, 10)
    chaser.alert(4)
    run(chaser, 2)
    expect(chaser.visible).toBe(true)
    expect(chaser.distance).toBeLessThan(tuning.chaser.followDistance)
  })
})
