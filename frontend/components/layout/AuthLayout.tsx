import { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowLeft, Heart } from 'lucide-react'

interface AuthLayoutProps {
  children: ReactNode
  title: string
  subtitle?: string
  showBackButton?: boolean
}

export function AuthLayout({ 
  children, 
  title, 
  subtitle, 
  showBackButton = false 
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Lado esquerdo - Imagem/Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
              <Heart className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold">DataClínica</h1>
          </div>
          
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-semibold mb-4">
              Sistema Interno de Gestão Clínica
            </h2>
            <p className="text-blue-100 text-lg leading-relaxed">
              Plataforma especializada para gestão de saúde mental com 
              segurança, privacidade e eficiência profissional.
            </p>
          </div>
          
          <div className="mt-12 space-y-4 text-center">
            <div className="p-4 bg-white/10 rounded-lg backdrop-blur-sm">
              <div className="text-sm text-blue-200 mb-1">Sistema Corporativo</div>
              <div className="font-semibold">Acesso Restrito a Profissionais</div>
            </div>
          </div>
        </div>
        
        {/* Elementos decorativos */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl" />
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-white/10 rounded-full blur-xl" />
      </div>
      
      {/* Lado direito - Formulário */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-12">
        <div className="mx-auto w-full max-w-md">
          {/* Header */}
          <div className="mb-8">
            {showBackButton && (
              <Link 
                href="/" 
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar ao início
              </Link>
            )}
            
            <div className="lg:hidden flex items-center gap-2 mb-6">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xl font-bold">DataClínica</span>
            </div>
            
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            {subtitle && (
              <p className="text-muted-foreground mt-2">{subtitle}</p>
            )}
          </div>
          
          {/* Conteúdo do formulário */}
          {children}
          
          {/* Footer */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              Sistema corporativo - Credenciais fornecidas pela administração
            </p>
            <p className="mt-2">
              <Link href="/terms" className="underline hover:text-foreground">
                Termos de Uso
              </Link>{' '}
              |{' '}
              <Link href="/privacy" className="underline hover:text-foreground">
                Política de Privacidade
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}