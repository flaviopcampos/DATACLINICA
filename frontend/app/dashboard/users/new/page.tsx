'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, UserPlus, X } from 'lucide-react'
import { useUsers } from '@/hooks/useUsers'
import { useRoles } from '@/hooks/useRoles'
import { UserForm } from '@/components/users/UserForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import type { UserFormData } from '@/types/user'

export default function NewUserPage() {
  const router = useRouter()
  const { createUser } = useUsers()
  const { roles, isLoading: isLoadingRoles } = useRoles()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const handleSubmit = async (formData: UserFormData) => {
    setIsSubmitting(true)
    try {
      const newUser = await createUser.mutateAsync(formData)
      toast.success('Usuário criado com sucesso!')
      setHasChanges(false)
      router.push(`/dashboard/users/${newUser.id}`)
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar usuário')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (hasChanges) {
      const confirmed = window.confirm(
        'Você tem alterações não salvas. Tem certeza que deseja sair?'
      )
      if (!confirmed) return
    }
    router.push('/dashboard/users')
  }

  const handleFormChange = () => {
    setHasChanges(true)
  }

  // Prevent navigation if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasChanges])

  const initialData: UserFormData = {
    name: '',
    email: '',
    phone: '',
    cpf: '',
    crm: '',
    specialty: '',
    role: 'receptionist',
    status: 'active',
    department: '',
    permissions: [],
    password: '',
    confirmPassword: ''
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleCancel}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Novo Usuário</h1>
            <p className="text-gray-600">Crie uma nova conta de usuário no sistema</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            disabled={isSubmitting}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Cancelar
          </Button>
        </div>
      </div>

      {/* Instructions */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="h-2 w-2 bg-blue-500 rounded-full mt-2" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900">
                Instruções para criação de usuário
              </p>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Todos os campos marcados com * são obrigatórios</li>
                <li>• O email será usado como nome de usuário para login</li>
                <li>• Uma senha temporária será gerada e enviada por email</li>
                <li>• O usuário deverá alterar a senha no primeiro acesso</li>
                <li>• Permissões podem ser ajustadas após a criação</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Informações do Usuário
          </CardTitle>
          {hasChanges && (
            <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
              Você tem alterações não salvas
            </div>
          )}
        </CardHeader>
        <CardContent>
          {isLoadingRoles ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                    <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <UserForm
              initialData={initialData}
              roles={roles || []}
              onSubmit={handleSubmit}
              onChange={handleFormChange}
              isSubmitting={isSubmitting}
              submitButtonText="Criar Usuário"
              submitButtonIcon={<UserPlus className="h-4 w-4" />}
              mode="create"
            />
          )}
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="h-2 w-2 bg-green-500 rounded-full mt-2" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-green-900">
                Política de Segurança
              </p>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Senhas devem ter no mínimo 8 caracteres</li>
                <li>• Deve conter pelo menos uma letra maiúscula e minúscula</li>
                <li>• Deve conter pelo menos um número e um caractere especial</li>
                <li>• Senhas são criptografadas e não podem ser recuperadas</li>
                <li>• Recomenda-se ativar autenticação 2FA após o primeiro login</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Warning */}
      {hasChanges && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-amber-800">
              <div className="h-2 w-2 bg-amber-500 rounded-full" />
              <p className="text-sm font-medium">
                Você tem alterações não salvas. Certifique-se de criar o usuário antes de sair da página.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}