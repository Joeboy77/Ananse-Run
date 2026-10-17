import { describe, expect, it } from 'vitest'
import { chunks, startChunk } from './chunks'
import { hasClearPath, respectsEdges } from './pathCheck'
import type { ChunkDef } from './chunkTypes'

describe('chunk validation', () => {
  it.each([startChunk, ...chunks].map((chunk) => [chunk.id, chunk] as const))(
    '%s has a clear path and respects the edges',
    (_, chunk) => {
      expect(hasClearPath(chunk)).toBe(true)
      expect(respectsEdges(chunk)).toBe(true)
    },
  )

  it('has unique ids', () => {
    const ids = chunks.map((chunk) => chunk.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('rejects a chunk with every lane blocked', () => {
    const wall: ChunkDef = {
      id: 'wall',
      difficulty: 0,
      obstacles: [0, 1, 2].map((lane) => ({ kind: 'full', lane: lane as 0 | 1 | 2, at: 10, length: 4 })),
      gold: [],
    }
    expect(hasClearPath(wall)).toBe(false)
  })

  it('treats an oncoming trotro as blocking its lane well before its start', () => {
    const chunk: ChunkDef = {
      id: 'oncoming-wall',
      difficulty: 0,
      obstacles: [
        { kind: 'oncoming', lane: 0, at: 30 },
        { kind: 'full', lane: 1, at: 10, length: 20 },
        { kind: 'full', lane: 2, at: 10, length: 20 },
      ],
      gold: [],
    }
    expect(hasClearPath(chunk)).toBe(false)
  })

  it('rejects a chunk where the only gap cannot be reached in time', () => {
    const trap: ChunkDef = {
      id: 'trap',
      difficulty: 0,
      obstacles: [
        { kind: 'full', lane: 0, at: 10, length: 10 },
        { kind: 'full', lane: 1, at: 10, length: 10 },
        { kind: 'full', lane: 2, at: 5, length: 5 },
        { kind: 'full', lane: 2, at: 10, length: 2 },
      ],
      gold: [],
    }
    expect(hasClearPath(trap)).toBe(false)
  })
})
