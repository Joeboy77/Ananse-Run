import { tuning } from '@/config/tuning'
import { randomSeed } from '@/game/core/rng'
import { cameraFx } from '@/game/camera/cameraFx'
import { createFixedStepper } from '@/game/loop/fixedStep'
import { isActivePhase } from '@/game/loop/runPhase'
import { RunSimulation, type RunEvent } from '@/game/loop/simulation'
import type { InputCommand } from '@/game/player/inputSource'
import { useGameStore } from '@/store/gameStore'

const seedParam = Number(new URLSearchParams(window.location.search).get('seed'))
const nextSeed = () => (Number.isInteger(seedParam) && seedParam > 0 ? seedParam : randomSeed())

const sim = new RunSimulation(nextSeed())
const stepper = createFixedStepper(tuning.simulation.stepHz, tuning.simulation.maxStepsPerFrame)

const handleEvent = (event: RunEvent) => {
  switch (event.type) {
    case 'phase': {
      if (event.phase === 'gameover') {
        const { best } = useGameStore.getState()
        const score = sim.score
        useGameStore.setState({
          phase: event.phase,
          score,
          gold: sim.gold,
          best: Math.max(best, score),
          newBest: score > best,
        })
      } else {
        useGameStore.setState({ phase: event.phase })
      }
      break
    }
    case 'stumble':
      cameraFx.add(tuning.camera.stumbleTrauma)
      break
    case 'crash':
      cameraFx.add(tuning.camera.crashTrauma)
      break
    case 'gold':
      break
  }
}

sim.onEvent(handleEvent)

export const game = {
  sim,
  alpha: 0,

  frame(delta: number): void {
    this.alpha = stepper.advance(delta, (step) => sim.step(step))
  },

  renderLag(): number {
    return isActivePhase(sim.phase) ? sim.speed * stepper.step * (1 - this.alpha) : 0
  },

  play(): void {
    if (sim.phase !== 'menu') return
    stepper.reset()
    sim.start()
  },

  restart(): void {
    stepper.reset()
    cameraFx.reset()
    sim.reset(nextSeed())
    useGameStore.setState({ score: 0, gold: 0, newBest: false })
    sim.start()
  },

  command(command: InputCommand): void {
    if (command === 'confirm') {
      if (sim.phase === 'menu') game.play()
      else if (sim.phase === 'gameover') game.restart()
      return
    }
    sim.queue(command)
  },
}
