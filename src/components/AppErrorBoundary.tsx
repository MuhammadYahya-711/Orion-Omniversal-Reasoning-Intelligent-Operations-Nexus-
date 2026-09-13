import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

type AppErrorBoundaryProps = { children?: ReactNode }
type AppErrorBoundaryState = { error: Error | null }

/**
 * Keeps a render crash contained to this subtree instead of blanking the page,
 * and re-reports it through console.error so the preview overlay and the
 * deployed-app error beacon still see the original error.
 */
class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack)
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children
    return (
      <div
        role="alert"
        style={{
          margin: '2rem auto',
          maxWidth: '32rem',
          padding: '1.5rem',
          borderRadius: '0.75rem',
          border: '1px solid rgba(127, 127, 127, 0.35)',
          colorScheme: 'light dark',
          background: 'Canvas',
          color: 'CanvasText',
        }}
      >
        <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.125rem', fontWeight: 600 }}>
          Something went wrong
        </h2>
        <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', opacity: 0.8 }}>
          {String(error?.message ?? '')}
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            border: '1px solid currentColor',
            background: 'transparent',
            color: 'inherit',
            cursor: 'pointer',
            fontSize: '0.875rem',
          }}
        >
          Reload
        </button>
      </div>
    )
  }
}

export default AppErrorBoundary
