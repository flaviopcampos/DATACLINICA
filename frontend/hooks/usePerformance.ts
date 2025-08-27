'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

// Hook para monitorar performance da aplicação
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    connectionType: 'unknown'
  })

  useEffect(() => {
    // Monitorar tempo de carregamento
    if (typeof window !== 'undefined' && 'performance' in window) {
      const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart
      
      // Monitorar uso de memória (se disponível)
      const memoryInfo = (performance as any).memory
      const memoryUsage = memoryInfo ? memoryInfo.usedJSHeapSize / 1024 / 1024 : 0
      
      // Detectar tipo de conexão
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
      const connectionType = connection ? connection.effectiveType : 'unknown'
      
      setMetrics({
        loadTime,
        renderTime: 0,
        memoryUsage,
        connectionType
      })
    }
  }, [])

  return metrics
}

// Hook para medir tempo de renderização de componentes
export function useRenderTime(componentName: string) {
  const startTime = useRef<number>(0)
  const [renderTime, setRenderTime] = useState(0)

  useEffect(() => {
    startTime.current = performance.now()
    
    return () => {
      if (startTime.current) {
        const endTime = performance.now()
        const duration = endTime - startTime.current
        setRenderTime(duration)
        
        // Log para desenvolvimento
        if (process.env.NODE_ENV === 'development') {
          console.log(`${componentName} render time: ${duration.toFixed(2)}ms`)
        }
      }
    }
  })

  return renderTime
}

// Hook para detectar dispositivos com baixa performance
export function useDeviceCapabilities() {
  const [capabilities, setCapabilities] = useState({
    isLowEnd: false,
    cores: 1,
    memory: 0,
    connectionSpeed: 'unknown'
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Detectar número de cores do processador
      const cores = navigator.hardwareConcurrency || 1
      
      // Estimar se é um dispositivo de baixa performance
      const isLowEnd = cores <= 2
      
      // Detectar memória disponível (se suportado)
      const memory = (navigator as any).deviceMemory || 0
      
      // Detectar velocidade da conexão
      const connection = (navigator as any).connection
      const connectionSpeed = connection ? connection.effectiveType : 'unknown'
      
      setCapabilities({
        isLowEnd,
        cores,
        memory,
        connectionSpeed
      })
    }
  }, [])

  return capabilities
}

// Hook para otimizar animações baseado na performance do dispositivo
export function useOptimizedAnimations() {
  const { isLowEnd } = useDeviceCapabilities()
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      setPrefersReducedMotion(mediaQuery.matches)
      
      const handleChange = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches)
      }
      
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  return {
    shouldReduceAnimations: prefersReducedMotion || isLowEnd,
    animationDuration: isLowEnd ? 150 : 300,
    enableComplexAnimations: !isLowEnd && !prefersReducedMotion
  }
}

// Hook para lazy loading inteligente baseado na conexão
export function useIntelligentLoading() {
  const { connectionSpeed } = useDeviceCapabilities()
  const [shouldPreload, setShouldPreload] = useState(true)

  useEffect(() => {
    // Ajustar estratégia de carregamento baseado na conexão
    const slowConnections = ['slow-2g', '2g', '3g']
    setShouldPreload(!slowConnections.includes(connectionSpeed))
  }, [connectionSpeed])

  return {
    shouldPreload,
    imageQuality: connectionSpeed === '4g' ? 'high' : 'medium',
    enableLazyLoading: true,
    loadingStrategy: shouldPreload ? 'eager' : 'lazy'
  }
}

// Hook para debounce otimizado
export function useOptimizedDebounce<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  const { isLowEnd } = useDeviceCapabilities()
  
  // Aumentar delay em dispositivos de baixa performance
  const optimizedDelay = isLowEnd ? delay * 1.5 : delay

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, optimizedDelay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, optimizedDelay])

  return debouncedValue
}

// Hook para throttle otimizado
export function useOptimizedThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
) {
  const { isLowEnd } = useDeviceCapabilities()
  const lastRun = useRef(Date.now())
  
  // Aumentar delay em dispositivos de baixa performance
  const optimizedDelay = isLowEnd ? delay * 2 : delay

  return useCallback(
    (...args: Parameters<T>) => {
      if (Date.now() - lastRun.current >= optimizedDelay) {
        callback(...args)
        lastRun.current = Date.now()
      }
    },
    [callback, optimizedDelay]
  )
}

// Hook para gerenciar recursos baseado na performance
export function useResourceManager() {
  const { isLowEnd, memory } = useDeviceCapabilities()
  const { shouldPreload } = useIntelligentLoading()

  return {
    // Limitar número de itens renderizados simultaneamente
    maxRenderItems: isLowEnd ? 10 : 50,
    
    // Configurações de imagem
    imageSettings: {
      quality: isLowEnd ? 70 : 90,
      format: 'webp',
      lazy: !shouldPreload
    },
    
    // Configurações de cache
    cacheSettings: {
      maxSize: memory > 4 ? 100 : 50, // MB
      ttl: isLowEnd ? 300000 : 600000 // ms
    },
    
    // Configurações de animação
    animationSettings: {
      duration: isLowEnd ? 150 : 300,
      easing: isLowEnd ? 'ease' : 'cubic-bezier(0.4, 0, 0.2, 1)',
      enableParallax: !isLowEnd
    }
  }
}

// Hook para monitorar FPS
export function useFPSMonitor() {
  const [fps, setFps] = useState(60)
  const frameCount = useRef(0)
  const lastTime = useRef(performance.now())
  const animationFrame = useRef<number | null>(null)

  const measureFPS = useCallback(() => {
    frameCount.current++
    const currentTime = performance.now()
    
    if (currentTime - lastTime.current >= 1000) {
      setFps(Math.round((frameCount.current * 1000) / (currentTime - lastTime.current)))
      frameCount.current = 0
      lastTime.current = currentTime
    }
    
    animationFrame.current = requestAnimationFrame(measureFPS)
  }, [])

  useEffect(() => {
    animationFrame.current = requestAnimationFrame(measureFPS)
    
    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current)
      }
    }
  }, [measureFPS])

  return {
    fps,
    isPerformanceGood: fps >= 50,
    isPerformancePoor: fps < 30
  }
}