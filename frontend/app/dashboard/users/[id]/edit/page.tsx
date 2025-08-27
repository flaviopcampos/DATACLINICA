'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Save, X } from 'lucide-react'
import { useUsers } from '@/hooks/useUsers'
import { useRoles } from '@/hooks/useRoles'
import { UserForm } from '@/components/users/UserForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import type { User, UserFormData } from '@/types/user'

export default function EditUserPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string

  const { getUserById, updateUser } = useUsers()
  const { roles } = useRoles()

  const { data: user, isLoading, error } = getUserById(userId)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const handleSubmit = async (formData: UserFormData) => {
    if (!user) return

    setIsSubmitting(true)
    try {
      await updateUser.mutateAsync({
        userId,
        data: formData
      })
      toast.success('Usuário atualizado com sucesso!')
      setHasChanges(false)
      router.push(`/dashboard/users/${userId}`)
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar usuário')
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
    router.push(`/dashboard/users/${userId}`)
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

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p className="font-medium">Erro ao carregar usuário</p>
              <p className="text-sm mt-1">{error.message}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => router.push('/dashboard/users')}
              >
                Voltar para Lista
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="font-medium text-gray-900">Usuário não encontrado</p>
              <p className="text-gray-600 mt-1">O usuário solicitado não existe ou foi removido.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => router.push('/dashboard/users')}
              >
                Voltar para Lista
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
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
            <h1 className="text-3xl font-bold text-gray-900">Editar Usuário</h1>
            <p className="text-gray-600">Atualize as informações de {user.name}</p>
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

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Usuário</CardTitle>
          {hasChanges && (
            <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
              Você tem alterações não salvas
            </div>
          )}
        </CardHeader>
        <CardContent>
          <UserForm
            initialData={{
              name: user.name,
              email: user.email,
              phone: user.phone || '',
              cpf: user.cpf || '',
              crm: user.crm || '',
              specialty: user.specialty || '',
              role: user.role,
              status: user.status,
              department: user.department || '',
              permissions: user.permissions || []
            }}
            roles={roles || []}
            onSubmit={handleSubmit}
            onChange={handleFormChange}
            isSubmitting={isSubmitting}
            submitButtonText="Salvar Alterações"
            submitButtonIcon={<Save className="h-4 w-4" />}
            mode="edit"
          />
        </CardContent>
      </Card>

      {/* Navigation Warning */}
      {hasChanges && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-amber-800">
              <div className="h-2 w-2 bg-amber-500 rounded-full" />
              <p className="text-sm font-medium">
                Você tem alterações não salvas. Certifique-se de salvar antes de sair da página.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}