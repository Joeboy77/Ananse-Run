import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { Matrix4, type InstancedMesh } from 'three'
import { tuning } from '@/config/tuning'
import { availableProps } from '@/game/assets'
import type { ObstacleVisual } from '@/game/obstacles/types'
import { game } from '@/game/runtime'
import { composeObstacleMatrix } from '../obstacleMatrix'
import { buildPropModel } from './propModel'
import { readyVisuals } from './readyVisuals'

const entries = availableProps()
const urls = entries.map((entry) => entry.model)
const matrix = new Matrix4()

export const hasProps = entries.length > 0

export function PropsView() {
  const gltfs = useGLTF(urls, false, true)
  const models = useMemo(
    () =>
      entries.map((entry, index) => ({
        visual: entry.visual,
        parts: buildPropModel(gltfs[index]!.scene, entry.rotationY ?? 0),
      })),
    [gltfs],
  )
  const byVisual = useMemo(() => {
    const map = new Map<ObstacleVisual, number[]>()
    models.forEach((model, index) => map.set(model.visual, [...(map.get(model.visual) ?? []), index]))
    return map
  }, [models])
  const meshes = useRef<InstancedMesh[][]>([])
  const counts = useMemo(() => models.map(() => 0), [models])

  useLayoutEffect(() => {
    const visuals = [...byVisual.keys()]
    for (const visual of visuals) readyVisuals.add(visual)
    return () => {
      for (const visual of visuals) readyVisuals.delete(visual)
    }
  }, [byVisual])

  useFrame(() => {
    const lag = game.renderLag()
    counts.fill(0)
    for (const obstacle of game.sim.track.obstacles.items) {
      if (!obstacle.active) continue
      const options = byVisual.get(obstacle.visual)
      if (!options) continue
      const modelIndex = options[obstacle.variant % options.length]!
      composeObstacleMatrix(obstacle, lag, matrix)
      const slot = counts[modelIndex]!
      for (const mesh of meshes.current[modelIndex] ?? []) mesh.setMatrixAt(slot, matrix)
      counts[modelIndex] = slot + 1
    }
    models.forEach((_, modelIndex) => {
      for (const mesh of meshes.current[modelIndex] ?? []) {
        mesh.count = counts[modelIndex]!
        mesh.instanceMatrix.needsUpdate = true
      }
    })
  })

  return (
    <>
      {models.map((model, modelIndex) =>
        model.parts.map((part, partIndex) => (
          <instancedMesh
            key={`${modelIndex}-${partIndex}`}
            ref={(mesh) => {
              if (!mesh) return
              mesh.frustumCulled = false
              const list = (meshes.current[modelIndex] ??= [])
              list[partIndex] = mesh
            }}
            args={[part.geometry, part.material, tuning.pools.obstacles]}
          />
        )),
      )}
    </>
  )
}
