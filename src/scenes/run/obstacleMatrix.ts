import type { Matrix4 } from 'three'
import { Quaternion, Vector3 } from 'three'
import { obstacleWidth, type Obstacle } from '@/game/obstacles/types'

const position = new Vector3()
const scale = new Vector3()
const facing = new Quaternion()
const reversed = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI)

export const composeObstacleMatrix = (obstacle: Obstacle, lag: number, out: Matrix4): Matrix4 => {
  const height = obstacle.top - obstacle.bottom
  position.set(obstacle.x, obstacle.bottom + height / 2, obstacle.z - lag)
  scale.set(obstacleWidth(obstacle), height, obstacle.depth)
  return out.compose(position, obstacle.vx < 0 ? reversed : facing, scale)
}
