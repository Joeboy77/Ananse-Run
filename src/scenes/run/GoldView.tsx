import { useLayoutEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Euler, Matrix4, Quaternion, Vector3, type InstancedMesh } from 'three'
import { tuning } from '@/config/tuning'
import { game } from '@/game/runtime'

const matrix = new Matrix4()
const position = new Vector3()
const scale = new Vector3(1, 1, 1)
const rotation = new Quaternion()
const euler = new Euler()

export function GoldView() {
  const mesh = useRef<InstancedMesh>(null)

  useLayoutEffect(() => {
    if (mesh.current) mesh.current.frustumCulled = false
  }, [])

  useFrame(({ clock }) => {
    const instanced = mesh.current
    if (!instanced) return
    const lag = game.renderLag()
    euler.set(0, clock.elapsedTime * 3, 0)
    rotation.setFromEuler(euler)

    let count = 0
    for (const gold of game.sim.track.gold.items) {
      if (!gold.active) continue
      position.set(gold.x, gold.y, gold.z - lag)
      matrix.compose(position, rotation, scale)
      instanced.setMatrixAt(count++, matrix)
    }
    instanced.count = count
    instanced.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, tuning.pools.gold]}>
      <octahedronGeometry args={[0.32, 0]} />
      <meshLambertMaterial color="#ffc61a" emissive="#b07a00" emissiveIntensity={0.6} />
    </instancedMesh>
  )
}
