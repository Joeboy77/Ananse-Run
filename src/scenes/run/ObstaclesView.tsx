import { useLayoutEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Matrix4, Quaternion, Vector3, type InstancedMesh } from 'three'
import { tuning } from '@/config/tuning'
import type { ObstacleKind } from '@/game/obstacles/types'
import { game } from '@/game/runtime'

const kinds: readonly ObstacleKind[] = ['low', 'high', 'full', 'platform']

const colors: Record<ObstacleKind, string> = {
  low: '#d9482b',
  high: '#2e7fb8',
  full: '#3d3a55',
  platform: '#4f8f3a',
}

const matrix = new Matrix4()
const position = new Vector3()
const scale = new Vector3()
const rotation = new Quaternion()

export function ObstaclesView() {
  const meshes = useRef<Partial<Record<ObstacleKind, InstancedMesh>>>({})

  useLayoutEffect(() => {
    for (const mesh of Object.values(meshes.current)) mesh.frustumCulled = false
  }, [])

  useFrame(() => {
    const lag = game.renderLag()
    const counts: Record<ObstacleKind, number> = { low: 0, high: 0, full: 0, platform: 0 }

    for (const obstacle of game.sim.track.obstacles.items) {
      if (!obstacle.active) continue
      const mesh = meshes.current[obstacle.kind]
      if (!mesh) continue
      const height = obstacle.top - obstacle.bottom
      position.set(obstacle.x, obstacle.bottom + height / 2, obstacle.z - lag)
      scale.set(tuning.obstacles.width, height, obstacle.depth)
      matrix.compose(position, rotation, scale)
      mesh.setMatrixAt(counts[obstacle.kind]++, matrix)
    }

    for (const kind of kinds) {
      const mesh = meshes.current[kind]
      if (!mesh) continue
      mesh.count = counts[kind]
      mesh.instanceMatrix.needsUpdate = true
    }
  })

  return (
    <>
      {kinds.map((kind) => (
        <instancedMesh
          key={kind}
          ref={(mesh) => {
            if (mesh) meshes.current[kind] = mesh
          }}
          args={[undefined, undefined, tuning.pools.obstacles]}
        >
          <boxGeometry />
          <meshLambertMaterial color={colors[kind]} />
        </instancedMesh>
      ))}
    </>
  )
}
