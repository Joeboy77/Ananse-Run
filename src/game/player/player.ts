import { tuning } from '@/config/tuning'
import { clampLane, laneToX, type LaneIndex } from '@/game/track/lanes'
import { easeOutCubic, lerp } from '@/game/core/math'
import type { PlayerAction } from './actions'

const { height: jumpHeight, duration: jumpDuration, fastDropSpeed } = tuning.jump
const gravity = (8 * jumpHeight) / jumpDuration ** 2
const jumpVelocity = (4 * jumpHeight) / jumpDuration
const groundSnap = 0.001

export class Player {
  lane: LaneIndex = 1
  previousLane: LaneIndex = 1
  x = 0
  y = 0
  vy = 0
  grounded = true
  sliding = false
  prevX = 0
  prevY = 0
  prevHeight: number = tuning.player.height
  support = 0

  private switchFrom = 0
  private switchProgress = 1
  private slideTimer = 0
  private slideOnLand = false

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
    this.prevX = this.x
    this.prevY = 0
    this.prevHeight = tuning.player.height
    this.support = 0
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
      case 'jump':
        if (!this.grounded) return false
        this.sliding = false
        this.slideTimer = 0
        this.vy = jumpVelocity
        this.grounded = false
        return true
      case 'slide':
        if (this.grounded) this.startSlide()
        else {
          this.vy = Math.min(this.vy, -fastDropSpeed)
          this.slideOnLand = true
        }
        return true
    }
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

    if (this.grounded && support < this.y - groundSnap) this.grounded = false

    if (this.grounded) {
      this.y = support
    } else {
      this.y += this.vy * dt - 0.5 * gravity * dt * dt
      this.vy -= gravity * dt
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
