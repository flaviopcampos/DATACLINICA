import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  UserRole,
  UserRoleCreate,
  UserRoleUpdate,
  RolePermission,
  RolePermissionCreate,
  UserRoleAssignment,
  UserRoleAssignmentCreate,
  UserRoleAssignmentUpdate
} from '../types/users';
import {
  roleService,
  permissionService,
  userRoleAssignmentService
} from '../services/userService';

// Query keys
export const roleKeys = {
  all: ['roles'] as const,
  lists: () => [...roleKeys.all, 'list'] as const,
  list: (clinicId?: number) => [...roleKeys.lists(), { clinicId }] as const,
  details: () => [...roleKeys.all, 'detail'] as const,
  detail: (id: number) => [...roleKeys.details(), id] as const,
  permissions: (roleId: number) => [...roleKeys.all, 'permissions', roleId] as const,
  assignments: () => [...roleKeys.all, 'assignments'] as const,
  userAssignments: (userId: number) => [...roleKeys.assignments(), 'user', userId] as const,
  roleAssignments: (roleId: number) => [...roleKeys.assignments(), 'role', roleId] as const,
};

// Hook for getting all roles
export function useRoles(clinicId?: number) {
  return useQuery({
    queryKey: roleKeys.list(clinicId),
    queryFn: () => roleService.getRoles(clinicId),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Hook for getting a single role
export function useRole(id: number, enabled = true) {
  return useQuery({
    queryKey: roleKeys.detail(id),
    queryFn: () => roleService.getRoleById(id),
    enabled: enabled && !!id,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

// Hook for getting role permissions
export function useRolePermissions(roleId: number, enabled = true) {
  return useQuery({
    queryKey: roleKeys.permissions(roleId),
    queryFn: () => roleService.getRolePermissions(roleId),
    enabled: enabled && !!roleId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

// Hook for getting user role assignments
export function useUserRoleAssignments(userId: number, enabled = true) {
  return useQuery({
    queryKey: roleKeys.userAssignments(userId),
    queryFn: () => userRoleAssignmentService.getUserRoleAssignments(userId),
    enabled: enabled && !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}

// Hook for getting role assignments (users with specific role)
export function useRoleAssignments(roleId: number, enabled = true) {
  return useQuery({
    queryKey: roleKeys.roleAssignments(roleId),
    queryFn: () => userRoleAssignmentService.getRoleAssignments(roleId),
    enabled: enabled && !!roleId,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}

// Hook for creating a role
export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roleData: UserRoleCreate) => roleService.createRole(roleData),
    onSuccess: (newRole) => {
      // Invalidate and refetch roles list
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      
      // Add the new role to the cache
      queryClient.setQueryData(roleKeys.detail(newRole.id), newRole);
      
      toast.success('Perfil criado com sucesso!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || 'Erro ao criar perfil';
      toast.error(message);
    },
  });
}

// Hook for updating a role
export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, roleData }: { id: number; roleData: UserRoleUpdate }) =>
      roleService.updateRole(id, roleData),
    onSuccess: (updatedRole) => {
      // Update the role in the cache
      queryClient.setQueryData(roleKeys.detail(updatedRole.id), updatedRole);
      
      // Invalidate roles list to reflect changes
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      
      toast.success('Perfil atualizado com sucesso!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || 'Erro ao atualizar perfil';
      toast.error(message);
    },
  });
}

// Hook for deleting a role
export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => roleService.deleteRole(id),
    onSuccess: (_, deletedId) => {
      // Remove role from cache
      queryClient.removeQueries({ queryKey: roleKeys.detail(deletedId) });
      queryClient.removeQueries({ queryKey: roleKeys.permissions(deletedId) });
      queryClient.removeQueries({ queryKey: roleKeys.roleAssignments(deletedId) });
      
      // Invalidate roles list
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      
      toast.success('Perfil removido com sucesso!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || 'Erro ao remover perfil';
      toast.error(message);
    },
  });
}

// Hook for updating role permissions
export function useUpdateRolePermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, permissions }: { roleId: number; permissions: RolePermissionCreate[] }) =>
      roleService.updateRolePermissions(roleId, permissions),
    onSuccess: (updatedPermissions, { roleId }) => {
      // Update role permissions in cache
      queryClient.setQueryData(roleKeys.permissions(roleId), updatedPermissions);
      
      // Invalidate permission matrix and user permissions
      queryClient.invalidateQueries({ queryKey: ['permissions', 'matrix'] });
      queryClient.invalidateQueries({ queryKey: ['permissions', 'user'] });
      
      toast.success('Permissões atualizadas com sucesso!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || 'Erro ao atualizar permissões';
      toast.error(message);
    },
  });
}

// Hook for assigning role to user
export function useAssignRoleToUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assignmentData: UserRoleAssignmentCreate) =>
      userRoleAssignmentService.assignRoleToUser(assignmentData),
    onSuccess: (newAssignment) => {
      // Invalidate user role assignments
      queryClient.invalidateQueries({ 
        queryKey: roleKeys.userAssignments(newAssignment.user_id) 
      });
      
      // Invalidate role assignments
      queryClient.invalidateQueries({ 
        queryKey: roleKeys.roleAssignments(newAssignment.role_id) 
      });
      
      // Invalidate user permissions
      queryClient.invalidateQueries({ 
        queryKey: ['permissions', 'user', newAssignment.user_id] 
      });
      
      toast.success('Perfil atribuído com sucesso!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || 'Erro ao atribuir perfil';
      toast.error(message);
    },
  });
}

// Hook for updating user role assignment
export function useUpdateUserRoleAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, assignmentData }: { id: number; assignmentData: UserRoleAssignmentUpdate }) =>
      userRoleAssignmentService.updateUserRoleAssignment(id, assignmentData),
    onSuccess: (updatedAssignment) => {
      // Invalidate user role assignments
      queryClient.invalidateQueries({ 
        queryKey: roleKeys.userAssignments(updatedAssignment.user_id) 
      });
      
      // Invalidate role assignments
      queryClient.invalidateQueries({ 
        queryKey: roleKeys.roleAssignments(updatedAssignment.role_id) 
      });
      
      toast.success('Atribuição de perfil atualizada com sucesso!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || 'Erro ao atualizar atribuição de perfil';
      toast.error(message);
    },
  });
}

// Hook for removing role from user
export function useRemoveRoleFromUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assignmentId: number) =>
      userRoleAssignmentService.removeRoleFromUser(assignmentId),
    onSuccess: (_, assignmentId) => {
      // Invalidate all role assignments queries
      queryClient.invalidateQueries({ queryKey: roleKeys.assignments() });
      
      // Invalidate user permissions
      queryClient.invalidateQueries({ queryKey: ['permissions', 'user'] });
      
      toast.success('Perfil removido do usuário com sucesso!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || 'Erro ao remover perfil do usuário';
      toast.error(message);
    },
  });
}

// Custom hook for role management with common operations
export function useRoleManagement() {
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();
  const updatePermissions = useUpdateRolePermissions();
  const assignRole = useAssignRoleToUser();
  const updateAssignment = useUpdateUserRoleAssignment();
  const removeRole = useRemoveRoleFromUser();

  return {
    createRole,
    updateRole,
    deleteRole,
    updatePermissions,
    assignRole,
    updateAssignment,
    removeRole,
    isLoading: (
      createRole.isPending ||
      updateRole.isPending ||
      deleteRole.isPending ||
      updatePermissions.isPending ||
      assignRole.isPending ||
      updateAssignment.isPending ||
      removeRole.isPending
    ),
  };
}

// Hook for role utilities
export function useRoleUtils() {
  const queryClient = useQueryClient();

  // Get role by name
  const getRoleByName = (roleName: string, clinicId?: number) => {
    const roles = queryClient.getQueryData(roleKeys.list(clinicId)) as UserRole[];
    return roles?.find(role => role.name.toLowerCase() === roleName.toLowerCase());
  };

  // Check if user has specific role
  const userHasRole = (userId: number, roleName: string) => {
    const assignments = queryClient.getQueryData(roleKeys.userAssignments(userId)) as UserRoleAssignment[];
    return assignments?.some(assignment => 
      assignment.role?.name.toLowerCase() === roleName.toLowerCase() &&
      assignment.is_active
    );
  };

  // Get user's active roles
  const getUserActiveRoles = (userId: number) => {
    const assignments = queryClient.getQueryData(roleKeys.userAssignments(userId)) as UserRoleAssignment[];
    return assignments?.filter(assignment => assignment.is_active).map(assignment => assignment.role) || [];
  };

  // Check if role can be deleted (no active assignments)
  const canDeleteRole = async (roleId: number) => {
    try {
      const assignments = await queryClient.fetchQuery({
        queryKey: roleKeys.roleAssignments(roleId),
        queryFn: () => userRoleAssignmentService.getRoleAssignments(roleId),
      });
      return assignments.filter(assignment => assignment.is_active).length === 0;
    } catch {
      return false;
    }
  };

  return {
    getRoleByName,
    userHasRole,
    getUserActiveRoles,
    canDeleteRole,
  };
}

export default {
  useRoles,
  useRole,
  useRolePermissions,
  useUserRoleAssignments,
  useRoleAssignments,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  useUpdateRolePermissions,
  useAssignRoleToUser,
  useUpdateUserRoleAssignment,
  useRemoveRoleFromUser,
  useRoleManagement,
  useRoleUtils,
  roleKeys,
};