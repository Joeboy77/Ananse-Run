import { useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { attachInput } from '@/game/player/inputSource'
import { game } from '@/game/runtime'
import { useGameStore } from '@/store/gameStore'

const MAX_FRAME_DELTA = 0.1
const HUD_INTERVAL = 0.1

let hudTimer = 0

export function GameDriver() {
  useEffect(() => attachInput(window, (command) => game.command(command)), [])

  useFrame((_, delta) => {
    game.frame(Math.min(delta, MAX_FRAME_DELTA))

    hudTimer += delta
    if (hudTimer < HUD_INTERVAL) return
    hudTimer = 0
    const { score, gold } = useGameStore.getState()
    const { sim } = game
    if (score !== sim.score || gold !== sim.gold) useGameStore.setState({ score: sim.score, gold: sim.gold })
  }, -1)

  return null
}
