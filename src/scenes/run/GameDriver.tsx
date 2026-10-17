import { useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { TIMED_POWER_UPS } from '@/content/powerUps'
import { attachInput } from '@/game/player/inputSource'
import { game } from '@/game/runtime'
import { useGameStore, type HudPowerUp } from '@/store/gameStore'

const MAX_FRAME_DELTA = 0.1
const HUD_INTERVAL = 0.1

let hudTimer = 0

const hudPowerUps = (): HudPowerUp[] => {
  const { powerUps } = game.sim
  return TIMED_POWER_UPS.filter((id) => powerUps.remaining[id] > 0).map((id) => ({
    id,
    remaining: powerUps.remaining[id],
    duration: powerUps.durations[id],
  }))
}

export function GameDriver() {
  useEffect(() => attachInput(window, (command) => game.command(command)), [])

  useFrame((_, delta) => {
    game.frame(Math.min(delta, MAX_FRAME_DELTA))

    hudTimer += delta
    if (hudTimer < HUD_INTERVAL) return
    hudTimer = 0
    const { sim } = game
    if (sim.phase === 'menu' || sim.phase === 'gameover') return
    const state = useGameStore.getState()
    const powerUps = hudPowerUps()
    if (
      state.score === sim.score &&
      state.gold === sim.gold &&
      state.shield === sim.powerUps.shield &&
      powerUps.length === 0 &&
      state.powerUps.length === 0
    ) {
      return
    }
    useGameStore.setState({
      score: sim.score,
      gold: sim.gold,
      shield: sim.powerUps.shield,
      drum: sim.drumActive,
      powerUps,
    })
  }, -1)

  return null
}
