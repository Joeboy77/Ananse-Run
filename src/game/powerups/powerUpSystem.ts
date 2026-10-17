import { TIMED_POWER_UPS, type PowerUpId, type TimedPowerUpId } from '@/content/powerUps'
import { tuning } from '@/config/tuning'

export type PowerUpTimes = Record<TimedPowerUpId, number>

export const baseDurations = (): PowerUpTimes => ({ ...tuning.powerUps.durations })

const zeroTimes = (): PowerUpTimes => ({ webSwing: 0, magnet: 0, drum: 0, springWeb: 0 })

export class PowerUpSystem {
  readonly durations: PowerUpTimes = baseDurations()
  readonly remaining: PowerUpTimes = zeroTimes()
  shield = false
  private readonly ended: TimedPowerUpId[] = []

  configure(durations: PowerUpTimes): void {
    Object.assign(this.durations, durations)
  }

  reset(): void {
    Object.assign(this.remaining, zeroTimes())
    this.shield = false
  }

  activate(id: PowerUpId): void {
    if (id === 'shield') this.shield = true
    else this.remaining[id] = this.durations[id]
  }

  isActive(id: PowerUpId): boolean {
    return id === 'shield' ? this.shield : this.remaining[id] > 0
  }

  step(dt: number): readonly TimedPowerUpId[] {
    this.ended.length = 0
    for (const id of TIMED_POWER_UPS) {
      if (this.remaining[id] <= 0) continue
      this.remaining[id] = Math.max(0, this.remaining[id] - dt)
      if (this.remaining[id] === 0) this.ended.push(id)
    }
    return this.ended
  }

  copyFrom(other: PowerUpSystem): void {
    Object.assign(this.remaining, other.remaining)
    Object.assign(this.durations, other.durations)
    this.shield = other.shield
  }
}
