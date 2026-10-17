import {
  DataTexture,
  Mesh,
  MeshToonMaterial,
  NearestFilter,
  RedFormat,
  type Material,
  type Object3D,
} from 'three'
import { graphics } from '@/config/graphics'

let gradient: DataTexture | null = null

const gradientMap = (): DataTexture => {
  if (gradient) return gradient
  const steps = graphics.character.toonSteps
  gradient = new DataTexture(
    new Uint8Array(steps.map((step) => Math.round(step * 255))),
    steps.length,
    1,
    RedFormat,
  )
  gradient.minFilter = NearestFilter
  gradient.magFilter = NearestFilter
  gradient.needsUpdate = true
  return gradient
}

interface MaybeColored extends Material {
  color?: MeshToonMaterial['color']
  map?: MeshToonMaterial['map']
}

const toToon = (source: Material): MeshToonMaterial => {
  const material = source as MaybeColored
  const toon = new MeshToonMaterial({
    gradientMap: gradientMap(),
    map: material.map ?? null,
    transparent: material.transparent,
    alphaTest: material.alphaTest,
    side: material.side,
  })
  if (material.color) toon.color.copy(material.color)
  toon.name = material.name
  return toon
}

export const toonify = (root: Object3D): void => {
  root.traverse((object) => {
    if (!(object instanceof Mesh)) return
    object.material = Array.isArray(object.material)
      ? object.material.map((material: Material) => toToon(material))
      : toToon(object.material as Material)
  })
}
