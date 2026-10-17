export const budgets = {
  fps: { target: 60, minimum: 45 },
  drawCalls: { high: 120, low: 70 },
  triangles: { high: 300_000, low: 120_000 },
  memoryMb: 400,
} as const
