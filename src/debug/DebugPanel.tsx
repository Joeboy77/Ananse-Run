import { useStore } from 'zustand'
import { budgets } from '@/config/budgets'
import { perfStore } from './perfStore'
import styles from './DebugPanel.module.css'

const formatCount = (value: number) => (value >= 1000 ? `${(value / 1000).toFixed(1)}k` : String(value))

export function DebugPanel() {
  const perf = useStore(perfStore)
  const fpsState =
    perf.fps >= budgets.fps.target - 5 ? 'good' : perf.fps >= budgets.fps.minimum ? 'warn' : 'bad'

  return (
    <aside className={styles.panel} aria-label="Performance">
      <Row label="FPS" value={String(perf.fps)} state={fpsState} />
      <Row label="Min" value={String(perf.minFps)} />
      <Row label="ms" value={String(perf.frameMs)} />
      <Row
        label="Calls"
        value={String(perf.drawCalls)}
        state={perf.drawCalls > budgets.drawCalls.high ? 'bad' : undefined}
      />
      <Row
        label="Tris"
        value={formatCount(perf.triangles)}
        state={perf.triangles > budgets.triangles.high ? 'bad' : undefined}
      />
      <Row label="Geo" value={String(perf.geometries)} />
      <Row label="Tex" value={String(perf.textures)} />
      <Row label="DPR" value={perf.pixelRatio.toFixed(2)} />
      {perf.memoryMb !== null && <Row label="Heap" value={`${perf.memoryMb} MB`} />}
    </aside>
  )
}

interface RowProps {
  label: string
  value: string
  state?: 'good' | 'warn' | 'bad'
}

function Row({ label, value, state }: RowProps) {
  return (
    <div className={styles.row}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value} data-state={state}>
        {value}
      </span>
    </div>
  )
}
