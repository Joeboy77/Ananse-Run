import { tuning } from '@/config/tuning'
import { goldWeights } from '@/content/goldWeights'
import { powerUpInfo } from '@/content/powerUps'
import { cameraFx } from '@/game/camera/cameraFx'
import { randomSeed } from '@/game/core/rng'
import { createFixedStepper } from '@/game/loop/fixedStep'
import { isActivePhase } from '@/game/loop/runPhase'
import { RunSimulation, type RunEvent } from '@/game/loop/simulation'
import type { InputCommand } from '@/game/player/inputSource'
import { applyRunResult } from '@/game/progression/rewards'
import { runConfigFor } from '@/game/runConfig'
import { scoreMultiplier } from '@/game/progression/profile'
import { showToast, useGameStore } from '@/store/gameStore'
import { commitProfile, getProfile, isProfileLoaded } from '@/store/profileStore'

const seedParam = Number(new URLSearchParams(window.location.search).get('seed'))
const nextSeed = () => (Number.isInteger(seedParam) && seedParam > 0 ? seedParam : randomSeed())

const sim = new RunSimulation(nextSeed())
const stepper = createFixedStepper(tuning.simulation.stepHz, tuning.simulation.maxStepsPerFrame)
let finalized = true

const finishRun = (): void => {
  if (finalized) return
  finalized = true
  const { profile, summary } = applyRunResult(getProfile(), sim.runStats())
  commitProfile(profile)
  useGameStore.setState({ summary, continueOffer: false, multiplier: scoreMultiplier(profile) })
}

const onGameOver = (): void => {
  const canContinue = getProfile().sankofaTokens > 0 && sim.canRewind
  useGameStore.setState({ phase: 'gameover', score: sim.score, gold: sim.gold, continueOffer: canContinue })
  if (!canContinue) finishRun()
}

const handleEvent = (event: RunEvent) => {
  switch (event.type) {
    case 'phase':
      if (event.phase === 'gameover') onGameOver()
      else useGameStore.setState({ phase: event.phase })
      break
    case 'stumble':
      cameraFx.add(tuning.camera.stumbleTrauma)
      break
    case 'crash':
      cameraFx.add(tuning.camera.crashTrauma)
      break
    case 'shieldBreak':
      cameraFx.add(tuning.camera.stumbleTrauma)
      showToast('Shield used')
      break
    case 'powerUp':
      showToast(powerUpInfo[event.id].name)
      break
    case 'goldWeight':
      showToast(`Gold weight found: ${goldWeights.find((weight) => weight.id === event.id)?.name ?? ''}`)
      break
    case 'sankofa':
      showToast('Sankofa! Back you go')
      break
    case 'gold':
    case 'powerUpEnd':
      break
  }
}

sim.onEvent(handleEvent)

const prepare = (): void => {
  stepper.reset()
  cameraFx.reset()
  const profile = getProfile()
  sim.reset(nextSeed(), runConfigFor(profile))
  useGameStore.setState({
    score: 0,
    gold: 0,
    summary: null,
    continueOffer: false,
    powerUps: [],
    shield: false,
    drum: false,
    multiplier: scoreMultiplier(profile),
  })
}

export const game = {
  sim,
  alpha: 0,

  frame(delta: number): void {
    this.alpha = stepper.advance(delta, (step) => sim.step(step))
  },

  renderLag(): number {
    return isActivePhase(sim.phase) ? sim.speed * stepper.step * (1 - this.alpha) : 0
  },

  refreshMenu(): void {
    if (sim.phase === 'menu') prepare()
  },

  play(): void {
    if (sim.phase !== 'menu' || !isProfileLoaded()) return
    prepare()
    finalized = false
    sim.start()
  },

  restart(): void {
    finishRun()
    prepare()
    finalized = false
    sim.start()
  },

  home(): void {
    finishRun()
    prepare()
  },

  continueRun(): void {
    const profile = getProfile()
    if (profile.sankofaTokens <= 0 || !sim.canRewind) return
    commitProfile({ ...profile, sankofaTokens: profile.sankofaTokens - 1 })
    stepper.reset()
    cameraFx.reset()
    useGameStore.setState({ continueOffer: false })
    sim.sankofa()
  },

  declineContinue(): void {
    finishRun()
  },

  useCharm(): void {
    const profile = getProfile()
    if (profile.shieldCharms <= 0 || !sim.activateShield()) return
    commitProfile({ ...profile, shieldCharms: profile.shieldCharms - 1 })
  },

  command(command: InputCommand): void {
    switch (command) {
      case 'confirm':
        if (sim.phase === 'menu') game.play()
        else if (sim.phase === 'gameover') game.restart()
        return
      case 'activate':
        game.useCharm()
        return
      default:
        sim.queue(command)
    }
  },
}
