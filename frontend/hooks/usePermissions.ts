import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Module,
  ModuleCreate,
  ModuleUpdate,
  RolePermission,
  RolePermissionCreate,
  RolePermissionUpdate,
  PermissionMatrix
} from '../types/users';
import {
  moduleService,
  permissionService
} from '../services/userService';

// Query keys
export const permissionKeys = {
  all: ['permissions'] as const,
  lists: () => [...permissionKeys.all, 'list'] as const,
  details: () => [...permissionKeys.all, 'detail'] as const,
  detail: (id: number) => [...permissionKeys.details(), id] as const,
  user: (userId: number) => [...permissionKeys.all, 'user', userId] as const,
  matrix: () => [...permissionKeys.all, 'matrix'] as const,
  check: (userId: number, moduleCode: string, action: string) => [
    ...permissionKeys.all, 'check', userId, moduleCode, action
  ] as const,
};

export const moduleKeys = {
  all: ['modules'] as const,
  lists: () => [...moduleKeys.all, 'list'] as const,
  details: () => [...moduleKeys.all, 'detail'] as const,
  detail: (id: number) => [...moduleKeys.details(), id] as const,
};

// Hook for getting all modules
export function useModules() {
  return useQuery({
    queryKey: moduleKeys.lists(),
    queryFn: () => moduleService.getModules(),
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}

// Hook for getting a single module
export function useModule(id: number, enabled = true) {
  return useQuery({
    queryKey: moduleKeys.detail(id),
    queryFn: () => moduleService.getModuleById(id),
    enabled: enabled && !!id,
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
}

// Hook for getting all permissions
export function usePermissions() {
  return useQuery({
    queryKey: permissionKeys.lists(),
    queryFn: () => permissionService.getPermissions(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Hook for getting a single permission
export function usePermission(id: number, enabled = true) {
  return useQuery({
    queryKey: permissionKeys.detail(id),
    queryFn: () => permissionService.getPermissionById(id),
    enabled: enabled && !!id,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

// Hook for getting user permissions
export function useUserPermissions(userId: number, enabled = true) {
  return useQuery({
    queryKey: permissionKeys.user(userId),
    queryFn: () => permissionService.getUserPermissions(userId),
    enabled: enabled && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

// Hook for getting permission matrix
export function usePermissionMatrix() {
  return useQuery({
    queryKey: permissionKeys.matrix(),
    queryFn: () => permissionService.getPermissionMatrix(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Hook for checking specific user permission
export function useCheckUserPermission(
  userId: number,
  moduleCode: string,
  action: string,
  enabled = true
) {
  return useQuery({
    queryKey: permissionKeys.check(userId, moduleCode, action),
    queryFn: () => permissionService.checkUserPermission(userId, moduleCode, action),
    enabled: enabled && !!userId && !!moduleCode && !!action,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for creating a module
export function useCreateModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (moduleData: ModuleCreate) => moduleService.createModule(moduleData),
    onSuccess: (newModule) => {
      // Invalidate and refetch modules list
      queryClient.invalidateQueries({ queryKey: moduleKeys.lists() });
      
      // Add the new module to the cache
      queryClient.setQueryData(moduleKeys.detail(newModule.id), newModule);
      
      // Invalidate permission matrix as it might be affected
      queryClient.invalidateQueries({ queryKey: permissionKeys.matrix() });
      
      toast.success('Módulo criado com sucesso!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || 'Erro ao criar módulo';
      toast.error(message);
    },
  });
}

// Hook for updating a module
export function useUpdateModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, moduleData }: { id: number; moduleData: ModuleUpdate }) =>
      moduleService.updateModule(id, moduleData),
    onSuccess: (updatedModule) => {
      // Update the module in the cache
      queryClient.setQueryData(moduleKeys.detail(updatedModule.id), updatedModule);
      
      // Invalidate modules list to reflect changes
      queryClient.invalidateQueries({ queryKey: moduleKeys.lists() });
      
      // Invalidate permission matrix
      queryClient.invalidateQueries({ queryKey: permissionKeys.matrix() });
      
      toast.success('Módulo atualizado com sucesso!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || 'Erro ao atualizar módulo';
      toast.error(message);
    },
  });
}

// Hook for deleting a module
export function useDeleteModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => moduleService.deleteModule(id),
    onSuccess: (_, deletedId) => {
      // Remove module from cache
      queryClient.removeQueries({ queryKey: moduleKeys.detail(deletedId) });
      
      // Invalidate modules list
      queryClient.invalidateQueries({ queryKey: moduleKeys.lists() });
      
      // Invalidate permission matrix and all permissions
      queryClient.invalidateQueries({ queryKey: permissionKeys.matrix() });
      queryClient.invalidateQueries({ queryKey: permissionKeys.lists() });
      
      toast.success('Módulo removido com sucesso!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || 'Erro ao remover módulo';
      toast.error(message);
    },
  });
}

// Hook for creating a permission
export function useCreatePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (permissionData: RolePermissionCreate) =>
      permissionService.createPermission(permissionData),
    onSuccess: (newPermission) => {
      // Invalidate and refetch permissions list
      queryClient.invalidateQueries({ queryKey: permissionKeys.lists() });
      
      // Add the new permission to the cache
      queryClient.setQueryData(permissionKeys.detail(newPermission.id), newPermission);
      
      // Invalidate permission matrix
      queryClient.invalidateQueries({ queryKey: permissionKeys.matrix() });
      
      toast.success('Permissão criada com sucesso!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || 'Erro ao criar permissão';
      toast.error(message);
    },
  });
}

// Hook for updating a permission
export function useUpdatePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, permissionData }: { id: number; permissionData: RolePermissionUpdate }) =>
      permissionService.updatePermission(id, permissionData),
    onSuccess: (updatedPermission) => {
      // Update the permission in the cache
      queryClient.setQueryData(permissionKeys.detail(updatedPermission.id), updatedPermission);
      
      // Invalidate permissions list to reflect changes
      queryClient.invalidateQueries({ queryKey: permissionKeys.lists() });
      
      // Invalidate permission matrix and user permissions
      queryClient.invalidateQueries({ queryKey: permissionKeys.matrix() });
      queryClient.invalidateQueries({ queryKey: permissionKeys.all, predicate: (query) => 
        query.queryKey.includes('user') 
      });
      
      toast.success('Permissão atualizada com sucesso!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || 'Erro ao atualizar permissão';
      toast.error(message);
    },
  });
}

// Hook for deleting a permission
export function useDeletePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => permissionService.deletePermission(id),
    onSuccess: (_, deletedId) => {
      // Remove permission from cache
      queryClient.removeQueries({ queryKey: permissionKeys.detail(deletedId) });
      
      // Invalidate permissions list
      queryClient.invalidateQueries({ queryKey: permissionKeys.lists() });
      
      // Invalidate permission matrix and user permissions
      queryClient.invalidateQueries({ queryKey: permissionKeys.matrix() });
      queryClient.invalidateQueries({ queryKey: permissionKeys.all, predicate: (query) => 
        query.queryKey.includes('user') 
      });
      
      toast.success('Permissão removida com sucesso!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || 'Erro ao remover permissão';
      toast.error(message);
    },
  });
}

// Custom hook for permission management with common operations
export function usePermissionManagement() {
  const createModule = useCreateModule();
  const updateModule = useUpdateModule();
  const deleteModule = useDeleteModule();
  const createPermission = useCreatePermission();
  const updatePermission = useUpdatePermission();
  const deletePermission = useDeletePermission();

  return {
    createModule,
    updateModule,
    deleteModule,
    createPermission,
    updatePermission,
    deletePermission,
    isLoading: (
      createModule.isPending ||
      updateModule.isPending ||
      deleteModule.isPending ||
      createPermission.isPending ||
      updatePermission.isPending ||
      deletePermission.isPending
    ),
  };
}

// Hook for permission utilities
export function usePermissionUtils() {
  const queryClient = useQueryClient();

  // Check if current user has permission
  const hasPermission = (moduleCode: string, action: string, userId?: number) => {
    if (!userId) return false;
    
    const userPermissions = queryClient.getQueryData(
      permissionKeys.user(userId)
    ) as RolePermission[];
    
    return userPermissions?.some(permission => 
      permission.module?.code === moduleCode && 
      permission.action === action &&
      permission.is_active
    ) || false;
  };

  // Get user permissions by module
  const getUserPermissionsByModule = (userId: number, moduleCode: string) => {
    const userPermissions = queryClient.getQueryData(
      permissionKeys.user(userId)
    ) as RolePermission[];
    
    return userPermissions?.filter(permission => 
      permission.module?.code === moduleCode && permission.is_active
    ) || [];
  };

  // Get all available actions for a module
  const getModuleActions = (moduleCode: string) => {
    const permissions = queryClient.getQueryData(
      permissionKeys.lists()
    ) as RolePermission[];
    
    const modulePermissions = permissions?.filter(permission => 
      permission.module?.code === moduleCode
    ) || [];
    
    return [...new Set(modulePermissions.map(p => p.action))];
  };

  // Check if module exists
  const moduleExists = (moduleCode: string) => {
    const modules = queryClient.getQueryData(moduleKeys.lists()) as Module[];
    return modules?.some(module => module.code === moduleCode) || false;
  };

  // Get module by code
  const getModuleByCode = (moduleCode: string) => {
    const modules = queryClient.getQueryData(moduleKeys.lists()) as Module[];
    return modules?.find(module => module.code === moduleCode);
  };

  // Format permission display name
  const formatPermissionName = (moduleCode: string, action: string) => {
    const actionMap: Record<string, string> = {
      create: 'Criar',
      read: 'Visualizar',
      update: 'Editar',
      delete: 'Excluir',
      manage: 'Gerenciar',
      export: 'Exportar',
      import: 'Importar',
      approve: 'Aprovar',
      reject: 'Rejeitar'
    };
    
    const module = getModuleByCode(moduleCode);
    const moduleName = module?.name || moduleCode;
    const actionName = actionMap[action] || action;
    
    return `${actionName} ${moduleName}`;
  };

  return {
    hasPermission,
    getUserPermissionsByModule,
    getModuleActions,
    moduleExists,
    getModuleByCode,
    formatPermissionName,
  };
}

// Hook for permission checking with caching
export function usePermissionChecker(userId?: number) {
  const queryClient = useQueryClient();

  const checkPermission = async (moduleCode: string, action: string) => {
    if (!userId) return false;

    try {
      return await queryClient.fetchQuery({
        queryKey: permissionKeys.check(userId, moduleCode, action),
        queryFn: () => permissionService.checkUserPermission(userId, moduleCode, action),
        staleTime: 2 * 60 * 1000, // 2 minutes
      });
    } catch {
      return false;
    }
  };

  const checkMultiplePermissions = async (permissions: Array<{ moduleCode: string; action: string }>) => {
    if (!userId) return permissions.map(() => false);

    const results = await Promise.allSettled(
      permissions.map(({ moduleCode, action }) => checkPermission(moduleCode, action))
    );

    return results.map(result => 
      result.status === 'fulfilled' ? result.value : false
    );
  };

  return {
    checkPermission,
    checkMultiplePermissions,
  };
}

export default {
  useModules,
  useModule,
  usePermissions,
  usePermission,
  useUserPermissions,
  usePermissionMatrix,
  useCheckUserPermission,
  useCreateModule,
  useUpdateModule,
  useDeleteModule,
  useCreatePermission,
  useUpdatePermission,
  useDeletePermission,
  usePermissionManagement,
  usePermissionUtils,
  usePermissionChecker,
  permissionKeys,
  moduleKeys,
};