'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-9 px-0 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label={`Tema atual: ${theme === 'light' ? 'claro' : theme === 'dark' ? 'escuro' : 'sistema'}. Clique para alterar tema`}
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" aria-hidden="true" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end"
        role="menu"
        aria-label="Opções de tema"
      >
        <DropdownMenuItem 
          onClick={() => setTheme('light')}
          className="focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          role="menuitem"
          aria-label="Definir tema claro"
        >
          <Sun className="mr-2 h-4 w-4" aria-hidden="true" />
          <span>Claro</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('dark')}
          className="focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          role="menuitem"
          aria-label="Definir tema escuro"
        >
          <Moon className="mr-2 h-4 w-4" aria-hidden="true" />
          <span>Escuro</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('system')}
          className="focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          role="menuitem"
          aria-label="Usar tema do sistema"
        >
          <span className="mr-2 h-4 w-4" aria-hidden="true">💻</span>
          <span>Sistema</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}