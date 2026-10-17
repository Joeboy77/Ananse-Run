import { tuning } from '@/config/tuning'
import type { ChunkDef, ChunkPiece } from './chunkTypes'
import { LANES } from './lanes'
import { pieceLength } from './pieces'

const { chunkLength, edgeMargin } = tuning.track

const blockedSpan = (piece: ChunkPiece): [number, number] | null => {
  const end = piece.at + pieceLength(piece)
  if (piece.kind === 'full') return [piece.at, end]
  if (piece.kind === 'oncoming') return [Math.max(0, piece.at - tuning.moving.oncomingPathAllowance), end]
  return null
}

export const blockedRows = (chunk: ChunkDef): boolean[][] =>
  LANES.map((lane) => {
    const rows = Array.from({ length: chunkLength }, () => false)
    for (const piece of chunk.obstacles) {
      if (piece.lane !== lane) continue
      const span = blockedSpan(piece)
      if (!span) continue
      for (let row = Math.floor(span[0]); row < Math.ceil(span[1]); row++) rows[row] = true
    }
    return rows
  })

export const hasClearPath = (chunk: ChunkDef): boolean => {
  const blocked = blockedRows(chunk)
  const free = (lane: number, row: number) => !blocked[lane]![row]
  let reachable = LANES.map((lane) => free(lane, 0))
  if (!reachable.some(Boolean)) return false

  for (let row = 1; row < chunkLength; row++) {
    reachable = LANES.map((lane) => {
      if (!free(lane, row)) return false
      if (reachable[lane]) return true
      return [lane - 1, lane + 1].some(
        (from) =>
          from >= 0 && from < LANES.length && reachable[from] && free(from, row) && free(lane, row - 1),
      )
    })
    if (!reachable.some(Boolean)) return false
  }
  return true
}

export const respectsEdges = (chunk: ChunkDef): boolean =>
  chunk.obstacles.every(
    (piece) => piece.at >= edgeMargin && piece.at + pieceLength(piece) <= chunkLength - edgeMargin,
  ) &&
  chunk.gold.every(
    (gold) => gold.at >= 0 && gold.at + (gold.count - 1) * tuning.gold.spacing <= chunkLength,
  ) &&
  (chunk.slots ?? []).every((slot) => slot.at >= 0 && slot.at <= chunkLength)
