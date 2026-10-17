import { describe, expect, it } from 'vitest'
import { classifySwipe } from './swipe'

describe('swipe', () => {
  it('ignores taps and short drags', () => {
    expect(classifySwipe(5, 8, 30)).toBeNull()
  })

  it('maps directions to actions', () => {
    expect(classifySwipe(40, 5, 30)).toBe('right')
    expect(classifySwipe(-40, 5, 30)).toBe('left')
    expect(classifySwipe(3, -40, 30)).toBe('jump')
    expect(classifySwipe(3, 40, 30)).toBe('slide')
  })
})
