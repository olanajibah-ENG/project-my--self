import * as React from "react"
import { ErrorState } from "./ui/error-state"

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error to console (in production, this would send to error tracking service)
    console.error("ErrorBoundary caught an error:", error)
    console.error("Error info:", errorInfo.componentStack)
  }

  handleReload = (): void => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <ErrorState
            title="Something went wrong"
            message="An unexpected error occurred. Please reload the page to try again."
            action={{
              label: "Reload Page",
              onClick: this.handleReload,
            }}
          />
        </div>
      )
    }

    return this.props.children
  }
}

export { ErrorBoundary }
