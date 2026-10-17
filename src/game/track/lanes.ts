import { tuning } from '@/config/tuning'

export type LaneIndex = 0 | 1 | 2

export const LANES: readonly LaneIndex[] = [0, 1, 2]

export const laneToX = (lane: LaneIndex): number => (lane - 1) * tuning.lanes.width

export const clampLane = (lane: number): LaneIndex => Math.min(2, Math.max(0, Math.round(lane))) as LaneIndex
