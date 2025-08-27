'use client'

import { useEffect, useRef, useCallback } from 'react'

// Hook para navegação por teclado em listas
export function useKeyboardNavigation({
  itemCount,
  onSelect,
  isOpen = true,
  loop = true,
  orientation = 'vertical'
}: {
  itemCount: number
  onSelect?: (index: number) => void
  isOpen?: boolean
  loop?: boolean
  orientation?: 'vertical' | 'horizontal'
}) {
  const activeIndexRef = useRef(-1)
  const containerRef = useRef<HTMLElement>(null)

  const setActiveIndex = useCallback((index: number) => {
    if (index < 0) {
      activeIndexRef.current = loop ? itemCount - 1 : 0
    } else if (index >= itemCount) {
      activeIndexRef.current = loop ? 0 : itemCount - 1
    } else {
      activeIndexRef.current = index
    }

    // Atualizar atributos ARIA
    const container = containerRef.current
    if (container) {
      const items = container.querySelectorAll('[role="option"], [role="menuitem"], [data-keyboard-nav]')
      items.forEach((item, i) => {
        if (i === activeIndexRef.current) {
          item.setAttribute('aria-selected', 'true')
          item.setAttribute('tabindex', '0')
          ;(item as HTMLElement).focus()
        } else {
          item.setAttribute('aria-selected', 'false')
          item.setAttribute('tabindex', '-1')
        }
      })
    }
  }, [itemCount, loop])

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isOpen || itemCount === 0) return

    const { key } = event
    const isVertical = orientation === 'vertical'
    const nextKey = isVertical ? 'ArrowDown' : 'ArrowRight'
    const prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft'

    switch (key) {
      case nextKey:
        event.preventDefault()
        setActiveIndex(activeIndexRef.current + 1)
        break
      case prevKey:
        event.preventDefault()
        setActiveIndex(activeIndexRef.current - 1)
        break
      case 'Home':
        event.preventDefault()
        setActiveIndex(0)
        break
      case 'End':
        event.preventDefault()
        setActiveIndex(itemCount - 1)
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        if (activeIndexRef.current >= 0 && onSelect) {
          onSelect(activeIndexRef.current)
        }
        break
      case 'Escape':
        event.preventDefault()
        activeIndexRef.current = -1
        break
    }
  }, [isOpen, itemCount, orientation, onSelect, setActiveIndex])

  useEffect(() => {
    const container = containerRef.current
    if (container && isOpen) {
      container.addEventListener('keydown', handleKeyDown)
      return () => container.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown, isOpen])

  // Reset quando a lista muda
  useEffect(() => {
    activeIndexRef.current = -1
  }, [itemCount])

  return {
    containerRef,
    activeIndex: activeIndexRef.current,
    setActiveIndex
  }
}

// Hook para gerenciar foco em modais e diálogos
export function useFocusTrap(isOpen: boolean) {
  const containerRef = useRef<HTMLElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!isOpen) return

    const container = containerRef.current
    if (!container) return

    // Salvar o elemento com foco atual
    previousFocusRef.current = document.activeElement as HTMLElement

    // Encontrar elementos focáveis
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    // Focar no primeiro elemento
    if (firstElement) {
      firstElement.focus()
    }

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault()
          lastElement?.focus()
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault()
          firstElement?.focus()
        }
      }
    }

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        // Implementar lógica de fechamento se necessário
      }
    }

    document.addEventListener('keydown', handleTabKey)
    document.addEventListener('keydown', handleEscapeKey)

    return () => {
      document.removeEventListener('keydown', handleTabKey)
      document.removeEventListener('keydown', handleEscapeKey)
      
      // Restaurar foco anterior
      if (previousFocusRef.current) {
        previousFocusRef.current.focus()
      }
    }
  }, [isOpen])

  return containerRef
}

// Hook para anúncios de screen reader
export function useScreenReader() {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.setAttribute('class', 'sr-only')
    announcement.textContent = message
    
    document.body.appendChild(announcement)
    
    // Remover após um tempo
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }, [])

  return { announce }
}

// Hook para detectar se o usuário está navegando por teclado
export function useKeyboardUser() {
  const isKeyboardUserRef = useRef(false)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        isKeyboardUserRef.current = true
        document.body.classList.add('keyboard-user')
      }
    }

    const handleMouseDown = () => {
      isKeyboardUserRef.current = false
      document.body.classList.remove('keyboard-user')
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [])

  return isKeyboardUserRef.current
}