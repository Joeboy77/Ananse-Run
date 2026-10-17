import type { PlayerAction } from './actions'

interface BufferedAction {
  action: PlayerAction
  ttl: number
}

export class InputBuffer {
  private readonly items: BufferedAction[] = []
  private readonly lifetime: number

  constructor(lifetime: number) {
    this.lifetime = lifetime
  }

  push(action: PlayerAction): void {
    this.items.push({ action, ttl: this.lifetime })
  }

  consume(tryRun: (action: PlayerAction) => boolean, dt: number): void {
    for (let i = 0; i < this.items.length;) {
      const item = this.items[i]!
      if (tryRun(item.action)) {
        this.items.splice(i, 1)
        continue
      }
      item.ttl -= dt
      if (item.ttl <= 0) this.items.splice(i, 1)
      else i++
    }
  }

  clear(): void {
    this.items.length = 0
  }

  get size(): number {
    return this.items.length
  }
}
