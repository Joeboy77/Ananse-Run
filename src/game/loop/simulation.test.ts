import { describe, expect, it } from 'vitest'
import { tuning } from '@/config/tuning'
import { RunSimulation, type RunEvent } from './simulation'

const dt = 1 / tuning.simulation.stepHz

const isolated = () => {
  const sim = new RunSimulation(1)
  sim.track.reset()
  sim.track.spawnCursor = -1_000_000
  sim.start()
  return sim
}

const runFor = (sim: RunSimulation, seconds: number) => {
  for (let i = 0; i < seconds / dt && sim.phase !== 'gameover'; i++) sim.step(dt)
}

describe('run simulation', () => {
  it('waits in the menu until started', () => {
    const sim = new RunSimulation(1)
    runFor(sim, 2)
    expect(sim.phase).toBe('menu')
    expect(sim.distance).toBe(0)
  })

  it('moves forward and scores by distance once started', () => {
    const sim = new RunSimulation(1)
    sim.start()
    runFor(sim, 1)
    expect(sim.distance).toBeGreaterThan(tuning.speed.start * 0.95)
    expect(sim.score).toBe(Math.floor(sim.distance * tuning.score.perUnit))
  })

  it('collects the opening gold line in the centre lane', () => {
    const sim = new RunSimulation(1)
    sim.start()
    runFor(sim, 3)
    expect(sim.gold).toBeGreaterThanOrEqual(10)
  })

  it('keeps the track filled and never runs out of pooled objects', () => {
    for (const seed of [1, 2, 3, 4, 5]) {
      const sim = new RunSimulation(seed)
      sim.start()
      let maxObstacles = 0
      for (let i = 0; i < 60 / dt; i++) {
        sim.step(dt)
        if (sim.phase === 'crashed' || sim.phase === 'gameover') {
          sim.reset(seed + i)
          sim.start()
        }
        maxObstacles = Math.max(maxObstacles, sim.track.obstacles.activeCount)
      }
      expect(maxObstacles).toBeLessThan(tuning.pools.obstacles)
      expect(sim.track.spawnCursor).toBeLessThanOrEqual(-tuning.track.chunkLength * tuning.track.chunksAlive)
    }
  })

  it('ends the run when an obstacle is never avoided', () => {
    const sim = new RunSimulation(1)
    const phases: string[] = []
    sim.onEvent((event: RunEvent) => event.type === 'phase' && phases.push(event.phase))
    sim.start()
    runFor(sim, 120)
    expect(sim.phase).toBe('gameover')
    expect(phases).toContain('crashed')
  })

  it('resets everything for an instant restart', () => {
    const sim = new RunSimulation(1)
    sim.start()
    runFor(sim, 5)
    sim.reset(2)
    expect(sim.phase).toBe('menu')
    expect(sim.distance).toBe(0)
    expect(sim.gold).toBe(0)
    expect(sim.speed).toBe(tuning.speed.start)
    expect(sim.player.lane).toBe(1)
  })

  it('stumbles on a side clip and crashes on a second within the window', () => {
    const sim = isolated()
    const obstacle = sim.track.obstacles.acquire()!
    Object.assign(obstacle, { kind: 'full', lane: 0, x: -2.5, z: -0.5, depth: 6, bottom: 0, top: 3.2 })
    sim.queue('left')
    for (let i = 0; i < 6; i++) sim.step(dt)
    expect(sim.phase).toBe('stumbled')
    expect(sim.player.lane).toBe(1)

    for (let i = 0; i < 30; i++) sim.step(dt)
    obstacle.z = -0.5
    sim.queue('left')
    for (let i = 0; i < 6; i++) sim.step(dt)
    expect(['crashed', 'gameover']).toContain(sim.phase)
  })

  it('crashes on a head-on hit', () => {
    const sim = isolated()
    const obstacle = sim.track.obstacles.acquire()!
    Object.assign(obstacle, { kind: 'full', lane: 1, x: 0, z: -3, depth: 2, bottom: 0, top: 3.2 })
    for (let i = 0; i < 20; i++) sim.step(dt)
    expect(['crashed', 'gameover']).toContain(sim.phase)
  })

  it('clears a low obstacle with a well-timed jump', () => {
    const sim = isolated()
    const obstacle = sim.track.obstacles.acquire()!
    Object.assign(obstacle, { kind: 'low', lane: 1, x: 0, z: -4, depth: 1.2, bottom: 0, top: 1 })
    sim.queue('jump')
    for (let i = 0; i < 60; i++) sim.step(dt)
    expect(sim.phase).toBe('running')
  })

  it('slides under a high obstacle', () => {
    const sim = isolated()
    const obstacle = sim.track.obstacles.acquire()!
    Object.assign(obstacle, { kind: 'high', lane: 1, x: 0, z: -3, depth: 0.5, bottom: 1.2, top: 2.6 })
    sim.queue('slide')
    for (let i = 0; i < 40; i++) sim.step(dt)
    expect(sim.phase).toBe('running')
  })

  it('lands on a platform and runs along its roof', () => {
    const sim = isolated()
    const obstacle = sim.track.obstacles.acquire()!
    Object.assign(obstacle, { kind: 'platform', lane: 1, x: 0, z: -10, depth: 14, bottom: 0, top: 1.8 })
    sim.queue('jump')
    for (let i = 0; i < 40; i++) sim.step(dt)
    expect(sim.phase).toBe('running')
    expect(sim.player.y).toBeCloseTo(1.8)
  })
})
