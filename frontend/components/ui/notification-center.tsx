'use client'

import { Bell, Check, X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useNotifications, type Notification } from '@/hooks/useNotifications'
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

function getNotificationIcon(type: Notification['type']) {
  switch (type) {
    case 'success':
      return <CheckCircle className="w-4 h-4 text-green-500" aria-hidden="true" />
    case 'warning':
      return <AlertTriangle className="w-4 h-4 text-yellow-500" aria-hidden="true" />
    case 'error':
      return <AlertCircle className="w-4 h-4 text-red-500" aria-hidden="true" />
    default:
      return <Info className="w-4 h-4 text-blue-500" aria-hidden="true" />
  }
}

function NotificationItem({ notification, onMarkAsRead, onRemove }: {
  notification: Notification
  onMarkAsRead: (id: string) => void
  onRemove: (id: string) => void
}) {
  return (
    <div 
      className={`p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 ${
        !notification.read ? 'bg-blue-50 dark:bg-blue-950/20' : ''
      }`}
      role="listitem"
      aria-label={`Notificação: ${notification.title}`}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          {getNotificationIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {notification.title}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {notification.message}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                {formatDistanceToNow(notification.timestamp, { 
                  addSuffix: true, 
                  locale: ptBR 
                })}
              </p>
            </div>
            <div className="flex items-center space-x-1 ml-2">
              {!notification.read && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                  onClick={() => onMarkAsRead(notification.id)}
                  aria-label="Marcar notificação como lida"
                  title="Marcar como lida"
                >
                  <Check className="w-3 h-3" aria-hidden="true" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-gray-400 hover:text-red-500 focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                onClick={() => onRemove(notification.id)}
                aria-label="Remover notificação"
                title="Remover notificação"
              >
                <X className="w-3 h-3" aria-hidden="true" />
              </Button>
            </div>
          </div>
          {notification.action && (
            <Button
              variant="outline"
              size="sm"
              className="mt-2 h-7 text-xs focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              onClick={notification.action.onClick}
              aria-label={`Ação: ${notification.action.label}`}
            >
              {notification.action.label}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export function NotificationCenter() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  } = useNotifications()

  const { containerRef } = useKeyboardNavigation({
    orientation: 'vertical',
    loop: true
  })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="relative focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label={`Notificações${unreadCount > 0 ? ` (${unreadCount} não lidas)` : ''}`}
        >
          <Bell className="w-5 h-5" aria-hidden="true" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs"
              aria-label={`${unreadCount} notificações não lidas`}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-80" 
        align="end" 
        forceMount
        role="region"
        aria-label="Centro de notificações"
      >
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
          <h3 
            className="text-sm font-semibold text-gray-900 dark:text-gray-100"
            id="notifications-heading"
          >
            Notificações
          </h3>
          {notifications.length > 0 && (
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                  onClick={markAllAsRead}
                  aria-label="Marcar todas as notificações como lidas"
                >
                  Marcar todas como lidas
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-red-600 hover:text-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                onClick={clearAll}
                aria-label="Limpar todas as notificações"
              >
                Limpar todas
              </Button>
            </div>
          )}
        </div>
        
        {notifications.length === 0 ? (
          <div className="p-6 text-center" role="status" aria-live="polite">
            <Bell className="w-8 h-8 text-gray-400 mx-auto mb-2" aria-hidden="true" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Nenhuma notificação
            </p>
          </div>
        ) : (
          <ScrollArea 
            className="max-h-96"
            role="list"
            aria-labelledby="notifications-heading"
            aria-live="polite"
          >
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
                onRemove={removeNotification}
              />
            ))}
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}