'use client'

import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from './button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />
      }

      return <DefaultErrorFallback error={this.state.error} resetError={this.resetError} />
    }

    return this.props.children
  }
}

// Componente de fallback padrão
function DefaultErrorFallback({ 
  error, 
  resetError 
}: { 
  error?: Error
  resetError: () => void 
}) {
  return (
    <div className="flex min-h-[400px] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-xl">Algo deu errado</CardTitle>
          <CardDescription>
            Ocorreu um erro inesperado. Tente recarregar a página ou entre em contato com o suporte.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && process.env.NODE_ENV === 'development' && (
            <div className="rounded-md bg-muted p-3">
              <p className="text-sm font-medium text-muted-foreground mb-2">Detalhes do erro:</p>
              <code className="text-xs text-destructive break-all">
                {error.message}
              </code>
            </div>
          )}
          <div className="flex gap-2">
            <Button 
              onClick={resetError}
              className="flex-1"
              variant="outline"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Tentar novamente
            </Button>
            <Button 
              onClick={() => window.location.reload()}
              className="flex-1"
            >
              Recarregar página
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Hook para usar com React Query ou outras bibliotecas
export function useErrorHandler() {
  return (error: Error) => {
    console.error('Error handled:', error)
    // Aqui você pode integrar com serviços de monitoramento como Sentry
  }
}

export { ErrorBoundary, DefaultErrorFallback }