import { BoxGeometry } from 'three'

export const createWedgeGeometry = (): BoxGeometry => {
  const geometry = new BoxGeometry(1, 1, 1)
  const position = geometry.attributes.position!
  for (let i = 0; i < position.count; i++) {
    if (position.getY(i) > 0 && position.getZ(i) > 0) position.setY(i, -0.5)
  }
  position.needsUpdate = true
  geometry.computeVertexNormals()
  return geometry
}
