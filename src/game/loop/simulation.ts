import { tuning } from '@/config/tuning'
import { createRng, type Rng } from '@/game/core/rng'
import { classifyHit, overlaps, type AxisOverlap, type Range } from '@/game/obstacles/collision'
import type { Obstacle } from '@/game/obstacles/types'
import type { PlayerAction } from '@/game/player/actions'
import { InputBuffer } from '@/game/player/inputBuffer'
import { Player } from '@/game/player/player'
import { chunks, startChunk } from '@/game/track/chunks'
import { ChunkGenerator, difficultyAt } from '@/game/track/generator'
import { Track, type Span } from '@/game/track/track'
import { isActivePhase, type RunPhase } from './runPhase'
import { speedAt } from './speed'

export type RunEvent =
  | { type: 'phase'; phase: RunPhase }
  | { type: 'stumble' }
  | { type: 'crash' }
  | { type: 'gold'; total: number }

const { halfWidth, halfDepth } = tuning.player
const { pickupHalfSize } = tuning.gold
const stumbleGrace = 0.3

export class RunSimulation {
  readonly player = new Player()
  readonly track = new Track()
  phase: RunPhase = 'menu'
  elapsed = 0
  distance = 0
  speed: number = tuning.speed.start
  gold = 0
  seed: number

  private rng: Rng
  private generator: ChunkGenerator
  private readonly input = new InputBuffer(tuning.input.bufferMs / 1000)
  private stumbleTimer = 0
  private graceTimer = 0
  private crashTimer = 0
  private listener: ((event: RunEvent) => void) | null = null
  private readonly span: Span = { minX: 0, maxX: 0, minZ: -halfDepth, maxZ: halfDepth }
  private readonly runAction = (action: PlayerAction) => this.player.tryAction(action)

  constructor(seed: number) {
    this.seed = seed
    this.rng = createRng(seed)
    this.generator = new ChunkGenerator(chunks, this.rng)
    this.reset(seed)
  }

  get score(): number {
    return Math.floor(this.distance * tuning.score.perUnit)
  }

  onEvent(listener: ((event: RunEvent) => void) | null): void {
    this.listener = listener
  }

  reset(seed: number): void {
    this.seed = seed
    this.rng = createRng(seed)
    this.generator = new ChunkGenerator(chunks, this.rng)
    this.player.reset()
    this.track.reset()
    this.input.clear()
    this.elapsed = 0
    this.distance = 0
    this.speed = tuning.speed.start
    this.gold = 0
    this.stumbleTimer = 0
    this.graceTimer = 0
    this.crashTimer = 0
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

  step(dt: number): void {
    if (this.phase === 'crashed') {
      this.crashTimer -= dt
      if (this.crashTimer <= 0) this.setPhase('gameover')
      return
    }
    if (!isActivePhase(this.phase)) return

    this.elapsed += dt
    this.speed = speedAt(this.elapsed)
    const travel = this.speed * dt
    this.distance += travel
    this.track.advance(travel)
    this.fillTrack()

    this.input.consume(this.runAction, dt)
    this.player.step(dt, this.supportUnderPlayer())

    this.updateStumble(dt)
    this.resolveCollisions(travel)
    this.collectGold()
  }

  private fillTrack(): void {
    while (this.track.needsChunk()) this.track.spawn(this.generator.next(difficultyAt(this.elapsed)))
  }

  private supportUnderPlayer(): number {
    const { player, span } = this
    span.minX = player.x - halfWidth
    span.maxX = player.x + halfWidth
    return this.track.supportHeight(span, player.y)
  }

  private updateStumble(dt: number): void {
    this.graceTimer = Math.max(0, this.graceTimer - dt)
    if (this.stumbleTimer <= 0) return
    this.stumbleTimer -= dt
    if (this.stumbleTimer <= 0 && this.phase === 'stumbled') this.setPhase('running')
  }

  private resolveCollisions(travel: number): void {
    const { player } = this
    const now = this.ranges(player.x, player.y, player.height)
    const before = this.ranges(player.prevX, player.prevY, player.prevHeight)
    const current: AxisOverlap = { x: false, y: false, z: false }
    const previous: AxisOverlap = { x: false, y: false, z: false }

    for (const obstacle of this.track.obstacles.items) {
      if (!obstacle.active) continue
      this.axisOverlap(obstacle, now, obstacle.z, current)
      if (!(current.x && current.y && current.z)) continue
      this.axisOverlap(obstacle, before, obstacle.z - travel, previous)

      const hit = classifyHit(current, previous)
      if (hit === 'front') return this.crash()
      if (hit === 'side' && this.graceTimer <= 0) {
        this.stumble()
        if (!isActivePhase(this.phase)) return
      }
    }
  }

  private ranges(x: number, y: number, height: number): { x: Range; y: Range; z: Range } {
    return {
      x: { min: x - halfWidth, max: x + halfWidth },
      y: { min: y, max: y + height },
      z: { min: -halfDepth, max: halfDepth },
    }
  }

  private axisOverlap(
    obstacle: Obstacle,
    box: { x: Range; y: Range; z: Range },
    z: number,
    out: AxisOverlap,
  ): void {
    const halfWidthObstacle = tuning.obstacles.width / 2
    out.x = overlaps(box.x, { min: obstacle.x - halfWidthObstacle, max: obstacle.x + halfWidthObstacle })
    out.y = overlaps(box.y, { min: obstacle.bottom, max: obstacle.top })
    out.z = overlaps(box.z, { min: z - obstacle.depth / 2, max: z + obstacle.depth / 2 })
  }

  private stumble(): void {
    this.listener?.({ type: 'stumble' })
    if (this.stumbleTimer > 0) return this.crash()
    this.player.bounceBack()
    this.stumbleTimer = tuning.stumble.window
    this.graceTimer = stumbleGrace
    this.setPhase('stumbled')
  }

  private crash(): void {
    this.crashTimer = tuning.crash.gameOverDelay
    this.listener?.({ type: 'crash' })
    this.setPhase('crashed')
  }

  private collectGold(): void {
    const { player } = this
    for (const gold of this.track.gold.items) {
      if (!gold.active) continue
      if (Math.abs(gold.z) > pickupHalfSize || Math.abs(gold.x - player.x) > pickupHalfSize) continue
      if (
        gold.y < player.y - pickupHalfSize * 0.5 ||
        gold.y > player.y + player.height + pickupHalfSize * 0.5
      )
        continue
      this.track.gold.release(gold)
      this.gold += tuning.gold.valuePerPickup
      this.listener?.({ type: 'gold', total: this.gold })
    }
  }

  private setPhase(phase: RunPhase): void {
    if (this.phase === phase) return
    this.phase = phase
    this.listener?.({ type: 'phase', phase })
  }
}
