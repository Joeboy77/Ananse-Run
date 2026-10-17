import { tuning } from '@/config/tuning'

export const cameraFx = {
  trauma: 0,
  add(amount: number) {
    this.trauma = Math.min(1, this.trauma + amount)
  },
  decay(dt: number) {
    this.trauma = Math.max(0, this.trauma - tuning.camera.shakeDecay * dt)
  },
  reset() {
    this.trauma = 0
  },
}
