'use client'

import { Bell, Search, User, Menu, LogOut, Settings, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { NotificationCenter } from '@/components/ui/notification-center'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

interface HeaderProps {
  onMenuClick?: () => void
  showMenuButton?: boolean
}

export function Header({ onMenuClick, showMenuButton = true }: HeaderProps) {
  const { user, logoutAndRedirect } = useAuth()
  const router = useRouter()

  // Função para obter as iniciais do nome
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Função para formatar o papel do usuário
  const getRoleLabel = (role: string) => {
    const roles = {
      admin: 'Administrador',
      doctor: 'Médico',
      receptionist: 'Recepcionista'
    }
    return roles[role as keyof typeof roles] || role
  }

  const handleLogout = () => {
    logoutAndRedirect()
  }

  const handleProfile = () => {
    router.push('/dashboard/profile')
  }

  const handleSettings = () => {
    router.push('/dashboard/settings')
  }

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Mobile menu button */}
        {showMenuButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className={cn(
              "p-2 hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
              showMenuButton ? "lg:hidden" : "hidden"
            )}
            aria-label="Abrir menu de navegação"
            aria-expanded={false}
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </Button>
        )}

        {/* Search */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" aria-hidden="true" />
            <Input
              type="search"
              placeholder="Buscar pacientes, consultas..."
              className="pl-10 text-sm bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:focus:bg-gray-900 dark:focus:ring-blue-400 dark:focus:border-blue-400"
              aria-label="Campo de busca"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-2">
          {/* Notifications - Hidden on small screens */}
          <div className="hidden sm:block">
            <NotificationCenter />
          </div>
          
          {/* Theme Toggle - Hidden on small screens */}
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
          
          {/* Mobile notifications and theme toggle */}
          <div className="sm:hidden flex items-center space-x-1">
            <NotificationCenter />
            <ThemeToggle />
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="relative h-8 w-8 rounded-full focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label={`Menu do usuário ${user?.name || 'Usuário'}`}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} alt={`Avatar de ${user?.name || 'Usuário'}`} />
                  <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="focus:bg-gray-100 dark:focus:bg-gray-800">
                <User className="mr-2 h-4 w-4" aria-hidden="true" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-gray-100 dark:focus:bg-gray-800">
                <Settings className="mr-2 h-4 w-4" aria-hidden="true" />
                <span>Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-gray-100 dark:focus:bg-gray-800">
                <HelpCircle className="mr-2 h-4 w-4" aria-hidden="true" />
                <span>Suporte</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={logoutAndRedirect}
                className="focus:bg-red-50 dark:focus:bg-red-900/20 text-red-600 dark:text-red-400"
              >
                <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}