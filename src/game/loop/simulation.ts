import { tuning } from '@/config/tuning'
import { POWER_UPS, type PowerUpId, type TimedPowerUpId } from '@/content/powerUps'
import { Chaser } from '@/game/chaser/chaser'
import { createRng, type Rng } from '@/game/core/rng'
import { classifyHit, overlaps, type AxisOverlap, type Range } from '@/game/obstacles/collision'
import { isSolid, obstacleWidth, type Obstacle } from '@/game/obstacles/types'
import type { PlayerAction } from '@/game/player/actions'
import { InputBuffer } from '@/game/player/inputBuffer'
import { Player } from '@/game/player/player'
import { baseDurations, PowerUpSystem, type PowerUpTimes } from '@/game/powerups/powerUpSystem'
import type { ChunkSlot } from '@/game/track/chunkTypes'
import { chunks, startChunk } from '@/game/track/chunks'
import { ChunkGenerator, difficultyAt } from '@/game/track/generator'
import { clampLane, laneToX, type LaneIndex } from '@/game/track/lanes'
import type { PickupChoice } from '@/game/track/pickups'
import { Track, type Span } from '@/game/track/track'
import { isActivePhase, type RunPhase } from './runPhase'
import { createRunStats, type RunStats } from './runStats'
import { copyStats, copyStrings, loadPool, savePool, SimSnapshot } from './snapshot'
import { speedAt } from './speed'

export interface RunConfig {
  durations: PowerUpTimes
  multiplier: number
  missingGoldWeights: readonly string[]
}

export const defaultRunConfig = (): RunConfig => ({
  durations: baseDurations(),
  multiplier: 1,
  missingGoldWeights: [],
})

export type RunEvent =
  | { type: 'phase'; phase: RunPhase }
  | { type: 'stumble' }
  | { type: 'crash' }
  | { type: 'gold'; total: number }
  | { type: 'powerUp'; id: PowerUpId }
  | { type: 'powerUpEnd'; id: TimedPowerUpId }
  | { type: 'shieldBreak' }
  | { type: 'goldWeight'; id: string }
  | { type: 'sankofa' }

const { halfWidth, halfDepth } = tuning.player
const pu = tuning.powerUps
const sideGrace = 0.3
const rooftopHeight = tuning.obstacles.platform.height - 0.05
const dodgeReach = tuning.lanes.width / 2
const powerUpWeightTotal = POWER_UPS.reduce((sum, id) => sum + pu.weights[id], 0)

export class RunSimulation {
  readonly player = new Player()
  readonly track = new Track()
  readonly powerUps = new PowerUpSystem()
  readonly chaser = new Chaser()
  readonly stats: RunStats = createRunStats()
  phase: RunPhase = 'menu'
  elapsed = 0
  distance = 0
  speed: number = tuning.speed.start
  gold = 0
  multiplier = 1
  seed: number
  invulnerableTimer = 0
  stumbleTimer = 0

  private rng: Rng
  private generator: ChunkGenerator
  private readonly input = new InputBuffer(tuning.input.bufferMs / 1000)
  private readonly missingWeights: string[] = []
  private scoreAccum = 0
  private cleanDistance = 0
  private lastSupport = 0
  private sideGraceTimer = 0
  private crashTimer = 0
  private crashElapsed = 0
  private skyCursor = 0
  private skyLane: LaneIndex = 1
  private skyCount = 0
  private readonly snapshots = Array.from({ length: tuning.sankofa.snapshotsKept }, () => new SimSnapshot())
  private snapshotHead = 0
  private snapshotCount = 0
  private snapshotTimer = 0
  private listener: ((event: RunEvent) => void) | null = null
  private readonly span: Span = { minX: 0, maxX: 0, minZ: -halfDepth, maxZ: halfDepth }
  private readonly now = {
    x: { min: 0, max: 0 },
    y: { min: 0, max: 0 },
    z: { min: -halfDepth, max: halfDepth },
  }
  private readonly before = {
    x: { min: 0, max: 0 },
    y: { min: 0, max: 0 },
    z: { min: -halfDepth, max: halfDepth },
  }
  private readonly overlapNow: AxisOverlap = { x: false, y: false, z: false }
  private readonly overlapBefore: AxisOverlap = { x: false, y: false, z: false }
  private readonly pickPickup = (slot: ChunkSlot) => this.choosePickup(slot)
  private readonly runAction = (action: PlayerAction) => this.applyAction(action)

  constructor(seed: number, config: RunConfig = defaultRunConfig()) {
    this.seed = seed
    this.rng = createRng(seed)
    this.generator = new ChunkGenerator(chunks, this.rng)
    this.reset(seed, config)
  }

  get score(): number {
    return Math.floor(this.scoreAccum)
  }

  get drumActive(): boolean {
    return this.powerUps.isActive('drum')
  }

  get canRewind(): boolean {
    return (this.phase === 'crashed' || this.phase === 'gameover') && this.snapshotCount > 0
  }

  onEvent(listener: ((event: RunEvent) => void) | null): void {
    this.listener = listener
  }

  reset(seed: number, config: RunConfig = defaultRunConfig()): void {
    this.seed = seed
    this.rng = createRng(seed)
    this.generator = new ChunkGenerator(chunks, this.rng)
    this.multiplier = config.multiplier
    copyStrings(this.missingWeights, config.missingGoldWeights)
    this.powerUps.configure(config.durations)
    this.powerUps.reset()
    this.player.reset()
    this.chaser.reset()
    this.track.reset()
    this.input.clear()
    copyStats(this.stats, createRunStats())
    this.elapsed = 0
    this.distance = 0
    this.speed = tuning.speed.start
    this.gold = 0
    this.scoreAccum = 0
    this.cleanDistance = 0
    this.lastSupport = 0
    this.stumbleTimer = 0
    this.sideGraceTimer = 0
    this.invulnerableTimer = 0
    this.crashTimer = 0
    this.snapshotCount = 0
    this.snapshotTimer = 0
    this.track.spawn(startChunk)
    this.fillTrack()
    this.setPhase('menu')
  }

  start(): void {
    if (this.phase === 'menu') this.setPhase('running')
  }

  queue(action: PlayerAction): void {
    if (isActivePhase(this.phase)) this.input.push(action)
  }

  activateShield(): boolean {
    if (!isActivePhase(this.phase) || this.powerUps.shield) return false
    this.powerUps.activate('shield')
    this.emit({ type: 'powerUp', id: 'shield' })
    return true
  }

  runStats(): RunStats {
    this.stats.score = this.score
    this.stats.gold = this.gold
    this.stats.distance = Math.floor(this.distance)
    this.stats.cleanDistanceMax = Math.max(this.stats.cleanDistanceMax, this.cleanDistance)
    return this.stats
  }

  step(dt: number): void {
    if (this.phase === 'crashed') {
      this.chaser.step(dt)
      this.crashTimer -= dt
      if (this.crashTimer <= 0) this.setPhase('gameover')
      return
    }
    if (!isActivePhase(this.phase)) return

    this.elapsed += dt
    this.speed = speedAt(this.elapsed)
    const travel = this.speed * dt
    this.distance += travel
    this.scoreAccum +=
      travel * tuning.score.perUnit * this.multiplier * (this.drumActive ? pu.drumMultiplier : 1)
    this.cleanDistance += travel
    this.stats.cleanDistanceMax = Math.max(this.stats.cleanDistanceMax, this.cleanDistance)

    this.track.advance(travel, dt)
    this.fillTrack()
    this.updatePowerUps(dt, travel)

    this.player.spring = this.powerUps.isActive('springWeb')
    this.input.consume(this.runAction, dt)
    this.player.step(dt, this.supportUnderPlayer())
    this.trackRooftops()

    this.updateTimers(dt)
    this.chaser.step(dt)

    if (!this.player.flying && this.invulnerableTimer <= 0) this.resolveCollisions()
    if (!isActivePhase(this.phase)) return

    this.countDodges()
    if (this.powerUps.isActive('magnet')) this.pullGold(dt)
    this.collectGold()
    this.collectPickups()
    this.recordSnapshot(dt)
  }

  sankofa(): boolean {
    if (!this.canRewind) return false
    const target = this.crashElapsed - tuning.sankofa.rewindSeconds
    let chosen: SimSnapshot | null = null
    let earliest: SimSnapshot | null = null
    for (let i = 0; i < this.snapshotCount; i++) {
      const snap = this.snapshots[i]!
      if (!earliest || snap.elapsed < earliest.elapsed) earliest = snap
      if (snap.elapsed <= target && (!chosen || snap.elapsed > chosen.elapsed)) chosen = snap
    }
    const snapshot = chosen ?? earliest
    if (!snapshot) return false

    this.restore(snapshot)
    this.snapshotCount = 0
    this.snapshotTimer = 0
    this.input.clear()
    this.stumbleTimer = 0
    this.sideGraceTimer = 0
    this.crashTimer = 0
    this.invulnerableTimer = tuning.sankofa.grace
    this.chaser.caught = false
    this.chaser.alert(tuning.stumble.window)
    this.setPhase('running')
    this.emit({ type: 'sankofa' })
    return true
  }

  private applyAction(action: PlayerAction): boolean {
    const { player } = this
    const wasGrounded = player.grounded
    const done = player.tryAction(action)
    if (done && !player.flying) {
      if (action === 'jump' && wasGrounded) this.stats.jumps++
      if (action === 'slide') this.stats.slides++
    }
    return done
  }

  private fillTrack(): void {
    while (this.track.needsChunk()) {
      this.track.spawn(this.generator.next(difficultyAt(this.elapsed)), this.pickPickup)
    }
  }

  private choosePickup(_slot: ChunkSlot): PickupChoice | null {
    if (this.missingWeights.length > 0 && this.rng.next() < tuning.goldWeights.spawnChance) {
      const [weightId] = this.missingWeights.splice(this.rng.int(this.missingWeights.length), 1)
      if (weightId) return { type: 'goldWeight', weightId }
    }
    if (this.rng.next() >= pu.spawnChance) return null
    let roll = this.rng.next() * powerUpWeightTotal
    for (const id of POWER_UPS) {
      roll -= pu.weights[id]
      if (roll < 0) return { type: 'powerUp', powerUp: id }
    }
    return { type: 'powerUp', powerUp: 'magnet' }
  }

  private updatePowerUps(dt: number, travel: number): void {
    for (const id of this.powerUps.step(dt)) {
      if (id === 'webSwing') this.endSwing()
      this.emit({ type: 'powerUpEnd', id })
    }
    if (this.powerUps.isActive('webSwing')) this.spawnSkyGold(travel)
  }

  private activatePowerUp(id: PowerUpId): void {
    this.stats.powerUps++
    const wasSwinging = this.powerUps.isActive('webSwing')
    this.powerUps.activate(id)
    if (id === 'webSwing' && !wasSwinging) {
      this.player.setFlying(true)
      this.skyCursor = -14
      this.skyLane = this.player.lane
      this.skyCount = 0
    }
    this.emit({ type: 'powerUp', id })
  }

  private endSwing(): void {
    this.player.setFlying(false)
    this.track.clearObstacles(-pu.swingClearRange, halfDepth + 2)
    this.invulnerableTimer = Math.max(this.invulnerableTimer, pu.landingGrace)
  }

  private spawnSkyGold(travel: number): void {
    this.skyCursor += travel
    const remaining = this.powerUps.remaining.webSwing
    while (this.skyCursor > -pu.swingGoldAhead && -this.skyCursor / this.speed < remaining - 0.4) {
      this.track.spawnGold(laneToX(this.skyLane), pu.swingHeight + 0.6, this.skyCursor)
      this.skyCursor -= tuning.gold.spacing
      if (++this.skyCount % pu.swingLaneRun === 0) {
        this.skyLane = clampLane(this.skyLane + (this.rng.next() < 0.5 ? -1 : 1))
      }
    }
  }

  private supportUnderPlayer(): number {
    const { player, span } = this
    span.minX = player.x - halfWidth
    span.maxX = player.x + halfWidth
    return this.track.supportHeight(span, player.y)
  }

  private trackRooftops(): void {
    const { player } = this
    const support = player.grounded ? player.support : 0
    if (support >= rooftopHeight && this.lastSupport < rooftopHeight) this.stats.rooftops++
    this.lastSupport = support
  }

  private updateTimers(dt: number): void {
    this.sideGraceTimer = Math.max(0, this.sideGraceTimer - dt)
    this.invulnerableTimer = Math.max(0, this.invulnerableTimer - dt)
    if (this.stumbleTimer <= 0) return
    this.stumbleTimer -= dt
    if (this.stumbleTimer <= 0 && this.phase === 'stumbled') this.setPhase('running')
  }

  private resolveCollisions(): void {
    const { player, now, before, overlapNow, overlapBefore } = this
    this.fillBox(now, player.x, player.y, player.height)
    this.fillBox(before, player.prevX, player.prevY, player.prevHeight)

    for (const obstacle of this.track.obstacles.items) {
      if (!obstacle.active || !isSolid(obstacle.kind)) continue
      this.axisOverlap(obstacle, now, obstacle.x, obstacle.z, overlapNow)
      if (!(overlapNow.x && overlapNow.y && overlapNow.z)) continue
      this.axisOverlap(obstacle, before, obstacle.prevX, obstacle.prevZ, overlapBefore)

      const hit = classifyHit(overlapNow, overlapBefore)
      if (hit === 'front') {
        if (this.powerUps.shield) this.breakShield(obstacle)
        else return this.crash()
      } else if (hit === 'side' && this.sideGraceTimer <= 0) {
        this.stumble()
        if (!isActivePhase(this.phase)) return
      }
      if (this.invulnerableTimer > 0) return
    }
  }

  private fillBox(box: { x: Range; y: Range; z: Range }, x: number, y: number, height: number): void {
    box.x.min = x - halfWidth
    box.x.max = x + halfWidth
    box.y.min = y
    box.y.max = y + height
  }

  private axisOverlap(
    obstacle: Obstacle,
    box: { x: Range; y: Range; z: Range },
    x: number,
    z: number,
    out: AxisOverlap,
  ): void {
    const halfObstacle = obstacleWidth(obstacle) / 2
    const halfDepthObstacle = obstacle.depth / 2
    out.x = overlaps(box.x, { min: x - halfObstacle, max: x + halfObstacle })
    out.y = overlaps(box.y, { min: obstacle.bottom, max: obstacle.top })
    out.z = overlaps(box.z, { min: z - halfDepthObstacle, max: z + halfDepthObstacle })
  }

  private breakShield(obstacle: Obstacle | null): void {
    this.powerUps.shield = false
    if (obstacle) this.track.obstacles.release(obstacle)
    this.invulnerableTimer = pu.shieldGrace
    this.emit({ type: 'shieldBreak' })
  }

  private stumble(): void {
    this.stats.stumbles++
    this.cleanDistance = 0
    this.emit({ type: 'stumble' })
    if (this.stumbleTimer > 0) {
      if (this.powerUps.shield) {
        this.player.bounceBack()
        return this.breakShield(null)
      }
      return this.crash()
    }
    this.player.bounceBack()
    this.stumbleTimer = tuning.stumble.window
    this.sideGraceTimer = sideGrace
    this.chaser.alert(tuning.stumble.window)
    this.setPhase('stumbled')
  }

  private crash(): void {
    this.crashTimer = tuning.crash.gameOverDelay
    this.crashElapsed = this.elapsed
    this.chaser.catch()
    this.emit({ type: 'crash' })
    this.setPhase('crashed')
  }

  private countDodges(): void {
    const { player } = this
    for (const obstacle of this.track.obstacles.items) {
      if (!obstacle.active || obstacle.passed || obstacle.z - obstacle.depth / 2 <= halfDepth) continue
      obstacle.passed = true
      if (player.flying || obstacle.motion !== 'none' || Math.abs(obstacle.x - player.x) > dodgeReach)
        continue
      if (obstacle.kind === 'high') this.stats.dodgedHigh++
      else if (obstacle.kind === 'low') this.stats.dodgedLow++
    }
  }

  private pullGold(dt: number): void {
    const { player } = this
    const targetY = player.y + player.height / 2
    for (const gold of this.track.gold.items) {
      if (!gold.active || gold.z < -pu.magnetRange || gold.z > 1) continue
      gold.x += (player.x - gold.x) * (1 - Math.exp(-pu.magnetLambda * dt))
      gold.y += (targetY - gold.y) * (1 - Math.exp(-pu.magnetLambda * dt))
    }
  }

  private collectGold(): void {
    const { player } = this
    const reach = tuning.gold.pickupHalfSize
    const value = tuning.gold.valuePerPickup * (this.drumActive ? pu.drumMultiplier : 1)
    for (const gold of this.track.gold.items) {
      if (!gold.active) continue
      if (Math.abs(gold.z) > reach || Math.abs(gold.x - player.x) > reach) continue
      if (gold.y < player.y - reach * 0.5 || gold.y > player.y + player.height + reach * 0.5) continue
      this.track.gold.release(gold)
      this.gold += value
      this.emit({ type: 'gold', total: this.gold })
    }
  }

  private collectPickups(): void {
    const { player } = this
    const reach = pu.pickupHalfSize
    for (const pickup of this.track.pickups.items) {
      if (!pickup.active) continue
      if (Math.abs(pickup.z) > reach || Math.abs(pickup.x - player.x) > reach) continue
      if (pickup.y < player.y - reach * 0.5 || pickup.y > player.y + player.height + reach * 0.5) continue
      this.track.pickups.release(pickup)
      if (pickup.type === 'powerUp') {
        this.activatePowerUp(pickup.powerUp)
      } else if (!this.stats.goldWeights.includes(pickup.weightId)) {
        this.stats.goldWeights.push(pickup.weightId)
        this.emit({ type: 'goldWeight', id: pickup.weightId })
      }
    }
  }

  private recordSnapshot(dt: number): void {
    this.snapshotTimer -= dt
    if (this.snapshotTimer > 0) return
    this.snapshotTimer = tuning.sankofa.snapshotInterval
    const snap = this.snapshots[this.snapshotHead]!
    this.capture(snap)
    this.snapshotHead = (this.snapshotHead + 1) % this.snapshots.length
    this.snapshotCount = Math.min(this.snapshotCount + 1, this.snapshots.length)
  }

  private capture(snap: SimSnapshot): void {
    snap.elapsed = this.elapsed
    snap.distance = this.distance
    snap.speed = this.speed
    snap.gold = this.gold
    snap.scoreAccum = this.scoreAccum
    snap.cleanDistance = this.cleanDistance
    snap.lastSupport = this.lastSupport
    snap.skyCursor = this.skyCursor
    snap.skyLane = this.skyLane
    snap.skyCount = this.skyCount
    snap.rngState = this.rng.getState()
    snap.spawnCursor = this.track.spawnCursor
    snap.scroll = this.track.scroll
    snap.spawned = this.track.spawned
    copyStrings(snap.recent, this.generator.recent)
    copyStrings(snap.missingWeights, this.missingWeights)
    copyStats(snap.stats, this.stats)
    Object.assign(snap.player, this.player)
    snap.powerUps.copyFrom(this.powerUps)
    Object.assign(snap.chaser, this.chaser)
    savePool(this.track.obstacles, snap.obstacles)
    savePool(this.track.gold, snap.goldItems)
    savePool(this.track.pickups, snap.pickups)
  }

  private restore(snap: SimSnapshot): void {
    this.elapsed = snap.elapsed
    this.distance = snap.distance
    this.speed = snap.speed
    this.gold = snap.gold
    this.scoreAccum = snap.scoreAccum
    this.cleanDistance = snap.cleanDistance
    this.lastSupport = snap.lastSupport
    this.skyCursor = snap.skyCursor
    this.skyLane = snap.skyLane as LaneIndex
    this.skyCount = snap.skyCount
    this.rng.setState(snap.rngState)
    this.track.spawnCursor = snap.spawnCursor
    this.track.scroll = snap.scroll
    this.track.spawned = snap.spawned
    copyStrings(this.generator.recent, snap.recent)
    copyStrings(this.missingWeights, snap.missingWeights)
    copyStats(this.stats, snap.stats)
    Object.assign(this.player, snap.player)
    this.powerUps.copyFrom(snap.powerUps)
    Object.assign(this.chaser, snap.chaser)
    loadPool(this.track.obstacles, snap.obstacles)
    loadPool(this.track.gold, snap.goldItems)
    loadPool(this.track.pickups, snap.pickups)
  }

  private emit(event: RunEvent): void {
    this.listener?.(event)
  }

  private setPhase(phase: RunPhase): void {
    if (this.phase === phase) return
    this.phase = phase
    this.emit({ type: 'phase', phase })
  }
}
