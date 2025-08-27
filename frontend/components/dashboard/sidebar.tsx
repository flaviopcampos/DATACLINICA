'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import {
  Home,
  Users,
  Calendar,
  FileText,
  Settings,
  Activity,
  CreditCard,
  BarChart3,
  LogOut,
  ChevronLeft,
  Menu,
  X,
  Link as LinkIcon,
  TrendingUp,
  PieChart,
  LineChart,
  UserCheck,
  Bed
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LogoutConfirmDialog } from '@/components/ui/confirm-dialog'
import { useAuth } from '@/hooks/useAuth'
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Pacientes', href: '/dashboard/patients', icon: Users },
  { name: 'Consultas', href: '/dashboard/appointments', icon: Calendar },
  { name: 'Leitos', href: '/dashboard/beds', icon: Bed },
  { name: 'Prontuários', href: '/dashboard/records', icon: FileText },
  { name: 'Relatórios', href: '/dashboard/reports', icon: BarChart3 },
  { name: 'Financeiro', href: '/dashboard/billing', icon: CreditCard },
  { name: 'Integração Faturamento', href: '/billing/appointments', icon: LinkIcon },
  { name: 'BI Dashboard', href: '/bi', icon: TrendingUp },
  { name: 'BI Analytics', href: '/bi/analytics', icon: PieChart },
  { name: 'BI Métricas', href: '/bi/metrics', icon: LineChart },
  { name: 'BI Pacientes', href: '/bi/patients', icon: UserCheck },
  { name: 'Atividades', href: '/dashboard/activities', icon: Activity },
  { name: 'Configurações', href: '/dashboard/settings', icon: Settings },
]

interface SidebarProps {
  isCollapsed?: boolean
  onToggle?: () => void
  isMobile?: boolean
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ 
  isCollapsed = false, 
  onToggle, 
  isMobile = false, 
  isOpen = false, 
  onClose 
}: SidebarProps) {
  const pathname = usePathname()
  const { logoutAndRedirect } = useAuth()
  const [mounted, setMounted] = useState(false)
  
  const { containerRef } = useKeyboardNavigation({
    itemCount: navigation.length + 1, // +1 para o botão de logout
    orientation: 'vertical',
    loop: true
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = async () => {
    await logoutAndRedirect()
  }

  // Fechar sidebar mobile ao clicar em um link
  const handleLinkClick = () => {
    if (isMobile && onClose) {
      onClose()
    }
  }

  // Prevenir scroll do body quando sidebar mobile está aberto
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobile, isOpen])

  if (!mounted) {
    return null
  }

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className={cn(
        "flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-700",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        <div className={cn(
          "flex items-center space-x-2",
          isCollapsed && "justify-center"
        )}>
          <div 
            className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0"
            role="img"
            aria-label="Logo DataClínica"
          >
            <Activity className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <span className="text-xl font-bold text-gray-900 dark:text-white whitespace-nowrap">
              DataClínica
            </span>
          )}
        </div>
        
        {/* Toggle button for desktop */}
        {!isMobile && onToggle && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className={cn(
              "p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
              isCollapsed && "hidden"
            )}
            aria-label={isCollapsed ? "Expandir sidebar" : "Recolher sidebar"}
            aria-expanded={!isCollapsed}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}
        
        {/* Close button for mobile */}
        {isMobile && onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Fechar menu"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto" role="list">
        {navigation.map((item, index) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={handleLinkClick}
              className={cn(
                'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors group relative',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                'keyboard-user:focus:ring-2 keyboard-user:focus:ring-blue-500',
                isActive
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700',
                isCollapsed && 'justify-center'
              )}
              title={isCollapsed ? item.name : undefined}
              role="listitem"
              data-keyboard-nav
              tabIndex={-1}
              aria-current={isActive ? "page" : undefined}
              aria-label={`${item.name}${isActive ? " (página atual)" : ""}`}
            >
              <item.icon className={cn(
                "w-5 h-5 flex-shrink-0",
                isCollapsed ? "" : "mr-3"
              )} aria-hidden="true" />
              {!isCollapsed && (
                <span className="whitespace-nowrap">{item.name}</span>
              )}
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                  {item.name}
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <LogoutConfirmDialog onConfirm={handleLogout}>
          <Button
            variant="ghost"
            className={cn(
              "w-full text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 group relative",
              "focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2",
              "keyboard-user:focus:ring-2 keyboard-user:focus:ring-red-500",
              isCollapsed ? "justify-center px-3" : "justify-start"
            )}
            title={isCollapsed ? "Sair" : undefined}
            data-keyboard-nav
            tabIndex={-1}
            aria-label="Sair do sistema"
          >
            <LogOut className={cn(
              "w-5 h-5 flex-shrink-0",
              isCollapsed ? "" : "mr-3"
            )} aria-hidden="true" />
            {!isCollapsed && <span>Sair</span>}
            
            {/* Tooltip for collapsed state */}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                Sair
              </div>
            )}
          </Button>
        </LogoutConfirmDialog>
      </div>
    </>
  )

  if (isMobile) {
    return (
      <>
        {/* Mobile overlay */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
            onClick={onClose}
            aria-hidden="true"
          />
        )}
        
        {/* Mobile sidebar */}
        <div 
          ref={containerRef}
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:hidden",
            "focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2",
            isOpen ? "translate-x-0" : "-translate-x-full"
          )}
          role="navigation"
          aria-label="Menu de navegação principal"
        >
          <div className="flex flex-col h-full">
            {sidebarContent}
          </div>
        </div>
      </>
    )
  }

  return (
    <div 
      ref={containerRef}
      className={cn(
        "flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out hidden lg:flex",
        "focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2",
        isCollapsed ? "w-16" : "w-64"
      )}
      role="navigation"
      aria-label={isCollapsed ? "Menu de navegação (recolhido)" : "Menu de navegação principal"}
    >
      {sidebarContent}
    </div>
  )
}