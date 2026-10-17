import { useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type { PerspectiveCamera } from 'three'
import { FollowCamera } from '@/game/camera/followCamera'
import { lerp } from '@/game/core/math'
import { game } from '@/game/runtime'

const target = { x: 0, y: 0, speed: 0 }

export function CameraRig() {
  const camera = useThree((state) => state.camera) as PerspectiveCamera
  const follow = useMemo(() => new FollowCamera(), [])

  useEffect(() => {
    const { player, speed } = game.sim
    follow.snap({ x: player.x, y: player.y, speed })
  }, [follow])

  useFrame((_, delta) => {
    const { player, speed } = game.sim
    target.x = lerp(player.prevX, player.x, game.alpha)
    target.y = lerp(player.prevY, player.y, game.alpha)
    target.speed = speed
    follow.update(camera, target, Math.min(delta, 0.1))
  })

  return null
}
