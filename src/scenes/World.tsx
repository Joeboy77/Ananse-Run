import { graphics } from '@/config/graphics'

export function World() {
  return (
    <>
      <color attach="background" args={[graphics.clearColor]} />
      <fog attach="fog" args={[graphics.fog.color, graphics.fog.near, graphics.fog.far]} />
      <hemisphereLight args={['#fff1d6', '#7a4a1f', 1.4]} />
      <directionalLight position={[8, 14, 6]} intensity={2.2} color="#ffd7a1" />
    </>
  )
}
