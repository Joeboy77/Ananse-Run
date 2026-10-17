import type { RunPhase } from '@/game/loop/runPhase'

export type ClipName =
  | 'idle'
  | 'menu_idle'
  | 'run'
  | 'jump'
  | 'slide'
  | 'strafe_left'
  | 'strafe_right'
  | 'stumble'
  | 'crash'
  | 'swing'
  | 'victory'

export interface AnimationInput {
  phase: RunPhase
  flying: boolean
  sliding: boolean
  grounded: boolean
  switching: boolean
  direction: number
  stumbleRecent: boolean
}

export const LOOPING_CLIPS: ReadonlySet<ClipName> = new Set(['idle', 'menu_idle', 'run', 'swing', 'victory'])

const fallbacks: Record<ClipName, readonly ClipName[]> = {
  idle: ['menu_idle', 'run'],
  menu_idle: ['idle', 'run'],
  run: ['idle'],
  jump: ['run'],
  slide: ['run'],
  strafe_left: ['run'],
  strafe_right: ['run'],
  stumble: ['run'],
  crash: ['idle'],
  swing: ['jump', 'run'],
  victory: ['idle', 'menu_idle'],
}

export const clipFor = (input: AnimationInput): ClipName => {
  if (input.phase === 'menu') return 'menu_idle'
  if (input.phase === 'crashed' || input.phase === 'gameover') return 'crash'
  if (input.flying) return 'swing'
  if (input.stumbleRecent) return 'stumble'
  if (input.sliding) return 'slide'
  if (!input.grounded) return 'jump'
  if (input.switching) return input.direction < 0 ? 'strafe_left' : 'strafe_right'
  return 'run'
}

export const resolveClip = (wanted: ClipName, available: ReadonlySet<string>): string | null => {
  if (available.has(wanted)) return wanted
  for (const fallback of fallbacks[wanted]) if (available.has(fallback)) return fallback
  const [first] = available
  return first ?? null
}
