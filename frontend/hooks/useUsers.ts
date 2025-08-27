import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  User,
  UserCreate,
  UserUpdate,
  UserListResponse,
  UserFilters,
  UserSession,
  UserAudit
} from '../types/users';
import { userService } from '../services/userService';

// Query keys
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters?: UserFilters) => [...userKeys.lists(), { filters }] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: number) => [...userKeys.details(), id] as const,
  current: () => [...userKeys.all, 'current'] as const,
  sessions: (userId: number) => [...userKeys.all, 'sessions', userId] as const,
  audit: (userId: number) => [...userKeys.all, 'audit', userId] as const,
};

// Hook for getting users list with filters and pagination
export function useUsers(params?: {
  page?: number;
  per_page?: number;
  filters?: UserFilters;
}) {
  return useQuery({
    queryKey: userKeys.list(params?.filters),
    queryFn: () => userService.getUsers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for getting a single user
export function useUser(id: number, enabled = true) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userService.getUserById(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Hook for getting current user
export function useCurrentUser() {
  return useQuery({
    queryKey: userKeys.current(),
    queryFn: () => userService.getCurrentUser(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 401 errors (unauthorized)
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

// Hook for getting user sessions
export function useUserSessions(userId: number, enabled = true) {
  return useQuery({
    queryKey: userKeys.sessions(userId),
    queryFn: () => userService.getUserSessions(userId),
    enabled: enabled && !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for getting user audit log
export function useUserAudit(
  userId: number,
  params?: {
    page?: number;
    per_page?: number;
    action?: string;
    resource_type?: string;
    date_from?: string;
    date_to?: string;
  },
  enabled = true
) {
  return useQuery({
    queryKey: [...userKeys.audit(userId), params],
    queryFn: () => userService.getUserAuditLog(userId, params),
    enabled: enabled && !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for creating a user
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: UserCreate) => userService.createUser(userData),
    onSuccess: (newUser) => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      
      // Add the new user to the cache
      queryClient.setQueryData(userKeys.detail(newUser.id), newUser);
      
      toast.success('Usuário criado com sucesso!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || 'Erro ao criar usuário';
      toast.error(message);
    },
  });
}

// Hook for updating a user
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userData }: { id: number; userData: UserUpdate }) =>
      userService.updateUser(id, userData),
    onSuccess: (updatedUser) => {
      // Update the user in the cache
      queryClient.setQueryData(userKeys.detail(updatedUser.id), updatedUser);
      
      // Invalidate users list to reflect changes
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      
      // If it's the current user, update current user cache
      const currentUser = queryClient.getQueryData(userKeys.current()) as User;
      if (currentUser && currentUser.id === updatedUser.id) {
        queryClient.setQueryData(userKeys.current(), updatedUser);
      }
      
      toast.success('Usuário atualizado com sucesso!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || 'Erro ao atualizar usuário';
      toast.error(message);
    },
  });
}

// Hook for deleting a user
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => userService.deleteUser(id),
    onSuccess: (_, deletedId) => {
      // Remove user from cache
      queryClient.removeQueries({ queryKey: userKeys.detail(deletedId) });
      
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      
      toast.success('Usuário removido com sucesso!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || 'Erro ao remover usuário';
      toast.error(message);
    },
  });
}

// Hook for toggling user status (activate/deactivate)
export function useToggleUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      userService.toggleUserStatus(id, isActive),
    onSuccess: (updatedUser) => {
      // Update the user in the cache
      queryClient.setQueryData(userKeys.detail(updatedUser.id), updatedUser);
      
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      
      const status = updatedUser.is_active ? 'ativado' : 'desativado';
      toast.success(`Usuário ${status} com sucesso!`);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || 'Erro ao alterar status do usuário';
      toast.error(message);
    },
  });
}

// Hook for resetting user password
export function useResetUserPassword() {
  return useMutation({
    mutationFn: ({ id, newPassword }: { id: number; newPassword: string }) =>
      userService.resetUserPassword(id, newPassword),
    onSuccess: () => {
      toast.success('Senha redefinida com sucesso!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || 'Erro ao redefinir senha';
      toast.error(message);
    },
  });
}

// Hook for unlocking user account
export function useUnlockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => userService.unlockUser(id),
    onSuccess: (updatedUser) => {
      // Update the user in the cache
      queryClient.setQueryData(userKeys.detail(updatedUser.id), updatedUser);
      
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      
      toast.success('Conta desbloqueada com sucesso!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || 'Erro ao desbloquear conta';
      toast.error(message);
    },
  });
}

// Hook for terminating user session
export function useTerminateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: number) => userService.terminateSession(sessionId),
    onSuccess: (_, sessionId) => {
      // Invalidate all user sessions queries
      queryClient.invalidateQueries({ 
        queryKey: userKeys.all,
        predicate: (query) => query.queryKey.includes('sessions')
      });
      
      toast.success('Sessão encerrada com sucesso!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || 'Erro ao encerrar sessão';
      toast.error(message);
    },
  });
}

// Custom hook for user management with common operations
export function useUserManagement() {
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const toggleStatus = useToggleUserStatus();
  const resetPassword = useResetUserPassword();
  const unlockUser = useUnlockUser();
  const terminateSession = useTerminateSession();

  return {
    createUser,
    updateUser,
    deleteUser,
    toggleStatus,
    resetPassword,
    unlockUser,
    terminateSession,
    isLoading: (
      createUser.isPending ||
      updateUser.isPending ||
      deleteUser.isPending ||
      toggleStatus.isPending ||
      resetPassword.isPending ||
      unlockUser.isPending ||
      terminateSession.isPending
    ),
  };
}

// Hook for user search and filtering
export function useUserSearch() {
  const queryClient = useQueryClient();

  const searchUsers = async (searchTerm: string, filters?: UserFilters) => {
    const searchFilters: UserFilters = {
      ...filters,
      search: searchTerm,
    };

    return queryClient.fetchQuery({
      queryKey: userKeys.list(searchFilters),
      queryFn: () => userService.getUsers({ filters: searchFilters }),
      staleTime: 30 * 1000, // 30 seconds for search results
    });
  };

  return { searchUsers };
}

export default {
  useUsers,
  useUser,
  useCurrentUser,
  useUserSessions,
  useUserAudit,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useToggleUserStatus,
  useResetUserPassword,
  useUnlockUser,
  useTerminateSession,
  useUserManagement,
  useUserSearch,
  userKeys,
};