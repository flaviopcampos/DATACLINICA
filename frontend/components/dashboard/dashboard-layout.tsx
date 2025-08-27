'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { FadeIn } from '@/components/ui/animations'
import { useThrottle } from '@/hooks/useLazyLoading'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Throttled resize handler para melhor performance
  const throttledResize = useThrottle(() => {
    const mobile = window.innerWidth < 768
    setIsMobile(mobile)
    if (!mobile) {
      setMobileMenuOpen(false)
    }
  }, 150)

  // Detectar tamanho da tela
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false)
      }
      setIsLoading(false)
    }

    checkScreenSize()
    window.addEventListener('resize', throttledResize)
    return () => window.removeEventListener('resize', throttledResize)
  }, [throttledResize])

  // Fechar menu mobile ao pressionar ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [mobileMenuOpen])

  // Prevenir scroll quando menu mobile está aberto
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [mobileMenuOpen])

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileMenuOpen(!mobileMenuOpen)
    } else {
      setSidebarCollapsed(!sidebarCollapsed)
    }
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        isCollapsed={sidebarCollapsed}
        isMobile={isMobile}
        isOpen={mobileMenuOpen}
        onToggle={toggleSidebar}
        onClose={closeMobileMenu}
      />
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          onMenuClick={toggleSidebar}
          showMenuButton={isMobile}
        />
        
        <FadeIn asChild>
          <main className="flex-1 overflow-auto p-4 md:p-6 transition-all duration-200">
            {children}
          </main>
        </FadeIn>
      </div>
      
      {/* Overlay para mobile */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-200 md:hidden"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}
    </div>
  )
}

// Hook para usar o contexto do layout (se necessário no futuro)
export function useDashboardLayout() {
  // Pode ser expandido para incluir estado global do layout
  return {
    // Estado e funções do layout podem ser expostas aqui
  }
}