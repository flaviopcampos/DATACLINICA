import api from './api';
import {
  User,
  UserCreate,
  UserUpdate,
  UserResponse,
  UserListResponse,
  UserFilters,
  UserRole,
  UserRoleCreate,
  UserRoleUpdate,
  Module,
  ModuleCreate,
  ModuleUpdate,
  RolePermission,
  RolePermissionCreate,
  RolePermissionUpdate,
  UserRoleAssignment,
  UserRoleAssignmentCreate,
  UserRoleAssignmentUpdate,
  UserSession,
  UserAudit,
  PermissionMatrix
} from '../types/users';

// User Management Services
export const userService = {
  // Get all users with filters and pagination
  async getUsers(params?: {
    page?: number;
    per_page?: number;
    filters?: UserFilters;
  }): Promise<UserListResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.per_page) searchParams.append('per_page', params.per_page.toString());
    
    if (params?.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const response = await api.get(`/users?${searchParams.toString()}`);
    return response.data;
  },

  // Get user by ID
  async getUserById(id: number): Promise<User> {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Get current user
  async getCurrentUser(): Promise<User> {
    const response = await api.get('/users/me');
    return response.data;
  },

  // Create new user
  async createUser(userData: UserCreate): Promise<User> {
    const response = await api.post('/users', userData);
    return response.data;
  },

  // Update user
  async updateUser(id: number, userData: UserUpdate): Promise<User> {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  // Delete user (soft delete)
  async deleteUser(id: number): Promise<void> {
    await api.delete(`/users/${id}`);
  },

  // Activate/Deactivate user
  async toggleUserStatus(id: number, isActive: boolean): Promise<User> {
    const response = await api.patch(`/users/${id}/status`, { is_active: isActive });
    return response.data;
  },

  // Reset user password
  async resetUserPassword(id: number, newPassword: string): Promise<void> {
    await api.post(`/users/${id}/reset-password`, { password: newPassword });
  },

  // Unlock user account
  async unlockUser(id: number): Promise<User> {
    const response = await api.post(`/users/${id}/unlock`);
    return response.data;
  },

  // Get user sessions
  async getUserSessions(userId: number): Promise<UserSession[]> {
    const response = await api.get(`/users/${userId}/sessions`);
    return response.data;
  },

  // Terminate user session
  async terminateSession(sessionId: number): Promise<void> {
    await api.delete(`/auth/sessions/${sessionId}`);
  },

  // Get user audit log
  async getUserAuditLog(userId: number, params?: {
    page?: number;
    per_page?: number;
    action?: string;
    resource_type?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<{ audits: UserAudit[]; total: number }> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.per_page) searchParams.append('per_page', params.per_page.toString());
    if (params?.action) searchParams.append('action', params.action);
    if (params?.resource_type) searchParams.append('resource_type', params.resource_type);
    if (params?.date_from) searchParams.append('date_from', params.date_from);
    if (params?.date_to) searchParams.append('date_to', params.date_to);
    
    const response = await api.get(`/users/${userId}/audit?${searchParams.toString()}`);
    return response.data;
  }
};

// Role Management Services
export const roleService = {
  // Get all roles
  async getRoles(clinicId?: number): Promise<UserRole[]> {
    const params = clinicId ? `?clinic_id=${clinicId}` : '';
    const response = await api.get(`/permissions/roles${params}`);
    return response.data;
  },

  // Get role by ID
  async getRoleById(id: number): Promise<UserRole> {
    const response = await api.get(`/permissions/roles/${id}`);
    return response.data;
  },

  // Create new role
  async createRole(roleData: UserRoleCreate): Promise<UserRole> {
    const response = await api.post('/permissions/roles', roleData);
    return response.data;
  },

  // Update role
  async updateRole(id: number, roleData: UserRoleUpdate): Promise<UserRole> {
    const response = await api.put(`/permissions/roles/${id}`, roleData);
    return response.data;
  },

  // Delete role
  async deleteRole(id: number): Promise<void> {
    await api.delete(`/permissions/roles/${id}`);
  },

  // Get role permissions
  async getRolePermissions(roleId: number): Promise<RolePermission[]> {
    const response = await api.get(`/permissions/roles/${roleId}/permissions`);
    return response.data;
  },

  // Update role permissions
  async updateRolePermissions(roleId: number, permissions: RolePermissionCreate[]): Promise<RolePermission[]> {
    const response = await api.put(`/permissions/roles/${roleId}/permissions`, { permissions });
    return response.data;
  }
};

// Module Management Services
export const moduleService = {
  // Get all modules
  async getModules(): Promise<Module[]> {
    const response = await api.get('/permissions/modules');
    return response.data;
  },

  // Get module by ID
  async getModuleById(id: number): Promise<Module> {
    const response = await api.get(`/permissions/modules/${id}`);
    return response.data;
  },

  // Create new module
  async createModule(moduleData: ModuleCreate): Promise<Module> {
    const response = await api.post('/permissions/modules', moduleData);
    return response.data;
  },

  // Update module
  async updateModule(id: number, moduleData: ModuleUpdate): Promise<Module> {
    const response = await api.put(`/permissions/modules/${id}`, moduleData);
    return response.data;
  },

  // Delete module
  async deleteModule(id: number): Promise<void> {
    await api.delete(`/permissions/modules/${id}`);
  }
};

// Permission Management Services
export const permissionService = {
  // Get all permissions
  async getPermissions(): Promise<RolePermission[]> {
    const response = await api.get('/permissions');
    return response.data;
  },

  // Get permission by ID
  async getPermissionById(id: number): Promise<RolePermission> {
    const response = await api.get(`/permissions/${id}`);
    return response.data;
  },

  // Create new permission
  async createPermission(permissionData: RolePermissionCreate): Promise<RolePermission> {
    const response = await api.post('/permissions', permissionData);
    return response.data;
  },

  // Update permission
  async updatePermission(id: number, permissionData: RolePermissionUpdate): Promise<RolePermission> {
    const response = await api.put(`/permissions/${id}`, permissionData);
    return response.data;
  },

  // Delete permission
  async deletePermission(id: number): Promise<void> {
    await api.delete(`/permissions/${id}`);
  },

  // Get user permissions
  async getUserPermissions(userId: number): Promise<RolePermission[]> {
    const response = await api.get(`/permissions/user-permissions/${userId}`);
    return response.data;
  },

  // Get permission matrix for all roles
  async getPermissionMatrix(): Promise<PermissionMatrix[]> {
    const response = await api.get('/permissions/matrix');
    return response.data;
  },

  // Check if user has specific permission
  async checkUserPermission(userId: number, moduleCode: string, action: string): Promise<boolean> {
    const response = await api.get(`/permissions/check/${userId}/${moduleCode}/${action}`);
    return response.data.has_permission;
  }
};

// User Role Assignment Services
export const userRoleAssignmentService = {
  // Get user role assignments
  async getUserRoleAssignments(userId: number): Promise<UserRoleAssignment[]> {
    const response = await api.get(`/permissions/user-assignments?user_id=${userId}`);
    return response.data;
  },

  // Assign role to user
  async assignRoleToUser(assignmentData: UserRoleAssignmentCreate): Promise<UserRoleAssignment> {
    const response = await api.post('/permissions/user-assignments', assignmentData);
    return response.data;
  },

  // Update user role assignment
  async updateUserRoleAssignment(id: number, assignmentData: UserRoleAssignmentUpdate): Promise<UserRoleAssignment> {
    const response = await api.put(`/permissions/user-assignments/${id}`, assignmentData);
    return response.data;
  },

  // Remove role from user
  async removeRoleFromUser(id: number): Promise<void> {
    await api.delete(`/permissions/user-assignments/${id}`);
  },

  // Get all role assignments for a role
  async getRoleAssignments(roleId: number): Promise<UserRoleAssignment[]> {
    const response = await api.get(`/permissions/user-assignments?role_id=${roleId}`);
    return response.data;
  }
};

// Authentication Services
export const authService = {
  // Login
  async login(username: string, password: string): Promise<{ access_token: string; token_type: string; user: User }> {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await api.post('/token', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    return response.data;
  },

  // Logout
  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword
    });
  },

  // Request password reset
  async requestPasswordReset(email: string): Promise<void> {
    await api.post('/auth/request-password-reset', { email });
  },

  // Reset password with token
  async resetPassword(token: string, newPassword: string): Promise<void> {
    await api.post('/auth/reset-password', {
      token,
      new_password: newPassword
    });
  },

  // Verify token
  async verifyToken(): Promise<User> {
    const response = await api.get('/users/me');
    return response.data;
  },

  // Refresh token
  async refreshToken(): Promise<{ access_token: string; token_type: string }> {
    const response = await api.post('/auth/refresh');
    return response.data;
  }
};

// Utility functions
export const userUtils = {
  // Format user display name
  formatUserDisplayName(user: User): string {
    return user.full_name || user.username;
  },

  // Get user role display name
  getRoleDisplayName(role: string): string {
    const roleMap: Record<string, string> = {
      admin: 'Administrador',
      doctor: 'Médico',
      nurse: 'Enfermeiro(a)',
      receptionist: 'Recepcionista',
      manager: 'Gerente'
    };
    return roleMap[role] || role;
  },

  // Check if user is active
  isUserActive(user: User): boolean {
    if (!user.is_active) return false;
    if (user.locked_until && new Date(user.locked_until) > new Date()) return false;
    return true;
  },

  // Get user status
  getUserStatus(user: User): 'active' | 'inactive' | 'locked' {
    if (!user.is_active) return 'inactive';
    if (user.locked_until && new Date(user.locked_until) > new Date()) return 'locked';
    return 'active';
  },

  // Format last login
  formatLastLogin(lastLogin?: string): string {
    if (!lastLogin) return 'Nunca';
    return new Date(lastLogin).toLocaleString('pt-BR');
  },

  // Validate CPF
  validateCPF(cpf: string): boolean {
    cpf = cpf.replace(/[^\d]/g, '');
    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(9))) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(10))) return false;
    
    return true;
  },

  // Format CPF
  formatCPF(cpf: string): string {
    cpf = cpf.replace(/[^\d]/g, '');
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  },

  // Format phone
  formatPhone(phone: string): string {
    phone = phone.replace(/[^\d]/g, '');
    if (phone.length === 11) {
      return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (phone.length === 10) {
      return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return phone;
  }
};

export default {
  userService,
  roleService,
  moduleService,
  permissionService,
  userRoleAssignmentService,
  authService,
  userUtils
};