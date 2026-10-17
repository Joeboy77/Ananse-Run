import { describe, expect, it } from 'vitest'
import { InputBuffer } from './inputBuffer'

describe('input buffer', () => {
  it('runs an action as soon as it is allowed', () => {
    const buffer = new InputBuffer(0.15)
    const ran: string[] = []
    buffer.push('jump')
    buffer.consume((action) => (ran.push(action), true), 1 / 60)
    expect(ran).toEqual(['jump'])
    expect(buffer.size).toBe(0)
  })

  it('keeps a blocked action until it expires', () => {
    const buffer = new InputBuffer(0.15)
    buffer.push('jump')
    for (let i = 0; i < 8; i++) buffer.consume(() => false, 1 / 60)
    expect(buffer.size).toBe(1)
    for (let i = 0; i < 2; i++) buffer.consume(() => false, 1 / 60)
    expect(buffer.size).toBe(0)
  })

  it('runs a buffered action once it becomes allowed', () => {
    const buffer = new InputBuffer(0.15)
    let grounded = false
    let jumps = 0
    buffer.push('jump')
    buffer.consume(() => grounded && ++jumps > 0, 1 / 60)
    grounded = true
    buffer.consume(() => grounded && ++jumps > 0, 1 / 60)
    expect(jumps).toBe(1)
  })
})
