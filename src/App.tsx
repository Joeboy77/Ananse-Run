import { lazy, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { graphics } from '@/config/graphics'
import { isDebug } from '@/debug/isDebug'
import { World } from '@/scenes/World'
import { RunScene } from '@/scenes/RunScene'
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
        camera={{ fov: 60, near: 0.1, far: 200, position: [0, 4.2, 7.5] }}
        onCreated={({ camera }) => camera.lookAt(0, 1.2, -8)}
      >
        <World />
        <RunScene />
        {debug && (
          <Suspense fallback={null}>
            <PerfProbe />
          </Suspense>
        )}
      </Canvas>
      {debug && (
        <Suspense fallback={null}>
          <DebugPanel />
        </Suspense>
      )}
    </main>
  )
}
