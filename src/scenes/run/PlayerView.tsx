import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group, Mesh } from 'three'
import { tuning } from '@/config/tuning'
import { damp, lerp } from '@/game/core/math'
import { game } from '@/game/runtime'

const { height, radius } = tuning.player

export function PlayerView() {
  const body = useRef<Group>(null)
  const shadow = useRef<Mesh>(null)

  useFrame((_, delta) => {
    const group = body.current
    const blob = shadow.current
    if (!group || !blob) return
    const { player, phase } = game.sim
    const alpha = game.alpha
    const x = lerp(player.prevX, player.x, alpha)
    const y = lerp(player.prevY, player.y, alpha)
    const targetScale = player.height / height

    group.position.set(x, y, 0)
    group.scale.y = damp(group.scale.y, targetScale, 30, delta)
    group.scale.x = group.scale.z = damp(group.scale.x, 1 / Math.sqrt(targetScale), 30, delta)
    group.rotation.x = damp(
      group.rotation.x,
      phase === 'crashed' || phase === 'gameover' ? -1.2 : 0,
      8,
      delta,
    )

    const lift = Math.max(0, y - player.support)
    const shadowScale = Math.max(0.35, 1 - lift * 0.25)
    blob.position.set(x, player.support + 0.02, 0)
    blob.scale.setScalar(shadowScale)
  })

  return (
    <>
      <group ref={body}>
        <mesh position-y={height / 2}>
          <capsuleGeometry args={[radius, height - radius * 2, 6, 12]} />
          <meshLambertMaterial color="#f2b705" />
        </mesh>
        <mesh position={[0, height * 0.78, -radius * 0.8]}>
          <boxGeometry args={[0.36, 0.12, 0.1]} />
          <meshBasicMaterial color="#1b1209" />
        </mesh>
      </group>
      <mesh ref={shadow} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.55, 20]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.28} depthWrite={false} />
      </mesh>
    </>
  )
}
