import { tuning } from '@/config/tuning'
import { clampLane, laneToX, type LaneIndex } from '@/game/track/lanes'
import { damp, easeOutCubic, lerp } from '@/game/core/math'
import type { PlayerAction } from './actions'

const jumpPhysics = (height: number, duration: number) => ({
  velocity: (4 * height) / duration,
  gravity: (8 * height) / duration ** 2,
})

const normalJump = jumpPhysics(tuning.jump.height, tuning.jump.duration)
const springJump = jumpPhysics(tuning.powerUps.springJumpHeight, tuning.powerUps.springJumpDuration)
const groundSnap = 0.001

export class Player {
  lane: LaneIndex = 1
  previousLane: LaneIndex = 1
  x = 0
  y = 0
  vy = 0
  grounded = true
  sliding = false
  flying = false
  spring = false
  prevX = 0
  prevY = 0
  prevHeight: number = tuning.player.height
  support = 0
  gravity = normalJump.gravity
  switchFrom = 0
  switchProgress = 1
  slideTimer = 0
  slideOnLand = false

  get height(): number {
    return this.sliding ? tuning.slide.height : tuning.player.height
  }

  get switching(): boolean {
    return this.switchProgress < 1
  }

  reset(): void {
    this.lane = 1
    this.previousLane = 1
    this.x = laneToX(1)
    this.y = 0
    this.vy = 0
    this.grounded = true
    this.sliding = false
    this.flying = false
    this.spring = false
    this.prevX = this.x
    this.prevY = 0
    this.prevHeight = tuning.player.height
    this.support = 0
    this.gravity = normalJump.gravity
    this.switchFrom = this.x
    this.switchProgress = 1
    this.slideTimer = 0
    this.slideOnLand = false
  }

  tryAction(action: PlayerAction): boolean {
    switch (action) {
      case 'left':
        this.moveToLane(this.lane - 1)
        return true
      case 'right':
        this.moveToLane(this.lane + 1)
        return true
      case 'jump': {
        if (this.flying) return true
        if (!this.grounded) return false
        const physics = this.spring ? springJump : normalJump
        this.sliding = false
        this.slideTimer = 0
        this.vy = physics.velocity
        this.gravity = physics.gravity
        this.grounded = false
        return true
      }
      case 'slide':
        if (this.flying) return true
        if (this.grounded) this.startSlide()
        else {
          this.vy = Math.min(this.vy, -tuning.jump.fastDropSpeed)
          this.slideOnLand = true
        }
        return true
    }
  }

  setFlying(flying: boolean): void {
    this.flying = flying
    this.sliding = false
    this.slideOnLand = false
    this.vy = 0
    this.gravity = normalJump.gravity
    if (flying) this.grounded = false
  }

  bounceBack(): void {
    this.moveToLane(this.previousLane)
  }

  step(dt: number, support: number): void {
    this.prevX = this.x
    this.prevY = this.y
    this.prevHeight = this.height
    this.support = support

    if (this.switchProgress < 1) {
      this.switchProgress = Math.min(1, this.switchProgress + dt / tuning.lanes.switchDuration)
      this.x = lerp(this.switchFrom, laneToX(this.lane), easeOutCubic(this.switchProgress))
    }

    if (this.flying) {
      this.y = damp(this.y, tuning.powerUps.swingHeight, tuning.powerUps.swingLambda, dt)
      return
    }

    if (this.grounded && support < this.y - groundSnap) {
      this.grounded = false
      this.vy = 0
      this.gravity = normalJump.gravity
    }

    if (this.grounded) {
      this.y = support
    } else {
      this.y += this.vy * dt - 0.5 * this.gravity * dt * dt
      this.vy -= this.gravity * dt
      if (this.y <= support) this.land(support)
    }

    if (this.sliding) {
      this.slideTimer -= dt
      if (this.slideTimer <= 0) this.sliding = false
    }
  }

  private land(support: number): void {
    this.y = support
    this.vy = 0
    this.grounded = true
    this.gravity = normalJump.gravity
    if (this.slideOnLand) {
      this.slideOnLand = false
      this.startSlide()
    }
  }

  private startSlide(): void {
    this.sliding = true
    this.slideTimer = tuning.slide.duration
  }

  private moveToLane(target: number): void {
    const lane = clampLane(target)
    if (lane === this.lane) return
    this.previousLane = this.lane
    this.lane = lane
    this.switchFrom = this.x
    this.switchProgress = 0
  }
}
