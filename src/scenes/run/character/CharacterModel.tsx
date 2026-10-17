import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import {
  AnimationMixer,
  Box3,
  Group,
  LoopOnce,
  LoopRepeat,
  SkinnedMesh,
  type AnimationAction,
  type Object3D,
} from 'three'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { graphics } from '@/config/graphics'
import { tuning } from '@/config/tuning'
import type { CharacterAsset } from '@/game/assets'
import { damp } from '@/game/core/math'
import { clipFor, LOOPING_CLIPS, resolveClip, type ClipName } from '@/game/player/animationState'
import { game } from '@/game/runtime'
import { isDebug } from '@/debug/isDebug'
import { addOutlines, toonify } from './toon'

const CHEST_BONE = /spine2|upperchest|chest/i
const c = graphics.character
const outlineEnabled =
  c.outline.enabled && !(isDebug() && new URLSearchParams(window.location.search).get('outline') === '0')

const prepareScene = (source: Object3D): Object3D => {
  const scene = clone(source)
  toonify(scene)
  scene.updateMatrixWorld(true)
  scene.traverse((object) => {
    if (!(object instanceof SkinnedMesh)) return
    object.skeleton.update()
    object.computeBoundingBox()
    object.frustumCulled = false
  })
  const bounds = new Box3().setFromObject(scene)
  const height = bounds.max.y - bounds.min.y
  if (height > 0) {
    const scale = tuning.player.height / height
    scene.scale.setScalar(scale)
    scene.position.y = -bounds.min.y * scale
  }
  scene.updateMatrixWorld(true)
  if (outlineEnabled) addOutlines(scene, c.outline.color, c.outline.thickness)
  return scene
}

const findChestBone = (scene: Object3D): Object3D | null => {
  let found: Object3D | null = null
  scene.traverse((object) => {
    if (!found && CHEST_BONE.test(object.name)) found = object
  })
  return found
}

function ExtraArms({ url, scene }: { url: string; scene: Object3D }) {
  const gltf = useGLTF(url, false, true)
  const pivot = useMemo(() => new Group(), [])

  useEffect(() => {
    const arms = clone(gltf.scene)
    toonify(arms)
    arms.scale.copy(scene.scale)
    arms.position.copy(scene.position)
    scene.parent?.add(arms)
    arms.updateMatrixWorld(true)
    if (outlineEnabled) addOutlines(arms, c.outline.color, c.outline.thickness)
    const bone = findChestBone(scene)
    const anchor = bone ?? scene
    anchor.add(pivot)
    pivot.attach(arms)
    return () => {
      pivot.remove(arms)
      anchor.remove(pivot)
    }
  }, [gltf, scene, pivot])

  useFrame((_, delta) => {
    const flying = game.sim.player.flying
    pivot.rotation.x = damp(pivot.rotation.x, flying ? c.armsReachAngle : 0, c.armsLambda, delta)
    pivot.scale.setScalar(damp(pivot.scale.x, flying ? 1 : c.armsTuckedScale, c.armsLambda, delta))
  })

  return null
}

export function CharacterModel({ asset }: { asset: CharacterAsset }) {
  const gltf = useGLTF(asset.model, false, true)
  const scene = useMemo(() => prepareScene(gltf.scene), [gltf])
  const mixer = useMemo(() => new AnimationMixer(scene), [scene])
  const actions = useMemo(() => {
    const map = new Map<string, AnimationAction>()
    for (const clip of gltf.animations) {
      const action = mixer.clipAction(clip)
      const looping = LOOPING_CLIPS.has(clip.name as ClipName) || gltf.animations.length === 1
      action.setLoop(looping ? LoopRepeat : LoopOnce, Infinity)
      action.clampWhenFinished = !looping
      map.set(clip.name, action)
    }
    return map
  }, [gltf, mixer])
  const available = useMemo(() => new Set(actions.keys()), [actions])
  const current = useRef<AnimationAction | null>(null)

  useEffect(
    () => () => {
      mixer.stopAllAction()
    },
    [mixer],
  )

  useFrame((_, delta) => {
    const { sim } = game
    const { player } = sim
    const name = resolveClip(
      clipFor({
        phase: sim.phase,
        flying: player.flying,
        sliding: player.sliding,
        grounded: player.grounded,
        switching: player.switching,
        direction: player.x - player.prevX,
        stumbleRecent: sim.stumbleTimer > tuning.stumble.window - c.stumbleClipTime,
      }),
      available,
    )
    const next = name ? (actions.get(name) ?? null) : null
    if (next && next !== current.current) {
      next.reset().setEffectiveWeight(1).fadeIn(c.crossFade).play()
      current.current?.fadeOut(c.crossFade)
      current.current = next
    }
    const runScale = Math.min(c.runTimeScaleMax, sim.speed / tuning.speed.start)
    if (current.current) current.current.timeScale = name === 'run' ? runScale : 1
    mixer.update(delta)
  })

  return (
    <group rotation-y={c.facingY}>
      <primitive object={scene} />
      {asset.extraArms && <ExtraArms url={asset.extraArms} scene={scene} />}
    </group>
  )
}
