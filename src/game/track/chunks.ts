import type { ChunkDef } from './chunkTypes'

export const startChunk: ChunkDef = {
  id: 'start',
  difficulty: 0,
  obstacles: [],
  gold: [{ lane: 1, at: 14, count: 10, pattern: 'line' }],
}

export const chunks: readonly ChunkDef[] = [
  {
    id: 'crate-row',
    difficulty: 0,
    obstacles: [
      { kind: 'low', lane: 0, at: 12 },
      { kind: 'low', lane: 1, at: 12 },
      { kind: 'low', lane: 2, at: 12 },
      { kind: 'high', lane: 1, at: 28 },
    ],
    gold: [
      { lane: 1, at: 8, count: 5, pattern: 'arc' },
      { lane: 0, at: 22, count: 6, pattern: 'line' },
    ],
    slots: [{ lane: 2, at: 30 }],
  },
  {
    id: 'slalom',
    difficulty: 0,
    obstacles: [
      { kind: 'full', lane: 0, at: 8, length: 6 },
      { kind: 'full', lane: 2, at: 20, length: 6 },
      { kind: 'full', lane: 0, at: 30, length: 6 },
    ],
    gold: [
      { lane: 1, at: 6, count: 5, pattern: 'line' },
      { lane: 0, at: 18, count: 5, pattern: 'line' },
      { lane: 2, at: 28, count: 5, pattern: 'line' },
    ],
    slots: [{ lane: 1, at: 22 }],
  },
  {
    id: 'gold-lanes',
    difficulty: 0,
    obstacles: [
      { kind: 'low', lane: 1, at: 20 },
      { kind: 'high', lane: 2, at: 30 },
    ],
    gold: [
      { lane: 0, at: 4, count: 10, pattern: 'line' },
      { lane: 1, at: 16, count: 5, pattern: 'arc' },
      { lane: 2, at: 6, count: 8, pattern: 'line' },
    ],
    slots: [{ lane: 0, at: 26 }],
  },
  {
    id: 'awnings',
    difficulty: 1,
    obstacles: [
      { kind: 'high', lane: 0, at: 12 },
      { kind: 'high', lane: 1, at: 12 },
      { kind: 'high', lane: 2, at: 22 },
      { kind: 'low', lane: 1, at: 30 },
    ],
    gold: [
      { lane: 1, at: 6, count: 4, pattern: 'line' },
      { lane: 1, at: 26, count: 5, pattern: 'arc' },
    ],
    slots: [{ lane: 0, at: 30 }],
  },
  {
    id: 'trotro-gate',
    difficulty: 1,
    obstacles: [
      { kind: 'full', lane: 0, at: 8, length: 8 },
      { kind: 'full', lane: 2, at: 8, length: 8 },
      { kind: 'low', lane: 1, at: 12 },
      { kind: 'high', lane: 1, at: 28 },
    ],
    gold: [
      { lane: 1, at: 8, count: 5, pattern: 'arc' },
      { lane: 2, at: 22, count: 6, pattern: 'line' },
    ],
    slots: [{ lane: 0, at: 32 }],
  },
  {
    id: 'rooftop',
    difficulty: 1,
    obstacles: [
      { kind: 'platform', lane: 1, at: 10, length: 16 },
      { kind: 'full', lane: 0, at: 12, length: 8 },
      { kind: 'low', lane: 2, at: 18 },
    ],
    gold: [
      { lane: 1, at: 12, count: 7, pattern: 'line', elevated: true },
      { lane: 2, at: 14, count: 5, pattern: 'arc' },
    ],
    slots: [{ lane: 1, at: 24, elevated: true }],
  },
  {
    id: 'ramp-roof',
    difficulty: 1,
    obstacles: [
      { kind: 'ramp', lane: 1, at: 6, length: 6 },
      { kind: 'platform', lane: 1, at: 12, length: 18 },
      { kind: 'full', lane: 0, at: 10, length: 8 },
      { kind: 'high', lane: 2, at: 20 },
    ],
    gold: [
      { lane: 1, at: 14, count: 8, pattern: 'line', elevated: true },
      { lane: 2, at: 6, count: 5, pattern: 'line' },
    ],
    slots: [{ lane: 1, at: 30, elevated: true }],
  },
  {
    id: 'mixed-pair',
    difficulty: 2,
    obstacles: [
      { kind: 'low', lane: 0, at: 8 },
      { kind: 'high', lane: 1, at: 8 },
      { kind: 'full', lane: 2, at: 6, length: 6 },
      { kind: 'full', lane: 0, at: 22, length: 6 },
      { kind: 'low', lane: 1, at: 24 },
      { kind: 'high', lane: 2, at: 24 },
    ],
    gold: [
      { lane: 0, at: 4, count: 5, pattern: 'arc' },
      { lane: 2, at: 18, count: 5, pattern: 'line' },
    ],
    slots: [{ lane: 1, at: 32 }],
  },
  {
    id: 'zigzag',
    difficulty: 2,
    obstacles: [
      { kind: 'full', lane: 1, at: 6, length: 6 },
      { kind: 'full', lane: 0, at: 18, length: 6 },
      { kind: 'full', lane: 2, at: 18, length: 6 },
      { kind: 'full', lane: 1, at: 30, length: 6 },
    ],
    gold: [
      { lane: 0, at: 6, count: 4, pattern: 'line' },
      { lane: 1, at: 16, count: 6, pattern: 'line' },
      { lane: 2, at: 30, count: 4, pattern: 'line' },
    ],
  },
  {
    id: 'twin-roofs',
    difficulty: 2,
    obstacles: [
      { kind: 'platform', lane: 0, at: 6, length: 14 },
      { kind: 'platform', lane: 2, at: 6, length: 14 },
      { kind: 'low', lane: 1, at: 10 },
      { kind: 'high', lane: 1, at: 22 },
      { kind: 'full', lane: 0, at: 28, length: 6 },
    ],
    gold: [
      { lane: 0, at: 8, count: 6, pattern: 'line', elevated: true },
      { lane: 2, at: 8, count: 6, pattern: 'line', elevated: true },
      { lane: 2, at: 26, count: 4, pattern: 'line' },
    ],
    slots: [{ lane: 2, at: 18, elevated: true }],
  },
  {
    id: 'okada-cross',
    difficulty: 2,
    obstacles: [
      { kind: 'low', lane: 2, at: 10 },
      { kind: 'okada', lane: 0, at: 22 },
      { kind: 'high', lane: 1, at: 32 },
    ],
    gold: [
      { lane: 1, at: 4, count: 8, pattern: 'line' },
      { lane: 2, at: 6, count: 5, pattern: 'arc' },
    ],
    slots: [{ lane: 0, at: 8 }],
  },
  {
    id: 'oncoming-trotro',
    difficulty: 2,
    obstacles: [
      { kind: 'oncoming', lane: 0, at: 30 },
      { kind: 'high', lane: 1, at: 14 },
      { kind: 'low', lane: 2, at: 24 },
    ],
    gold: [
      { lane: 2, at: 4, count: 6, pattern: 'line' },
      { lane: 1, at: 22, count: 6, pattern: 'line' },
    ],
    slots: [{ lane: 1, at: 34 }],
  },
  {
    id: 'gauntlet',
    difficulty: 3,
    obstacles: [
      { kind: 'low', lane: 0, at: 6 },
      { kind: 'low', lane: 1, at: 10 },
      { kind: 'low', lane: 2, at: 14 },
      { kind: 'high', lane: 0, at: 20 },
      { kind: 'high', lane: 1, at: 24 },
      { kind: 'high', lane: 2, at: 28 },
      { kind: 'full', lane: 1, at: 32, length: 4 },
    ],
    gold: [
      { lane: 1, at: 6, count: 5, pattern: 'arc' },
      { lane: 0, at: 30, count: 3, pattern: 'line' },
    ],
  },
  {
    id: 'blockade',
    difficulty: 3,
    obstacles: [
      { kind: 'full', lane: 0, at: 6, length: 10 },
      { kind: 'full', lane: 1, at: 6, length: 10 },
      { kind: 'low', lane: 2, at: 10 },
      { kind: 'full', lane: 2, at: 22, length: 10 },
      { kind: 'full', lane: 1, at: 22, length: 10 },
      { kind: 'high', lane: 0, at: 26 },
    ],
    gold: [
      { lane: 2, at: 6, count: 5, pattern: 'arc' },
      { lane: 0, at: 20, count: 5, pattern: 'line' },
    ],
    slots: [{ lane: 0, at: 34 }],
  },
  {
    id: 'oncoming-gate',
    difficulty: 3,
    obstacles: [
      { kind: 'full', lane: 2, at: 8, length: 8 },
      { kind: 'oncoming', lane: 1, at: 30 },
      { kind: 'low', lane: 0, at: 24 },
    ],
    gold: [
      { lane: 0, at: 6, count: 8, pattern: 'line' },
      { lane: 0, at: 22, count: 5, pattern: 'arc' },
    ],
  },
  {
    id: 'roof-run',
    difficulty: 3,
    obstacles: [
      { kind: 'ramp', lane: 2, at: 4, length: 6 },
      { kind: 'platform', lane: 2, at: 10, length: 24 },
      { kind: 'full', lane: 1, at: 14, length: 8 },
      { kind: 'high', lane: 0, at: 20 },
    ],
    gold: [
      { lane: 2, at: 12, count: 11, pattern: 'line', elevated: true },
      { lane: 0, at: 8, count: 4, pattern: 'line' },
    ],
    slots: [{ lane: 2, at: 30, elevated: true }],
  },
  {
    id: 'rush-hour',
    difficulty: 4,
    obstacles: [
      { kind: 'oncoming', lane: 0, at: 28 },
      { kind: 'oncoming', lane: 2, at: 26 },
      { kind: 'low', lane: 1, at: 10 },
      { kind: 'high', lane: 1, at: 22 },
    ],
    gold: [
      { lane: 1, at: 6, count: 5, pattern: 'arc' },
      { lane: 1, at: 26, count: 5, pattern: 'line' },
    ],
  },
  {
    id: 'okada-double',
    difficulty: 4,
    obstacles: [
      { kind: 'okada', lane: 0, at: 12 },
      { kind: 'full', lane: 1, at: 18, length: 6 },
      { kind: 'okada', lane: 2, at: 28 },
    ],
    gold: [
      { lane: 0, at: 18, count: 5, pattern: 'line' },
      { lane: 2, at: 6, count: 5, pattern: 'line' },
    ],
    slots: [{ lane: 1, at: 30 }],
  },
]
