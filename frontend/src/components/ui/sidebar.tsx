"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { PanelLeft } from "lucide-react"

interface SidebarContextType {
  isOpen: boolean
  toggle: () => void
}

const SidebarContext = React.createContext<SidebarContextType | undefined>(undefined)

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

interface SidebarProviderProps {
  children: React.ReactNode
  defaultOpen?: boolean
}

export function SidebarProvider({ children, defaultOpen = true }: SidebarProviderProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)
  
  const toggle = React.useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])
  
  return (
    <SidebarContext.Provider value={{ isOpen, toggle }}>
      {children}
    </SidebarContext.Provider>
  )
}

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: "left" | "right"
}

export function Sidebar({ className, side = "left", children, ...props }: SidebarProps) {
  const { isOpen } = useSidebar()
  
  return (
    <div
      className={cn(
        "dataclinica-sidebar flex h-full w-64 flex-col transition-transform duration-200 ease-in-out",
        !isOpen && "-translate-x-full",
        side === "right" && "ml-auto",
        side === "right" && !isOpen && "translate-x-full",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function SidebarTrigger({ className, ...props }: React.ComponentProps<typeof Button>) {
  const { toggle } = useSidebar()
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      className={cn("h-9 w-9", className)}
      {...props}
    >
      <PanelLeft className="h-4 w-4" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
}

export function SidebarHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col gap-2 p-4 border-b", className)}
      {...props}
    />
  )
}

export function SidebarContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex-1 overflow-auto p-4", className)}
      {...props}
    />
  )
}

export function SidebarFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("p-4 border-t", className)}
      {...props}
    />
  )
}

export function SidebarNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav
      className={cn("flex flex-col space-y-1", className)}
      {...props}
    />
  )
}

interface SidebarNavItemProps extends React.HTMLAttributes<HTMLAnchorElement> {
  href?: string
  isActive?: boolean
}

export function SidebarNavItem({ 
  className, 
  isActive = false, 
  children, 
  ...props 
}: SidebarNavItemProps) {
  return (
    <a
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
        isActive && "bg-accent text-accent-foreground",
        className
      )}
      {...props}
    >
      {children}
    </a>
  )
}