import { Suspense, useRef, type Ref } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group, Mesh, MeshLambertMaterial } from 'three'
import { tuning } from '@/config/tuning'
import { characters, outfits } from '@/content/characters'
import { characterAsset } from '@/game/assets'
import { damp, lerp } from '@/game/core/math'
import { game } from '@/game/runtime'
import { useProfileStore } from '@/store/profileStore'
import { CharacterModel } from './character/CharacterModel'
import { ModelBoundary } from './character/ModelBoundary'

const { height, radius } = tuning.player

interface CapsuleProps {
  color: string
  accent?: string
  skin?: Ref<MeshLambertMaterial>
}

function Capsule({ color, accent, skin }: CapsuleProps) {
  return (
    <>
      <mesh position-y={height / 2}>
        <capsuleGeometry args={[radius, height - radius * 2, 6, 12]} />
        <meshLambertMaterial ref={skin} color={color} emissive="#9b5de5" emissiveIntensity={0} />
      </mesh>
      <mesh position={[0, height * 0.78, -radius * 0.8]}>
        <boxGeometry args={[0.36, 0.12, 0.1]} />
        <meshBasicMaterial color="#1b1209" />
      </mesh>
      {accent && (
        <mesh position-y={height * 0.42}>
          <cylinderGeometry args={[radius + 0.03, radius + 0.03, 0.35, 12]} />
          <meshLambertMaterial color={accent} />
        </mesh>
      )}
    </>
  )
}

export function PlayerView() {
  const body = useRef<Group>(null)
  const shadow = useRef<Mesh>(null)
  const shield = useRef<Mesh>(null)
  const web = useRef<Mesh>(null)
  const skin = useRef<MeshLambertMaterial>(null)
  const equipped = useProfileStore((state) => state.profile.equipped)
  const color = characters.find((character) => character.id === equipped.character)?.color ?? '#f2b705'
  const accent = outfits.find((outfit) => outfit.id === equipped.outfit)?.accent
  const asset = characterAsset(equipped.character)

  useFrame(({ clock }, delta) => {
    const group = body.current
    const blob = shadow.current
    if (!group || !blob || !shield.current || !web.current) return
    const { player, phase, powerUps } = game.sim
    const alpha = game.alpha
    const x = lerp(player.prevX, player.x, alpha)
    const y = lerp(player.prevY, player.y, alpha)
    const targetScale = player.height / height

    group.position.set(x, y, 0)
    if (!asset) {
      group.scale.y = damp(group.scale.y, targetScale, 30, delta)
      group.scale.x = group.scale.z = damp(group.scale.x, 1 / Math.sqrt(targetScale), 30, delta)
      const crashed = phase === 'crashed' || phase === 'gameover'
      group.rotation.x = damp(group.rotation.x, crashed ? -1.2 : player.flying ? 0.5 : 0, 8, delta)
    }

    const blink = game.sim.invulnerableTimer > 0 && !player.flying && Math.sin(clock.elapsedTime * 30) > 0
    group.visible = !blink

    shield.current.visible = powerUps.shield
    shield.current.position.set(x, y + player.height / 2, 0)

    web.current.visible = player.flying
    web.current.position.set(x, y + height + 6, -2)

    if (skin.current) {
      skin.current.emissiveIntensity = game.sim.drumActive
        ? 0.35 + Math.sin(clock.elapsedTime * 12) * 0.25
        : 0
    }

    const lift = Math.max(0, y - player.support)
    blob.position.set(x, player.support + 0.02, 0)
    blob.scale.setScalar(Math.max(0.35, 1 - lift * 0.25))
  })

  return (
    <>
      <group ref={body}>
        {asset ? (
          <ModelBoundary key={asset.model} fallback={<Capsule color={color} accent={accent} />}>
            <Suspense fallback={<Capsule color={color} accent={accent} />}>
              <CharacterModel asset={asset} />
            </Suspense>
          </ModelBoundary>
        ) : (
          <Capsule color={color} accent={accent} skin={skin} />
        )}
      </group>
      <mesh ref={shield}>
        <sphereGeometry args={[1.25, 20, 14]} />
        <meshBasicMaterial color="#4fb3ff" transparent opacity={0.22} depthWrite={false} />
      </mesh>
      <mesh ref={web}>
        <cylinderGeometry args={[0.03, 0.03, 12, 4]} />
        <meshBasicMaterial color="#f5f1e6" />
      </mesh>
      <mesh ref={shadow} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.55, 20]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.28} depthWrite={false} />
      </mesh>
    </>
  )
}
