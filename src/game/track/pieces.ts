import { tuning } from '@/config/tuning'
import type { ChunkPiece, PieceKind } from './chunkTypes'

const defaultLengths: Record<PieceKind, number> = {
  low: tuning.obstacles.low.depth,
  high: tuning.obstacles.high.depth,
  full: 6,
  platform: 12,
  ramp: 6,
  oncoming: 6,
  okada: tuning.moving.okadaDepth,
}

export const pieceLength = (piece: ChunkPiece): number => piece.length ?? defaultLengths[piece.kind]
