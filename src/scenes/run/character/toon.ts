import {
  BackSide,
  DataTexture,
  Mesh,
  MeshBasicMaterial,
  Vector3,
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

export const toToon = (source: Material): MeshToonMaterial => {
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

const OUTLINE_SHADER = `
#ifdef USE_SKINNING
  transformed += normalize(objectNormal) * outlineThickness;
#else
  transformed += normalize(normal) * outlineThickness;
#endif
`

const createOutlineMaterial = (color: string, thickness: number): MeshBasicMaterial => {
  const material = new MeshBasicMaterial({ color, side: BackSide })
  material.onBeforeCompile = (shader) => {
    shader.uniforms.outlineThickness = { value: thickness }
    shader.vertexShader = `uniform float outlineThickness;\n${shader.vertexShader}`.replace(
      '#include <skinning_vertex>',
      `#include <skinning_vertex>\n${OUTLINE_SHADER}`,
    )
  }
  material.customProgramCacheKey = () => `outline-${thickness.toFixed(5)}`
  return material
}

const worldScale = new Vector3()

export const addOutlines = (root: Object3D, color: string, worldThickness: number): void => {
  root.updateMatrixWorld(true)
  const meshes: Mesh[] = []
  root.traverse((object) => {
    if (object instanceof Mesh && !object.userData.outline) meshes.push(object)
  })
  for (const mesh of meshes) {
    mesh.getWorldScale(worldScale)
    const thickness = worldThickness / Math.max(worldScale.x, 1e-6)
    const outline = mesh.clone() as Mesh
    outline.material = createOutlineMaterial(color, thickness)
    outline.userData.outline = true
    outline.frustumCulled = false
    outline.castShadow = false
    mesh.parent?.add(outline)
  }
}
