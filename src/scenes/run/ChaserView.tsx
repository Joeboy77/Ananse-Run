import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { tuning } from '@/config/tuning'
import { damp } from '@/game/core/math'
import { game } from '@/game/runtime'

export function ChaserView() {
  const body = useRef<Group>(null)

  useFrame(({ clock }, delta) => {
    const group = body.current
    if (!group) return
    const { chaser, player } = game.sim
    group.visible = chaser.visible
    if (!group.visible) return
    const side = player.x > 0 ? -1 : 1
    group.position.x = damp(group.position.x, player.x + side * tuning.chaser.sideOffset, 6, delta)
    group.position.z = chaser.distance
    group.position.y = Math.abs(Math.sin(clock.elapsedTime * 10)) * 0.25
  })

  return (
    <group ref={body} position-z={10}>
      <mesh position={[0, 0.4, 0.3]}>
        <boxGeometry args={[0.55, 0.42, 1.3]} />
        <meshLambertMaterial color="#d98e04" />
      </mesh>
      <mesh position={[0, 0.6, -0.5]}>
        <boxGeometry args={[0.4, 0.36, 0.4]} />
        <meshLambertMaterial color="#c47c00" />
      </mesh>
      <mesh position={[0, 0.65, 1.05]} rotation-x={0.6}>
        <boxGeometry args={[0.1, 0.1, 0.7]} />
        <meshLambertMaterial color="#c47c00" />
      </mesh>
    </group>
  )
}
