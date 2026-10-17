import { Box3, Matrix4, Mesh, Vector3, type BufferGeometry, type Material, type Object3D } from 'three'
import { toToon } from '../character/toon'

export interface PropPart {
  geometry: BufferGeometry
  material: Material
}

const bounds = new Box3()
const size = new Vector3()
const center = new Vector3()

export const buildPropModel = (scene: Object3D, rotationY: number): PropPart[] => {
  scene.updateMatrixWorld(true)
  const turn = new Matrix4().makeRotationY(rotationY)
  const parts: PropPart[] = []
  scene.traverse((object) => {
    if (!(object instanceof Mesh)) return
    const geometry = (object.geometry as BufferGeometry).clone()
    geometry.applyMatrix4(object.matrixWorld)
    geometry.applyMatrix4(turn)
    const source = Array.isArray(object.material) ? object.material[0] : object.material
    parts.push({ geometry, material: toToon(source as Material) })
  })

  bounds.makeEmpty()
  for (const part of parts) {
    part.geometry.computeBoundingBox()
    if (part.geometry.boundingBox) bounds.union(part.geometry.boundingBox)
  }
  bounds.getSize(size)
  bounds.getCenter(center)
  const normalize = new Matrix4()
    .makeScale(1 / Math.max(size.x, 1e-6), 1 / Math.max(size.y, 1e-6), 1 / Math.max(size.z, 1e-6))
    .multiply(new Matrix4().makeTranslation(-center.x, -center.y, -center.z))
  for (const part of parts) {
    part.geometry.applyMatrix4(normalize)
    part.geometry.computeBoundingSphere()
  }
  return parts
}
