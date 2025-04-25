"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import { GlassContainer } from "@/components/ui/glass-container"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error, errorInfo: null }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo)
    this.setState({
      error,
      errorInfo,
    })
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <GlassContainer className="p-6 my-4" intensity="medium" textContrast="high">
          <h2 className="text-xl font-bold text-white mb-4">Etwas ist schiefgelaufen</h2>
          <div className="bg-black/30 p-4 rounded-md mb-4 overflow-auto max-h-[300px]">
            <p className="text-red-400 font-mono text-sm mb-2">{this.state.error?.toString()}</p>
            {this.state.errorInfo && (
              <pre className="text-white/70 font-mono text-xs whitespace-pre-wrap">
                {this.state.errorInfo.componentStack}
              </pre>
            )}
          </div>
          <Button onClick={this.handleReset} className="bg-emerald-600 hover:bg-emerald-500">
            <RefreshCw className="w-4 h-4 mr-2" />
            Neu laden
          </Button>
        </GlassContainer>
      )
    }

    return this.props.children
  }
}
