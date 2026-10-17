import { tuning } from '@/config/tuning'

const { start, max, rampAmount, rampInterval, easeBand } = tuning.speed
const easeStart = max - easeBand

export const speedAt = (elapsed: number): number => {
  const linear = start + (rampAmount / rampInterval) * elapsed
  if (linear <= easeStart) return linear
  return max - easeBand * Math.exp(-(linear - easeStart) / easeBand)
}
