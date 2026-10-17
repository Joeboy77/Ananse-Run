import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BoxGeometry, Matrix4, type BufferGeometry, type InstancedMesh } from 'three'
import { tuning } from '@/config/tuning'
import type { ObstacleVisual } from '@/game/obstacles/types'
import { game } from '@/game/runtime'
import { createWedgeGeometry } from './geometries'
import { composeObstacleMatrix } from './obstacleMatrix'
import { readyVisuals } from './props/readyVisuals'

const visuals: readonly ObstacleVisual[] = ['low', 'high', 'full', 'platform', 'ramp', 'trotro', 'okada']

const colors: Record<ObstacleVisual, string> = {
  low: '#d9482b',
  high: '#2e7fb8',
  full: '#3d3a55',
  platform: '#4f8f3a',
  ramp: '#6aa84f',
  trotro: '#f2a516',
  okada: '#8e3fb5',
}

const matrix = new Matrix4()
const counts = Object.fromEntries(visuals.map((visual) => [visual, 0])) as Record<ObstacleVisual, number>

export function ObstaclesView() {
  const meshes = useRef<Partial<Record<ObstacleVisual, InstancedMesh>>>({})
  const geometries = useMemo(() => {
    const box = new BoxGeometry()
    const wedge = createWedgeGeometry()
    const result = {} as Record<ObstacleVisual, BufferGeometry>
    for (const visual of visuals) result[visual] = visual === 'ramp' ? wedge : box
    return result
  }, [])

  useLayoutEffect(() => {
    for (const mesh of Object.values(meshes.current)) mesh.frustumCulled = false
  }, [])

  useFrame(() => {
    const lag = game.renderLag()
    for (const visual of visuals) counts[visual] = 0

    for (const obstacle of game.sim.track.obstacles.items) {
      if (!obstacle.active || readyVisuals.has(obstacle.visual)) continue
      const mesh = meshes.current[obstacle.visual]
      if (!mesh) continue
      composeObstacleMatrix(obstacle, lag, matrix)
      mesh.setMatrixAt(counts[obstacle.visual]++, matrix)
    }

    for (const visual of visuals) {
      const mesh = meshes.current[visual]
      if (!mesh) continue
      mesh.count = counts[visual]
      mesh.instanceMatrix.needsUpdate = true
    }
  })

  return (
    <>
      {visuals.map((visual) => (
        <instancedMesh
          key={visual}
          ref={(mesh) => {
            if (mesh) meshes.current[visual] = mesh
          }}
          args={[geometries[visual], undefined, tuning.pools.obstacles]}
        >
          <meshLambertMaterial color={colors[visual]} />
        </instancedMesh>
      ))}
    </>
  )
}
