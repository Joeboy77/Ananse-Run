import { tuning } from '@/config/tuning'
import { damp } from '@/game/core/math'

const c = tuning.chaser

export class Chaser {
  distance: number = c.followDistance
  timer = 0
  close = false
  caught = false

  reset(): void {
    this.distance = c.followDistance
    this.timer = c.introDuration
    this.close = false
    this.caught = false
  }

  alert(duration: number): void {
    this.timer = Math.max(this.timer, duration)
    this.close = true
  }

  catch(): void {
    this.caught = true
  }

  step(dt: number): void {
    if (this.timer > 0) this.timer = Math.max(0, this.timer - dt)
    if (this.timer === 0) this.close = false
    const target = this.caught
      ? c.caughtDistance
      : this.timer > 0
        ? this.close
          ? c.closeDistance
          : c.followDistance
        : c.hiddenDistance
    this.distance = damp(this.distance, target, c.lambda * (this.caught ? 3 : 1), dt)
  }

  get visible(): boolean {
    return this.distance < c.hiddenDistance - 1
  }
}
