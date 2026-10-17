import { Component, type ReactNode } from 'react'

interface ModelBoundaryProps {
  fallback: ReactNode
  children: ReactNode
}

interface ModelBoundaryState {
  failed: boolean
}

export class ModelBoundary extends Component<ModelBoundaryProps, ModelBoundaryState> {
  override state: ModelBoundaryState = { failed: false }

  static getDerivedStateFromError(): ModelBoundaryState {
    return { failed: true }
  }

  override componentDidCatch(error: unknown): void {
    console.warn('Character model failed to load, using the placeholder.', error)
  }

  override render(): ReactNode {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
