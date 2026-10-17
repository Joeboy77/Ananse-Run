import { useState } from 'react'
import { AnimatePresence, MotionConfig } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import { Hud } from './hud/Hud'
import { Toast } from './hud/Toast'
import { GameOverScreen } from './screens/GameOverScreen'
import { MissionsScreen } from './screens/MissionsScreen'
import { ShopScreen } from './screens/ShopScreen'
import { StartScreen } from './screens/StartScreen'

type MenuScreen = 'home' | 'shop' | 'missions'

export function GameUi() {
  const phase = useGameStore((state) => state.phase)
  const [screen, setScreen] = useState<MenuScreen>('home')
  const home = () => setScreen('home')

  return (
    <MotionConfig reducedMotion="user">
      {phase !== 'menu' && <Hud />}
      <AnimatePresence mode="wait">
        {phase === 'menu' && screen === 'home' && (
          <StartScreen
            key="start"
            onShop={() => setScreen('shop')}
            onMissions={() => setScreen('missions')}
          />
        )}
        {phase === 'menu' && screen === 'shop' && <ShopScreen key="shop" onBack={home} />}
        {phase === 'menu' && screen === 'missions' && <MissionsScreen key="missions" onBack={home} />}
        {phase === 'gameover' && <GameOverScreen key="gameover" />}
      </AnimatePresence>
      <Toast />
    </MotionConfig>
  )
}
