'use client'

import React, { useState, useEffect, HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

// Componente para animações de fade
export const FadeIn = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & {
    delay?: number
    duration?: number
    asChild?: boolean
  }
>(({ className, children, delay = 0, duration = 0.3, asChild = false, ...props }, ref) => {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...children.props,
      className: cn(
        'animate-in fade-in-0 duration-300',
        children.props.className,
        className
      ),
      style: {
        ...children.props.style,
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}s`
      }
    })
  }

  return (
    <div
      ref={ref}
      className={cn(
        'animate-in fade-in-0 duration-300',
        className
      )}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}s`
      }}
      {...props}
    >
      {children}
    </div>
  )
})
FadeIn.displayName = 'FadeIn'

// Componente para animações de slide
export const SlideIn = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & {
    direction?: 'up' | 'down' | 'left' | 'right'
    delay?: number
    duration?: number
  }
>(({ className, children, direction = 'up', delay = 0, duration = 0.3, ...props }, ref) => {
  const slideClasses = {
    up: 'animate-in slide-in-from-bottom-4',
    down: 'animate-in slide-in-from-top-4',
    left: 'animate-in slide-in-from-right-4',
    right: 'animate-in slide-in-from-left-4'
  }

  return (
    <div
      ref={ref}
      className={cn(
        slideClasses[direction],
        'duration-300',
        className
      )}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}s`
      }}
      {...props}
    >
      {children}
    </div>
  )
})
SlideIn.displayName = 'SlideIn'

// Componente para animações de escala
export const ScaleIn = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & {
    delay?: number
    duration?: number
  }
>(({ className, children, delay = 0, duration = 0.3, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'animate-in zoom-in-95 duration-300',
        className
      )}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}s`
      }}
      {...props}
    >
      {children}
    </div>
  )
})
ScaleIn.displayName = 'ScaleIn'

// Componente para loading skeleton
export const Skeleton = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'animate-pulse rounded-md bg-muted',
        className
      )}
      {...props}
    />
  )
})
Skeleton.displayName = 'Skeleton'

// Componente para hover com escala
export const HoverScale = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & {
    scale?: number
  }
>(({ className, children, scale = 1.05, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'cursor-pointer transition-transform duration-200 hover:scale-105',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
HoverScale.displayName = 'HoverScale'

// Componente para animações de bounce
export const BounceIn = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & {
    delay?: number
    duration?: number
  }
>(({ className, children, delay = 0, duration = 0.6, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'animate-in zoom-in-50 duration-500',
        className
      )}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}s`,
        animationTimingFunction: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
      }}
      {...props}
    >
      {children}
    </div>
  )
})
BounceIn.displayName = 'BounceIn'

// Hook para animações escalonadas
export function useStaggeredAnimation(count: number, delay: number = 0.1) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return {
    isVisible,
    getDelay: (index: number) => index * delay
  }
}

// Componente para listas com animação escalonada
export const StaggeredList = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & {
    staggerDelay?: number
  }
>(({ className, children, staggerDelay = 0.1, ...props }, ref) => {
  return (
    <div ref={ref} className={cn(className)} {...props}>
      {React.Children.map(children, (child, index) => (
        <div
          key={index}
          className="animate-in fade-in-0 slide-in-from-bottom-4 duration-300"
          style={{
            animationDelay: `${index * staggerDelay * 1000}ms`
          }}
        >
          {child}
        </div>
      ))}
    </div>
  )
})
StaggeredList.displayName = 'StaggeredList'