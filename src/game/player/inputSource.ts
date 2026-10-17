import { tuning } from '@/config/tuning'
import type { PlayerAction } from './actions'
import { classifySwipe } from './swipe'

export type InputCommand = PlayerAction | 'confirm'

const keyMap: Record<string, InputCommand> = {
  ArrowLeft: 'left',
  KeyA: 'left',
  ArrowRight: 'right',
  KeyD: 'right',
  ArrowUp: 'jump',
  KeyW: 'jump',
  Space: 'jump',
  ArrowDown: 'slide',
  KeyS: 'slide',
  Enter: 'confirm',
}

export const attachInput = (target: Window, onCommand: (command: InputCommand) => void): (() => void) => {
  let pointerId: number | null = null
  let startX = 0
  let startY = 0
  let fired = false

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.repeat) return
    const command = keyMap[event.code]
    if (!command) return
    event.preventDefault()
    onCommand(command)
    if (event.code === 'Space') onCommand('confirm')
  }

  const onPointerDown = (event: PointerEvent) => {
    if (pointerId !== null || (event.target instanceof Element && event.target.closest('button'))) return
    pointerId = event.pointerId
    startX = event.clientX
    startY = event.clientY
    fired = false
  }

  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerId !== pointerId || fired) return
    const action = classifySwipe(
      event.clientX - startX,
      event.clientY - startY,
      tuning.input.swipeMinDistancePx,
    )
    if (!action) return
    fired = true
    onCommand(action)
  }

  const onPointerEnd = (event: PointerEvent) => {
    if (event.pointerId === pointerId) pointerId = null
  }

  target.addEventListener('keydown', onKeyDown)
  target.addEventListener('pointerdown', onPointerDown)
  target.addEventListener('pointermove', onPointerMove)
  target.addEventListener('pointerup', onPointerEnd)
  target.addEventListener('pointercancel', onPointerEnd)

  return () => {
    target.removeEventListener('keydown', onKeyDown)
    target.removeEventListener('pointerdown', onPointerDown)
    target.removeEventListener('pointermove', onPointerMove)
    target.removeEventListener('pointerup', onPointerEnd)
    target.removeEventListener('pointercancel', onPointerEnd)
  }
}
