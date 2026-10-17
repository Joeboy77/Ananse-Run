export interface RunStats {
  score: number
  gold: number
  distance: number
  jumps: number
  slides: number
  dodgedHigh: number
  dodgedLow: number
  powerUps: number
  rooftops: number
  stumbles: number
  cleanDistanceMax: number
  goldWeights: string[]
}

export const createRunStats = (): RunStats => ({
  score: 0,
  gold: 0,
  distance: 0,
  jumps: 0,
  slides: 0,
  dodgedHigh: 0,
  dodgedLow: 0,
  powerUps: 0,
  rooftops: 0,
  stumbles: 0,
  cleanDistanceMax: 0,
  goldWeights: [],
})
