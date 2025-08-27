'use client';

import { useMemo } from 'react';
import { User } from '@/types/users';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  UserCheck,
  UserX,
  Crown,
  Stethoscope,
  Heart,
  UserPlus,
  Shield,
  AlertTriangle,
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  Lock,
} from 'lucide-react';
import { SYSTEM_ROLES, USER_STATUS } from '@/types/users';
import { cn } from '@/lib/utils';

interface UserStatsProps {
  users: User[];
  loading?: boolean;
  className?: string;
}

interface StatCard {
  title: string;
  value: number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function UserStats({ users, loading = false, className }: UserStatsProps) {
  const stats = useMemo(() => {
    if (!users || users.length === 0) {
      return {
        total: 0,
        active: 0,
        inactive: 0,
        locked: 0,
        admins: 0,
        doctors: 0,
        nurses: 0,
        receptionists: 0,
        recentLogins: 0,
        failedAttempts: 0,
      };
    }

    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return {
      total: users.length,
      active: users.filter(u => u.is_active).length,
      inactive: users.filter(u => !u.is_active).length,
      locked: users.filter(u => u.locked_until && new Date(u.locked_until) > now).length,
      admins: users.filter(u => u.role === SYSTEM_ROLES.ADMIN).length,
      doctors: users.filter(u => u.role === SYSTEM_ROLES.DOCTOR).length,
      nurses: users.filter(u => u.role === SYSTEM_ROLES.NURSE).length,
      receptionists: users.filter(u => u.role === SYSTEM_ROLES.RECEPTIONIST).length,
      recentLogins: users.filter(u => 
        u.last_login && new Date(u.last_login) > last24Hours
      ).length,
      failedAttempts: users.reduce((sum, u) => sum + (u.failed_login_attempts || 0), 0),
      newThisWeek: users.filter(u => 
        new Date(u.created_at) > last7Days
      ).length,
    };
  }, [users]);

  const statCards: StatCard[] = [
    {
      title: 'Total de Usuários',
      value: stats.total,
      description: 'Usuários cadastrados no sistema',
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'Usuários Ativos',
      value: stats.active,
      description: `${stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% do total`,
      icon: UserCheck,
      color: 'text-green-600',
    },
    {
      title: 'Usuários Inativos',
      value: stats.inactive,
      description: `${stats.total > 0 ? Math.round((stats.inactive / stats.total) * 100) : 0}% do total`,
      icon: UserX,
      color: 'text-gray-600',
    },
    {
      title: 'Contas Bloqueadas',
      value: stats.locked,
      description: 'Usuários temporariamente bloqueados',
      icon: Lock,
      color: 'text-red-600',
    },
  ];

  const roleCards: StatCard[] = [
    {
      title: 'Administradores',
      value: stats.admins,
      description: 'Usuários com acesso total',
      icon: Crown,
      color: 'text-purple-600',
    },
    {
      title: 'Médicos',
      value: stats.doctors,
      description: 'Profissionais médicos',
      icon: Stethoscope,
      color: 'text-blue-600',
    },
    {
      title: 'Enfermeiros',
      value: stats.nurses,
      description: 'Profissionais de enfermagem',
      icon: Heart,
      color: 'text-pink-600',
    },
    {
      title: 'Recepcionistas',
      value: stats.receptionists,
      description: 'Equipe de atendimento',
      icon: UserPlus,
      color: 'text-orange-600',
    },
  ];

  const activityCards: StatCard[] = [
    {
      title: 'Logins Recentes',
      value: stats.recentLogins,
      description: 'Últimas 24 horas',
      icon: Activity,
      color: 'text-green-600',
    },
    {
      title: 'Novos Usuários',
      value: stats.newThisWeek,
      description: 'Esta semana',
      icon: UserPlus,
      color: 'text-blue-600',
    },
    {
      title: 'Tentativas Falharam',
      value: stats.failedAttempts,
      description: 'Total de tentativas de login falharam',
      icon: AlertTriangle,
      color: 'text-amber-600',
    },
  ];

  const StatCardComponent = ({ stat }: { stat: StatCard }) => {
    const Icon = stat.icon;
    
    return (
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {stat.title}
          </CardTitle>
          <Icon className={cn('h-4 w-4', stat.color)} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? '...' : stat.value.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {stat.description}
          </p>
          {stat.trend && (
            <div className="flex items-center mt-2">
              {stat.trend.isPositive ? (
                <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
              )}
              <span className={cn(
                'text-xs font-medium',
                stat.trend.isPositive ? 'text-green-600' : 'text-red-600'
              )}>
                {stat.trend.value > 0 ? '+' : ''}{stat.trend.value}%
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const LoadingCard = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="h-4 bg-muted rounded w-24 animate-pulse" />
        <div className="h-4 w-4 bg-muted rounded animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="h-8 bg-muted rounded w-16 mb-2 animate-pulse" />
        <div className="h-3 bg-muted rounded w-32 animate-pulse" />
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className={cn('space-y-6', className)}>
        {/* Estatísticas Gerais */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Estatísticas Gerais</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <LoadingCard key={i} />
            ))}
          </div>
        </div>

        {/* Distribuição por Perfil */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Distribuição por Perfil</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <LoadingCard key={i} />
            ))}
          </div>
        </div>

        {/* Atividade */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Atividade</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <LoadingCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Estatísticas Gerais */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Estatísticas Gerais</h3>
          {stats.locked > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {stats.locked} conta{stats.locked > 1 ? 's' : ''} bloqueada{stats.locked > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <StatCardComponent key={index} stat={stat} />
          ))}
        </div>
      </div>

      {/* Distribuição por Perfil */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Distribuição por Perfil</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {roleCards.map((stat, index) => (
            <StatCardComponent key={index} stat={stat} />
          ))}
        </div>
      </div>

      {/* Atividade */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Atividade</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {activityCards.map((stat, index) => (
            <StatCardComponent key={index} stat={stat} />
          ))}
        </div>
      </div>

      {/* Resumo de Segurança */}
      {(stats.locked > 0 || stats.failedAttempts > 0) && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <Shield className="h-5 w-5" />
              Alertas de Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.locked > 0 && (
              <div className="flex items-center gap-2 text-amber-700">
                <Lock className="h-4 w-4" />
                <span className="text-sm">
                  {stats.locked} conta{stats.locked > 1 ? 's estão' : ' está'} temporariamente bloqueada{stats.locked > 1 ? 's' : ''}
                </span>
              </div>
            )}
            {stats.failedAttempts > 0 && (
              <div className="flex items-center gap-2 text-amber-700">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">
                  {stats.failedAttempts} tentativa{stats.failedAttempts > 1 ? 's' : ''} de login falharam no total
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Componente para exibir estatísticas resumidas (versão compacta)
export function UserStatsCompact({ users, loading = false, className }: UserStatsProps) {
  const stats = useMemo(() => {
    if (!users || users.length === 0) {
      return { total: 0, active: 0, inactive: 0, locked: 0 };
    }

    const now = new Date();
    return {
      total: users.length,
      active: users.filter(u => u.is_active).length,
      inactive: users.filter(u => !u.is_active).length,
      locked: users.filter(u => u.locked_until && new Date(u.locked_until) > now).length,
    };
  }, [users]);

  if (loading) {
    return (
      <div className={cn('flex items-center space-x-6', className)}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="text-center animate-pulse">
            <div className="h-6 w-8 bg-muted rounded mb-1" />
            <div className="h-3 w-12 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center space-x-6', className)}>
      <div className="text-center">
        <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
        <div className="text-xs text-muted-foreground">Total</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600">{stats.active}</div>
        <div className="text-xs text-muted-foreground">Ativos</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-600">{stats.inactive}</div>
        <div className="text-xs text-muted-foreground">Inativos</div>
      </div>
      {stats.locked > 0 && (
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{stats.locked}</div>
          <div className="text-xs text-muted-foreground">Bloqueados</div>
        </div>
      )}
    </div>
  );
}