import type { PlayerAction } from './actions'

export const classifySwipe = (dx: number, dy: number, minDistance: number): PlayerAction | null => {
  if (Math.hypot(dx, dy) < minDistance) return null
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'right' : 'left'
  return dy > 0 ? 'slide' : 'jump'
}
