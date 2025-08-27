'use client';

import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface SettingsCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
  headerAction?: ReactNode;
  status?: 'active' | 'inactive' | 'warning' | 'error';
  statusText?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

const statusColors = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  warning: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800'
};

export function SettingsCard({
  title,
  description,
  icon: Icon,
  children,
  className,
  headerAction,
  status,
  statusText,
  collapsible = false,
  defaultCollapsed = false
}: SettingsCardProps) {
  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="p-2 bg-primary/10 rounded-lg">
                <Icon className="h-5 w-5 text-primary" />
              </div>
            )}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">{title}</CardTitle>
                {status && (
                  <Badge className={statusColors[status]}>
                    {statusText || status}
                  </Badge>
                )}
              </div>
              {description && (
                <CardDescription className="text-sm">
                  {description}
                </CardDescription>
              )}
            </div>
          </div>
          {headerAction && (
            <div className="flex items-center gap-2">
              {headerAction}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {children}
      </CardContent>
    </Card>
  );
}

// Componente para seções dentro do SettingsCard
interface SettingsSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function SettingsSection({
  title,
  description,
  children,
  className
}: SettingsSectionProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h4 className="text-sm font-medium text-foreground">{title}</h4>
          )}
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}

// Componente para itens de configuração individuais
interface SettingsItemProps {
  label: string;
  description?: string;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}

export function SettingsItem({
  label,
  description,
  children,
  className,
  disabled = false
}: SettingsItemProps) {
  return (
    <div className={cn(
      'flex items-center justify-between py-2',
      disabled && 'opacity-50 pointer-events-none',
      className
    )}>
      <div className="space-y-0.5 flex-1 mr-4">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
        {description && (
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      <div className="flex-shrink-0">
        {children}
      </div>
    </div>
  );
}

// Componente para grupos de configurações relacionadas
interface SettingsGroupProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export function SettingsGroup({
  title,
  description,
  children,
  className,
  collapsible = false,
  defaultCollapsed = false
}: SettingsGroupProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="border-b pb-2">
        <h3 className="text-base font-semibold">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}