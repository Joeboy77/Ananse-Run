import { describe, expect, it } from 'vitest'
import { clipFor, resolveClip, type AnimationInput } from './animationState'

const base: AnimationInput = {
  phase: 'running',
  flying: false,
  sliding: false,
  grounded: true,
  switching: false,
  direction: 0,
  stumbleRecent: false,
}

describe('animation state', () => {
  it('picks a clip for each player state', () => {
    expect(clipFor({ ...base, phase: 'menu' })).toBe('menu_idle')
    expect(clipFor(base)).toBe('run')
    expect(clipFor({ ...base, grounded: false })).toBe('jump')
    expect(clipFor({ ...base, sliding: true })).toBe('slide')
    expect(clipFor({ ...base, switching: true, direction: -1 })).toBe('strafe_left')
    expect(clipFor({ ...base, switching: true, direction: 1 })).toBe('strafe_right')
    expect(clipFor({ ...base, stumbleRecent: true })).toBe('stumble')
    expect(clipFor({ ...base, flying: true, grounded: false })).toBe('swing')
    expect(clipFor({ ...base, phase: 'gameover' })).toBe('crash')
  })

  it('prefers swing over everything while flying and crash over everything after a crash', () => {
    expect(clipFor({ ...base, flying: true, sliding: true, stumbleRecent: true })).toBe('swing')
    expect(clipFor({ ...base, phase: 'crashed', flying: true })).toBe('crash')
  })

  it('falls back to a sensible clip when one is missing', () => {
    const available = new Set(['idle', 'run', 'jump'])
    expect(resolveClip('swing', available)).toBe('jump')
    expect(resolveClip('menu_idle', available)).toBe('idle')
    expect(resolveClip('strafe_left', available)).toBe('run')
    expect(resolveClip('run', new Set(['Take 001']))).toBe('Take 001')
    expect(resolveClip('run', new Set())).toBeNull()
  })
})
