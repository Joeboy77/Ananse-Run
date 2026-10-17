import { createStore } from 'zustand/vanilla'

export interface PerfSnapshot {
  fps: number
  minFps: number
  frameMs: number
  drawCalls: number
  triangles: number
  geometries: number
  textures: number
  pixelRatio: number
  memoryMb: number | null
}

export const perfStore = createStore<PerfSnapshot>(() => ({
  fps: 0,
  minFps: 0,
  frameMs: 0,
  drawCalls: 0,
  triangles: 0,
  geometries: 0,
  textures: 0,
  pixelRatio: 1,
  memoryMb: null,
}))
