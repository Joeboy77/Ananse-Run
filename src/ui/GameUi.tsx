import { AnimatePresence, MotionConfig } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import { Hud } from './hud/Hud'
import { GameOverScreen } from './screens/GameOverScreen'
import { StartScreen } from './screens/StartScreen'

export function GameUi() {
  const phase = useGameStore((state) => state.phase)

  return (
    <MotionConfig reducedMotion="user">
      {phase !== 'menu' && <Hud />}
      <AnimatePresence>
        {phase === 'menu' && <StartScreen key="start" />}
        {phase === 'gameover' && <GameOverScreen key="gameover" />}
      </AnimatePresence>
    </MotionConfig>
  )
}
