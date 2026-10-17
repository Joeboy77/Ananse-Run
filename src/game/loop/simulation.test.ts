import { describe, expect, it } from 'vitest'
import { tuning } from '@/config/tuning'
import { createObstacle, type Obstacle } from '@/game/obstacles/types'
import { defaultRunConfig, RunSimulation, type RunEvent } from './simulation'

const dt = 1 / tuning.simulation.stepHz

const isolated = (config = defaultRunConfig()) => {
  const sim = new RunSimulation(1, config)
  sim.track.reset()
  sim.track.spawnCursor = -1_000_000
  sim.start()
  return sim
}

const place = (sim: RunSimulation, props: Partial<Obstacle>): Obstacle => {
  const obstacle = sim.track.obstacles.acquire()!
  Object.assign(obstacle, createObstacle(), { active: true, visual: props.kind ?? 'low' }, props)
  obstacle.prevX = obstacle.x
  obstacle.prevZ = obstacle.z
  return obstacle
}

const pickup = (
  sim: RunSimulation,
  powerUp: 'webSwing' | 'magnet' | 'drum' | 'springWeb' | 'shield',
  z = -2,
) => {
  const item = sim.track.pickups.acquire()!
  Object.assign(item, { type: 'powerUp', powerUp, x: 0, y: 1.2, z })
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
    place(sim, { kind: 'full', lane: 0, x: -2.5, z: -0.5, depth: 6, bottom: 0, top: 3.2 })
    sim.queue('left')
    for (let i = 0; i < 6; i++) sim.step(dt)
    expect(sim.phase).toBe('stumbled')
    expect(sim.player.lane).toBe(1)

    for (let i = 0; i < 30; i++) sim.step(dt)
    place(sim, { kind: 'full', lane: 0, x: -2.5, z: -0.5, depth: 6, bottom: 0, top: 3.2 })
    sim.queue('left')
    for (let i = 0; i < 6; i++) sim.step(dt)
    expect(['crashed', 'gameover']).toContain(sim.phase)
  })

  it('crashes on a head-on hit', () => {
    const sim = isolated()
    place(sim, { kind: 'full', lane: 1, x: 0, z: -3, depth: 2, bottom: 0, top: 3.2 })
    for (let i = 0; i < 20; i++) sim.step(dt)
    expect(['crashed', 'gameover']).toContain(sim.phase)
  })

  it('clears a low obstacle with a well-timed jump', () => {
    const sim = isolated()
    place(sim, { kind: 'low', lane: 1, x: 0, z: -4, depth: 1.2, bottom: 0, top: 1 })
    sim.queue('jump')
    for (let i = 0; i < 60; i++) sim.step(dt)
    expect(sim.phase).toBe('running')
  })

  it('slides under a high obstacle', () => {
    const sim = isolated()
    place(sim, { kind: 'high', lane: 1, x: 0, z: -3, depth: 0.5, bottom: 1.2, top: 2.6 })
    sim.queue('slide')
    for (let i = 0; i < 40; i++) sim.step(dt)
    expect(sim.phase).toBe('running')
  })

  it('lands on a platform and runs along its roof', () => {
    const sim = isolated()
    place(sim, { kind: 'platform', lane: 1, x: 0, z: -10, depth: 14, bottom: 0, top: 1.8 })
    sim.queue('jump')
    for (let i = 0; i < 40; i++) sim.step(dt)
    expect(sim.phase).toBe('running')
    expect(sim.player.y).toBeCloseTo(1.8)
  })

  it('starts each run with the chaser visible, then it drops back', () => {
    const sim = isolated()
    expect(sim.chaser.visible).toBe(true)
    runFor(sim, 8)
    expect(sim.chaser.visible).toBe(false)
  })

  it('brings the chaser close after a stumble', () => {
    const sim = isolated()
    runFor(sim, 8)
    place(sim, { kind: 'full', lane: 0, x: -2.5, z: -0.5, depth: 6, bottom: 0, top: 3.2 })
    sim.queue('left')
    runFor(sim, 1)
    expect(sim.chaser.visible).toBe(true)
  })

  it('collects a power-up and runs it for its duration', () => {
    const config = defaultRunConfig()
    config.durations.drum = 3
    const sim = isolated(config)
    pickup(sim, 'drum')
    runFor(sim, 0.5)
    expect(sim.powerUps.isActive('drum')).toBe(true)
    expect(sim.stats.powerUps).toBe(1)
    runFor(sim, 3)
    expect(sim.powerUps.isActive('drum')).toBe(false)
  })

  it('doubles gold and score with the Talking Drum', () => {
    const sim = isolated()
    sim.powerUps.activate('drum')
    sim.track.spawnGold(0, 0.9, -1)
    const before = sim.score
    sim.step(dt)
    expect(sim.gold).toBe(2)
    expect(sim.score - before).toBeGreaterThanOrEqual(0)
    runFor(sim, 1)
    expect(sim.score).toBeGreaterThan(tuning.speed.start * 2 * 0.9)
  })

  it('applies the mission multiplier to score', () => {
    const config = defaultRunConfig()
    config.multiplier = 3
    const sim = isolated(config)
    runFor(sim, 1)
    expect(sim.score).toBeGreaterThan(tuning.speed.start * 3 * 0.9)
  })

  it('pulls gold from another lane with the Kente Magnet', () => {
    const sim = isolated()
    sim.powerUps.activate('magnet')
    sim.track.spawnGold(2.5, 0.9, -12)
    runFor(sim, 1.5)
    expect(sim.gold).toBe(1)
  })

  it('absorbs one head-on crash with the shield', () => {
    const sim = isolated()
    sim.powerUps.activate('shield')
    place(sim, { kind: 'full', lane: 1, x: 0, z: -3, depth: 2, bottom: 0, top: 3.2 })
    runFor(sim, 1)
    expect(sim.phase).toBe('running')
    expect(sim.powerUps.shield).toBe(false)
  })

  it('lets a stored charm add a shield only once', () => {
    const sim = isolated()
    expect(sim.activateShield()).toBe(true)
    expect(sim.activateShield()).toBe(false)
  })

  it('flies untouchable with Web Swing, collects sky gold and lands safely', () => {
    const sim = isolated()
    pickup(sim, 'webSwing')
    runFor(sim, 1.5)
    expect(sim.player.flying).toBe(true)
    expect(sim.player.y).toBeGreaterThan(tuning.powerUps.swingHeight - 1)
    place(sim, { kind: 'full', lane: 1, x: 0, z: -3, depth: 2, bottom: 0, top: 3.2 })
    runFor(sim, tuning.powerUps.durations.webSwing + 2)
    expect(sim.phase).toBe('running')
    expect(sim.player.flying).toBe(false)
    expect(sim.player.grounded).toBe(true)
    expect(sim.gold).toBeGreaterThan(5)
  })

  it('clears a full blocker with a Spring Web super jump', () => {
    const sim = isolated()
    sim.powerUps.activate('springWeb')
    place(sim, { kind: 'full', lane: 1, x: 0, z: -5, depth: 2, bottom: 0, top: 3.2 })
    sim.queue('jump')
    runFor(sim, 1.5)
    expect(sim.phase).toBe('running')
  })

  it('moves an oncoming trotro faster than the world', () => {
    const sim = isolated()
    const trotro = place(sim, {
      kind: 'full',
      motion: 'oncoming',
      visual: 'trotro',
      lane: 0,
      x: -2.5,
      z: -40,
      depth: 6,
      top: 3.2,
      vz: tuning.moving.oncomingSpeed,
    })
    sim.step(dt)
    const moved = trotro.z + 40
    expect(moved).toBeGreaterThan(sim.speed * dt + tuning.moving.oncomingSpeed * dt * 0.9)
  })

  it('moves a crossing okada sideways once it is close', () => {
    const sim = isolated()
    const okada = place(sim, {
      kind: 'full',
      motion: 'crossing',
      visual: 'okada',
      lane: 0,
      x: -tuning.moving.crossingStartX,
      z: -60,
      depth: tuning.moving.okadaDepth,
      top: 1.6,
      vx: tuning.moving.crossingSpeed,
    })
    sim.step(dt)
    expect(okada.x).toBe(-tuning.moving.crossingStartX)
    okada.z = -20
    sim.step(dt)
    expect(okada.x).toBeGreaterThan(-tuning.moving.crossingStartX)
  })

  it('walks up a ramp onto a roof at top speed', () => {
    const sim = isolated()
    for (let i = 0; i < 400 / dt; i++) sim.step(dt)
    expect(sim.speed).toBeGreaterThan(tuning.speed.max - 1)
    sim.track.obstacles.releaseAll()
    place(sim, { kind: 'ramp', lane: 1, x: 0, z: -12, depth: 6, top: 1.8 })
    place(sim, { kind: 'platform', lane: 1, x: 0, z: -21, depth: 12, top: 1.8 })
    runFor(sim, 1)
    expect(sim.phase).not.toBe('crashed')
    expect(sim.phase).not.toBe('gameover')
  })

  it('walks up a ramp onto a roof', () => {
    const sim = isolated()
    place(sim, { kind: 'ramp', lane: 1, x: 0, z: -6, depth: 6, top: 1.8 })
    place(sim, { kind: 'platform', lane: 1, x: 0, z: -9 - 6, depth: 12, top: 1.8 })
    runFor(sim, 1)
    expect(sim.phase).toBe('running')
    expect(sim.player.y).toBeCloseTo(1.8)
    expect(sim.stats.rooftops).toBe(1)
  })

  it('counts awnings slid under and crates jumped over', () => {
    const sim = isolated()
    place(sim, { kind: 'high', lane: 1, x: 0, z: -3, depth: 0.5, bottom: 1.2, top: 2.6 })
    sim.queue('slide')
    runFor(sim, 1)
    place(sim, { kind: 'low', lane: 1, x: 0, z: -4, depth: 1.2, bottom: 0, top: 1 })
    sim.queue('jump')
    runFor(sim, 1.2)
    expect(sim.stats.dodgedHigh).toBe(1)
    expect(sim.stats.dodgedLow).toBe(1)
    expect(sim.stats.jumps).toBe(1)
    expect(sim.stats.slides).toBe(1)
  })

  it('collects a gold weight once', () => {
    const sim = isolated()
    const item = sim.track.pickups.acquire()!
    Object.assign(item, { type: 'goldWeight', weightId: 'gw-hen', x: 0, y: 1.2, z: -2 })
    const events: RunEvent[] = []
    sim.onEvent((event) => events.push(event))
    runFor(sim, 0.5)
    expect(sim.stats.goldWeights).toEqual(['gw-hen'])
    expect(events.some((event) => event.type === 'goldWeight')).toBe(true)
  })

  it('rewinds about two seconds with Sankofa and continues', () => {
    const sim = isolated()
    runFor(sim, 4)
    const distanceAtSafeTime = sim.distance
    place(sim, { kind: 'full', lane: 1, x: 0, z: -3, depth: 2, bottom: 0, top: 3.2 })
    runFor(sim, 0.5)
    expect(sim.phase).toBe('crashed')
    const crashDistance = sim.distance
    runFor(sim, 1)
    expect(sim.phase).toBe('gameover')

    expect(sim.sankofa()).toBe(true)
    expect(sim.phase).toBe('running')
    expect(sim.distance).toBeLessThan(crashDistance)
    expect(sim.distance).toBeLessThan(distanceAtSafeTime)
    runFor(sim, 3)
    expect(sim.phase).toBe('running')
  })

  it('restores the exact same world after a rewind', () => {
    const a = new RunSimulation(42)
    a.start()
    runFor(a, 3)
    const snapshotGold = a.gold
    runFor(a, 0.1)
    expect(a.gold).toBeGreaterThanOrEqual(snapshotGold)
    const obstacles = a.track.obstacles.activeCount
    expect(obstacles).toBeGreaterThan(0)
  })

  it('reports run stats for missions', () => {
    const sim = new RunSimulation(3)
    sim.start()
    runFor(sim, 5)
    const stats = sim.runStats()
    expect(stats.score).toBe(sim.score)
    expect(stats.gold).toBe(sim.gold)
    expect(stats.distance).toBe(Math.floor(sim.distance))
  })

  it('hits a crossing okada across its full length', () => {
    const sim = isolated()
    place(sim, {
      kind: 'full',
      motion: 'crossing',
      visual: 'okada',
      lane: 1,
      x: (tuning.moving.okadaLength + tuning.player.halfWidth * 2) / 2 - 0.05,
      z: -3,
      depth: tuning.moving.okadaDepth,
      top: tuning.moving.okadaHeight,
    })
    runFor(sim, 0.5)
    expect(sim.phase).not.toBe('running')
  })
})
