'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

// Hook para lazy loading baseado em Intersection Observer
export function useLazyLoading<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.1,
  rootMargin = '50px',
  triggerOnce = true
}: {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
} = {}) {
  const [isVisible, setIsVisible] = useState(false)
  const [hasTriggered, setHasTriggered] = useState(false)
  const elementRef = useRef<T>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element || (triggerOnce && hasTriggered)) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (triggerOnce) {
            setHasTriggered(true)
            observer.unobserve(element)
          }
        } else if (!triggerOnce) {
          setIsVisible(false)
        }
      },
      {
        threshold,
        rootMargin
      }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [threshold, rootMargin, triggerOnce, hasTriggered])

  return { elementRef, isVisible }
}

// Hook para lazy loading de imagens
export function useLazyImage(src: string, placeholder?: string) {
  const [imageSrc, setImageSrc] = useState(placeholder || '')
  const [isLoaded, setIsLoaded] = useState(false)
  const [isError, setIsError] = useState(false)
  const { elementRef, isVisible } = useLazyLoading<HTMLImageElement>()

  useEffect(() => {
    if (!isVisible || isLoaded || isError) return

    const img = new Image()
    img.onload = () => {
      setImageSrc(src)
      setIsLoaded(true)
    }
    img.onerror = () => {
      setIsError(true)
    }
    img.src = src
  }, [isVisible, src, isLoaded, isError])

  return {
    elementRef,
    imageSrc,
    isLoaded,
    isError,
    isVisible
  }
}

// Hook para debounce de valores
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Hook para throttle de funções
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const throttledCallback = useRef<T | null>(null)
  const lastRan = useRef<number>(0)

  const throttled = useCallback(
    (...args: Parameters<T>) => {
      if (lastRan.current === undefined) {
        callback(...args)
        lastRan.current = Date.now()
      } else {
        clearTimeout(throttledCallback.current as any)
        throttledCallback.current = setTimeout(() => {
          if (Date.now() - lastRan.current! >= delay) {
            callback(...args)
            lastRan.current = Date.now()
          }
        }, delay - (Date.now() - lastRan.current)) as any
      }
    },
    [callback, delay]
  ) as T

  return throttled
}

// Hook para performance monitoring
export function usePerformanceMonitor(name: string) {
  const startTime = useRef<number>(0)
  const endTime = useRef<number>(0)

  const start = useCallback(() => {
    startTime.current = performance.now()
  }, [])

  const end = useCallback(() => {
    endTime.current = performance.now()
    const duration = endTime.current - startTime.current
    console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`)
    return duration
  }, [name])

  const measure = useCallback((fn: () => void) => {
    start()
    fn()
    return end()
  }, [start, end])

  return { start, end, measure }
}

// Hook para virtual scrolling (para listas grandes)
export function useVirtualScrolling({
  itemCount,
  itemHeight,
  containerHeight,
  overscan = 5
}: {
  itemCount: number
  itemHeight: number
  containerHeight: number
  overscan?: number
}) {
  const [scrollTop, setScrollTop] = useState(0)

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    itemCount - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  )

  const visibleItems = []
  for (let i = startIndex; i <= endIndex; i++) {
    visibleItems.push({
      index: i,
      offsetTop: i * itemHeight
    })
  }

  const totalHeight = itemCount * itemHeight

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop)
  }, [])

  return {
    visibleItems,
    totalHeight,
    handleScroll,
    startIndex,
    endIndex
  }
}

// Hook para preload de recursos
export function usePreload() {
  const preloadedResources = useRef(new Set<string>())

  const preloadImage = useCallback((src: string): Promise<void> => {
    if (preloadedResources.current.has(src)) {
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        preloadedResources.current.add(src)
        resolve()
      }
      img.onerror = reject
      img.src = src
    })
  }, [])

  const preloadScript = useCallback((src: string): Promise<void> => {
    if (preloadedResources.current.has(src)) {
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.onload = () => {
        preloadedResources.current.add(src)
        resolve()
      }
      script.onerror = reject
      script.src = src
      document.head.appendChild(script)
    })
  }, [])

  return { preloadImage, preloadScript }
}