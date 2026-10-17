export type RunPhase = 'menu' | 'running' | 'stumbled' | 'crashed' | 'gameover'

export const isActivePhase = (phase: RunPhase): boolean => phase === 'running' || phase === 'stumbled'
