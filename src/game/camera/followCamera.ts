import type { PerspectiveCamera } from 'three'
import { tuning } from '@/config/tuning'
import { clamp, damp } from '@/game/core/math'
import { cameraFx } from './cameraFx'

const c = tuning.camera
const speedRange = tuning.speed.max - tuning.speed.start

export interface FollowTarget {
  x: number
  y: number
  speed: number
}

export class FollowCamera {
  private x = 0
  private y: number = c.height
  private roll = 0
  private lastTargetX = 0

  snap(target: FollowTarget): void {
    this.x = target.x * c.followX
    this.y = c.height + target.y * c.followYFactor
    this.roll = 0
    this.lastTargetX = target.x
  }

  update(camera: PerspectiveCamera, target: FollowTarget, dt: number): void {
    if (dt <= 0) return
    this.x = damp(this.x, target.x * c.followX, c.lambdaX, dt)
    this.y = damp(this.y, c.height + target.y * c.followYFactor, c.lambdaY, dt)

    const lateralSpeed = (target.x - this.lastTargetX) / dt
    this.lastTargetX = target.x
    this.roll = damp(this.roll, -lateralSpeed * c.tiltPerUnitSpeed, c.tiltLambda, dt)

    cameraFx.decay(dt)
    const shake = cameraFx.trauma ** 2 * c.shakeMagnitude
    const shakeX = (Math.random() * 2 - 1) * shake
    const shakeY = (Math.random() * 2 - 1) * shake

    camera.position.set(this.x + shakeX, this.y + shakeY, c.distance)
    camera.lookAt(this.x * 0.6, c.lookHeight + target.y * c.followYFactor, -c.lookAhead)
    camera.rotateZ(this.roll)

    const speedT = clamp((target.speed - tuning.speed.start) / speedRange, 0, 1)
    const fov = c.fovMin + (c.fovMax - c.fovMin) * speedT
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = fov
      camera.updateProjectionMatrix()
    }
  }
}
