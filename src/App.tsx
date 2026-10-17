import { lazy, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { graphics } from '@/config/graphics'
import { tuning } from '@/config/tuning'
import { isDebug } from '@/debug/isDebug'
import { World } from '@/scenes/World'
import { RunScene } from '@/scenes/RunScene'
import { GameUi } from '@/ui/GameUi'
import styles from './App.module.css'

const DebugPanel = lazy(() => import('@/debug/DebugPanel').then((m) => ({ default: m.DebugPanel })))
const PerfProbe = lazy(() => import('@/debug/PerfProbe').then((m) => ({ default: m.PerfProbe })))

const debug = isDebug()

export function App() {
  return (
    <main className={styles.app}>
      <Canvas
        className={styles.canvas}
        dpr={[1, graphics.maxPixelRatio.high]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        camera={{
          fov: tuning.camera.fovMin,
          near: 0.1,
          far: 260,
          position: [0, tuning.camera.height, tuning.camera.distance],
        }}
      >
        <World />
        <RunScene />
        {debug && (
          <Suspense fallback={null}>
            <PerfProbe />
          </Suspense>
        )}
      </Canvas>
      <GameUi />
      {debug && (
        <Suspense fallback={null}>
          <DebugPanel />
        </Suspense>
      )}
    </main>
  )
}
