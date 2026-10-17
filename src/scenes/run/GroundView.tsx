import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Euler, Matrix4, Quaternion, Vector3, type InstancedMesh } from 'three'
import { tuning } from '@/config/tuning'
import { createRng } from '@/game/core/rng'
import { game } from '@/game/runtime'

const TRACK_LENGTH = tuning.track.chunkLength * tuning.track.chunksAlive + 40
const TRACK_WIDTH = tuning.lanes.width * tuning.lanes.count
const DASH_SPACING = 6
const DASHES_PER_LINE = Math.ceil(TRACK_LENGTH / DASH_SPACING)
const DIVIDERS = [-tuning.lanes.width / 2, tuning.lanes.width / 2]
const BUILDING_SPACING = 9
const BUILDINGS_PER_SIDE = Math.ceil(TRACK_LENGTH / BUILDING_SPACING)
const FAR_Z = -TRACK_LENGTH + 20

const matrix = new Matrix4()
const position = new Vector3()
const scale = new Vector3()
const rotation = new Quaternion()
const flat = new Quaternion().setFromEuler(new Euler(-Math.PI / 2, 0, 0))

const wrap = (value: number, length: number) => ((value % length) + length) % length

export function GroundView() {
  const dashes = useRef<InstancedMesh>(null)
  const buildings = useRef<InstancedMesh>(null)

  const buildingShapes = useMemo(() => {
    const rng = createRng(2026)
    return Array.from({ length: BUILDINGS_PER_SIDE * 2 }, () => ({
      width: 5 + rng.next() * 4,
      height: 3 + rng.next() * 7,
      depth: BUILDING_SPACING - 1 - rng.next() * 2,
    }))
  }, [])

  useLayoutEffect(() => {
    if (dashes.current) dashes.current.frustumCulled = false
    if (buildings.current) buildings.current.frustumCulled = false
  }, [])

  useFrame(() => {
    const scroll = game.sim.track.scroll - game.renderLag()
    const dashMesh = dashes.current
    const buildingMesh = buildings.current
    if (!dashMesh || !buildingMesh) return

    let i = 0
    for (const x of DIVIDERS) {
      for (let d = 0; d < DASHES_PER_LINE; d++) {
        position.set(x, 0.02, FAR_Z + wrap(d * DASH_SPACING + scroll, TRACK_LENGTH))
        scale.set(0.12, 2.4, 1)
        matrix.compose(position, flat, scale)
        dashMesh.setMatrixAt(i++, matrix)
      }
    }
    dashMesh.instanceMatrix.needsUpdate = true

    let b = 0
    for (const side of [-1, 1]) {
      for (let n = 0; n < BUILDINGS_PER_SIDE; n++) {
        const shape = buildingShapes[b]!
        const z = FAR_Z + wrap(n * BUILDING_SPACING + scroll, BUILDINGS_PER_SIDE * BUILDING_SPACING)
        position.set(side * (TRACK_WIDTH / 2 + 2.5 + shape.width / 2), shape.height / 2, z)
        scale.set(shape.width, shape.height, shape.depth)
        matrix.compose(position, rotation, scale)
        buildingMesh.setMatrixAt(b++, matrix)
      }
    }
    buildingMesh.instanceMatrix.needsUpdate = true
  })

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, -TRACK_LENGTH / 2 + 20]}>
        <planeGeometry args={[TRACK_WIDTH + 4, TRACK_LENGTH]} />
        <meshLambertMaterial color="#b9773d" />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, -TRACK_LENGTH / 2 + 20]}>
        <planeGeometry args={[80, TRACK_LENGTH]} />
        <meshLambertMaterial color="#d79a5a" />
      </mesh>
      <instancedMesh ref={dashes} args={[undefined, undefined, DIVIDERS.length * DASHES_PER_LINE]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color="#f3dcb4" />
      </instancedMesh>
      <instancedMesh ref={buildings} args={[undefined, undefined, BUILDINGS_PER_SIDE * 2]}>
        <boxGeometry />
        <meshLambertMaterial color="#c9845a" />
      </instancedMesh>
    </group>
  )
}
