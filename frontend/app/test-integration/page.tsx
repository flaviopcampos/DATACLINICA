'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { departmentService, roomService, bedService, admissionService } from '@/services/bedService'

interface TestResult {
  name: string
  status: 'pending' | 'success' | 'error'
  message: string
  data?: any
}

export default function TestIntegrationPage() {
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Conexão com Backend', status: 'pending', message: 'Aguardando teste...' },
    { name: 'Listar Departamentos', status: 'pending', message: 'Aguardando teste...' },
    { name: 'Listar Quartos', status: 'pending', message: 'Aguardando teste...' },
    { name: 'Listar Leitos', status: 'pending', message: 'Aguardando teste...' },
    { name: 'Listar Internações', status: 'pending', message: 'Aguardando teste...' }
  ])
  const [isRunning, setIsRunning] = useState(false)

  const updateTest = (index: number, status: TestResult['status'], message: string, data?: any) => {
    setTests(prev => prev.map((test, i) => 
      i === index ? { ...test, status, message, data } : test
    ))
  }

  const runTests = async () => {
    setIsRunning(true)
    
    // Reset all tests
    setTests(prev => prev.map(test => ({ ...test, status: 'pending', message: 'Executando...' })))

    try {
      // Test 1: Backend Connection
      updateTest(0, 'pending', 'Testando conexão...')
      try {
        // Teste simples de conectividade com a documentação da API
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/docs`)
        if (response.ok) {
          updateTest(0, 'success', 'Backend conectado com sucesso!')
        } else {
          updateTest(0, 'error', `Erro: ${response.status} - ${response.statusText}`)
        }
      } catch (error) {
        updateTest(0, 'error', `Erro de conexão: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      }

      // Test 2: List Departments
      updateTest(1, 'pending', 'Testando departamentos...')
      try {
        const response = await fetch('http://localhost:8000/test-departments')
         if (response.ok) {
           const result = await response.json()
           if (result.status === 'success') {
             updateTest(1, 'success', `${result.data.length} departamentos encontrados`, result.data)
           } else {
             updateTest(1, 'error', result.message || 'Erro no endpoint')
           }
        } else {
          updateTest(1, 'error', `Erro HTTP: ${response.status}`)
        }
      } catch (error) {
        updateTest(1, 'error', `Erro ao listar departamentos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      }

      // Test 3: List Rooms
      updateTest(2, 'pending', 'Testando quartos...')
      try {
        const response = await fetch('http://localhost:8000/test-rooms')
         if (response.ok) {
           const result = await response.json()
           if (result.status === 'success') {
             updateTest(2, 'success', `${result.data.length} quartos encontrados`, result.data)
           } else {
             updateTest(2, 'error', result.message || 'Erro no endpoint')
           }
        } else {
          updateTest(2, 'error', `Erro HTTP: ${response.status}`)
        }
      } catch (error) {
        updateTest(2, 'error', `Erro ao listar quartos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      }

      // Test 4: List Beds
      updateTest(3, 'pending', 'Testando leitos...')
      try {
        const response = await fetch('http://localhost:8000/test-beds')
         if (response.ok) {
           const result = await response.json()
           if (result.status === 'success') {
             updateTest(3, 'success', `${result.data.length} leitos encontrados`, result.data)
           } else {
             updateTest(3, 'error', result.message || 'Erro no endpoint')
           }
        } else {
          updateTest(3, 'error', `Erro HTTP: ${response.status}`)
        }
      } catch (error) {
        updateTest(3, 'error', `Erro ao listar leitos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      }

      // Test 5: List Admissions
      updateTest(4, 'pending', 'Testando internações...')
      try {
        const response = await fetch('http://localhost:8000/test-admissions')
         if (response.ok) {
           const result = await response.json()
           if (result.status === 'success') {
             updateTest(4, 'success', `${result.data.length} internações encontradas`, result.data)
           } else {
             updateTest(4, 'error', result.message || 'Erro no endpoint')
           }
        } else {
          updateTest(4, 'error', `Erro HTTP: ${response.status}`)
        }
      } catch (error) {
        updateTest(4, 'error', `Erro ao listar internações: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      }

    } finally {
      setIsRunning(false)
    }
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return <Loader2 className="h-4 w-4 animate-spin" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pendente</Badge>
      case 'success':
        return <Badge variant="default" className="bg-green-500">Sucesso</Badge>
      case 'error':
        return <Badge variant="destructive">Erro</Badge>
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Teste de Integração Frontend-Backend</h1>
        <p className="text-muted-foreground">
          Esta página testa a comunicação entre o frontend e backend do sistema de leitos.
        </p>
      </div>

      <div className="mb-6">
        <Button 
          onClick={runTests} 
          disabled={isRunning}
          className="w-full sm:w-auto"
        >
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Executando Testes...
            </>
          ) : (
            'Executar Testes'
          )}
        </Button>
      </div>

      <div className="grid gap-4">
        {tests.map((test, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  {getStatusIcon(test.status)}
                  {test.name}
                </CardTitle>
                {getStatusBadge(test.status)}
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-2">
                {test.message}
              </CardDescription>
              {test.data && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm font-medium mb-2">
                    Ver dados retornados
                  </summary>
                  <pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-40">
                    {JSON.stringify(test.data, null, 2)}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="h-4 w-4" />
          <span className="font-medium">Informações do Ambiente</span>
        </div>
        <div className="text-sm space-y-1">
          <p><strong>Frontend URL:</strong> {typeof window !== 'undefined' ? window.location.origin : 'N/A'}</p>
          <p><strong>Backend URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}</p>
          <p><strong>Timestamp:</strong> {new Date().toLocaleString('pt-BR')}</p>
        </div>
      </div>
    </div>
  )
}