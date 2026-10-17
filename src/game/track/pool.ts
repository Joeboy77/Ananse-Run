export class Pool<T extends { active: boolean }> {
  readonly items: readonly T[]
  private readonly free: number[]
  private readonly indexOf = new Map<T, number>()

  constructor(size: number, create: () => T) {
    this.items = Array.from({ length: size }, create)
    this.items.forEach((item, index) => this.indexOf.set(item, index))
    this.free = Array.from({ length: size }, (_, i) => size - 1 - i)
  }

  acquire(): T | null {
    const index = this.free.pop()
    if (index === undefined) return null
    const item = this.items[index]!
    item.active = true
    return item
  }

  release(item: T): void {
    if (!item.active) return
    item.active = false
    this.free.push(this.indexOf.get(item)!)
  }

  releaseAll(): void {
    this.free.length = 0
    for (let i = this.items.length - 1; i >= 0; i--) {
      this.items[i]!.active = false
      this.free.push(i)
    }
  }

  rebuildFree(): void {
    this.free.length = 0
    for (let i = this.items.length - 1; i >= 0; i--) if (!this.items[i]!.active) this.free.push(i)
  }

  get activeCount(): number {
    return this.items.length - this.free.length
  }
}
