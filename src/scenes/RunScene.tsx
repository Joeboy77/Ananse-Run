import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh } from 'three'
import { tuning } from '@/config/tuning'
import { LANES, laneToX } from '@/game/track/lanes'

const TRACK_LENGTH = tuning.track.chunkLength * tuning.track.chunksAlive
const TRACK_WIDTH = tuning.lanes.width * tuning.lanes.count
const { height, radius } = tuning.player

export function RunScene() {
  const player = useRef<Mesh>(null)

  useFrame(({ clock }) => {
    const mesh = player.current
    if (!mesh) return
    mesh.position.y = height / 2 + Math.abs(Math.sin(clock.elapsedTime * 6)) * 0.15
  })

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, -TRACK_LENGTH / 2 + 10]}>
        <planeGeometry args={[TRACK_WIDTH + 6, TRACK_LENGTH]} />
        <meshLambertMaterial color="#b9773d" />
      </mesh>

      {LANES.map((lane) => (
        <mesh key={lane} rotation-x={-Math.PI / 2} position={[laneToX(lane), 0.01, -TRACK_LENGTH / 2 + 10]}>
          <planeGeometry args={[tuning.lanes.width - 0.2, TRACK_LENGTH]} />
          <meshLambertMaterial color={lane === 1 ? '#a8692f' : '#c08446'} />
        </mesh>
      ))}

      <mesh ref={player} position={[0, height / 2, 0]}>
        <capsuleGeometry args={[radius, height - radius * 2, 6, 12]} />
        <meshLambertMaterial color="#f2b705" />
      </mesh>
    </group>
  )
}
