import { useLayoutEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, Euler, Matrix4, Quaternion, Vector3, type InstancedMesh } from 'three'
import { tuning } from '@/config/tuning'
import { POWER_UPS, powerUpInfo, type PowerUpId } from '@/content/powerUps'
import { game } from '@/game/runtime'

const matrix = new Matrix4()
const position = new Vector3()
const scale = new Vector3(1, 1, 1)
const rotation = new Quaternion()
const euler = new Euler()
const powerUpColors = Object.fromEntries(
  POWER_UPS.map((id) => [id, new Color(powerUpInfo[id].color)]),
) as Record<PowerUpId, Color>

export function PickupsView() {
  const powerUps = useRef<InstancedMesh>(null)
  const weights = useRef<InstancedMesh>(null)

  useLayoutEffect(() => {
    for (const mesh of [powerUps.current, weights.current]) {
      if (!mesh) continue
      mesh.frustumCulled = false
      for (let i = 0; i < mesh.count; i++) mesh.setColorAt(i, powerUpColors.magnet)
    }
  }, [])

  useFrame(({ clock }) => {
    const powerUpMesh = powerUps.current
    const weightMesh = weights.current
    if (!powerUpMesh || !weightMesh) return
    const lag = game.renderLag()
    const t = clock.elapsedTime
    euler.set(0.4, t * 2, 0)
    rotation.setFromEuler(euler)

    let p = 0
    let w = 0
    for (const pickup of game.sim.track.pickups.items) {
      if (!pickup.active) continue
      position.set(pickup.x, pickup.y + Math.sin(t * 3 + pickup.z) * 0.12, pickup.z - lag)
      matrix.compose(position, rotation, scale)
      if (pickup.type === 'powerUp') {
        powerUpMesh.setMatrixAt(p, matrix)
        powerUpMesh.setColorAt(p++, powerUpColors[pickup.powerUp])
      } else {
        weightMesh.setMatrixAt(w++, matrix)
      }
    }
    powerUpMesh.count = p
    weightMesh.count = w
    powerUpMesh.instanceMatrix.needsUpdate = true
    if (powerUpMesh.instanceColor) powerUpMesh.instanceColor.needsUpdate = true
    weightMesh.instanceMatrix.needsUpdate = true
  })

  return (
    <>
      <instancedMesh ref={powerUps} args={[undefined, undefined, tuning.pools.pickups]}>
        <icosahedronGeometry args={[0.55, 0]} />
        <meshLambertMaterial emissive="#ffffff" emissiveIntensity={0.25} />
      </instancedMesh>
      <instancedMesh ref={weights} args={[undefined, undefined, tuning.pools.pickups]}>
        <coneGeometry args={[0.45, 0.9, 5]} />
        <meshLambertMaterial color="#b8860b" emissive="#5a3d00" emissiveIntensity={0.5} />
      </instancedMesh>
    </>
  )
}
