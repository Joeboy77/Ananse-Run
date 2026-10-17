import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { perfStore } from './perfStore'

const SAMPLE_WINDOW_S = 0.5

interface ChromePerformance extends Performance {
  memory?: { usedJSHeapSize: number }
}

export function PerfProbe() {
  const gl = useThree((state) => state.gl)
  const acc = useRef({ time: 0, frames: 0, worstDelta: 0 })

  useEffect(() => {
    gl.info.autoReset = false
    return () => {
      gl.info.autoReset = true
    }
  }, [gl])

  useFrame((_, delta) => {
    const a = acc.current
    a.time += delta
    a.frames += 1
    a.worstDelta = Math.max(a.worstDelta, delta)

    const { render, memory } = gl.info
    const drawCalls = render.calls
    const triangles = render.triangles
    gl.info.reset()

    if (a.time < SAMPLE_WINDOW_S) return

    const heap = (performance as ChromePerformance).memory?.usedJSHeapSize
    perfStore.setState({
      fps: Math.round(a.frames / a.time),
      minFps: Math.round(1 / a.worstDelta),
      frameMs: Number(((a.time / a.frames) * 1000).toFixed(1)),
      drawCalls,
      triangles,
      geometries: memory.geometries,
      textures: memory.textures,
      pixelRatio: gl.getPixelRatio(),
      memoryMb: heap === undefined ? null : Math.round(heap / 1_048_576),
    })
    a.time = 0
    a.frames = 0
    a.worstDelta = 0
  })

  return null
}
