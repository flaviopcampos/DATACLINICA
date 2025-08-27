export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  clinic_id?: number;
  phone?: string;
  cpf?: string;
  professional_license?: string;
  specialty?: string;
  last_login?: string;
  failed_login_attempts: number;
  locked_until?: string;
  created_at: string;
  updated_at: string;
}

export interface UserCreate {
  username: string;
  email: string;
  full_name: string;
  role: string;
  password: string;
  is_active?: boolean;
  clinic_id?: number;
  phone?: string;
  cpf?: string;
  professional_license?: string;
  specialty?: string;
}

export interface UserUpdate {
  username?: string;
  email?: string;
  full_name?: string;
  role?: string;
  is_active?: boolean;
  clinic_id?: number;
  phone?: string;
  cpf?: string;
  professional_license?: string;
  specialty?: string;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  clinic_id?: number;
  phone?: string;
  cpf?: string;
  professional_license?: string;
  specialty?: string;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

// Role Types
export interface UserRole {
  id: number;
  clinic_id: number;
  name: string;
  code: string;
  description?: string;
  is_system_role: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRoleCreate {
  name: string;
  code: string;
  description?: string;
  clinic_id: number;
  is_system_role?: boolean;
  is_active?: boolean;
}

export interface UserRoleUpdate {
  name?: string;
  code?: string;
  description?: string;
  is_system_role?: boolean;
  is_active?: boolean;
}

// Module Types
export interface Module {
  id: number;
  name: string;
  code: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface ModuleCreate {
  name: string;
  code: string;
  description?: string;
  is_active?: boolean;
}

export interface ModuleUpdate {
  name?: string;
  code?: string;
  description?: string;
  is_active?: boolean;
}

// Permission Types
export interface RolePermission {
  id: number;
  role_id: number;
  module_id: number;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_export: boolean;
  can_import: boolean;
  custom_permissions?: Record<string, any>;
  created_at: string;
}

export interface RolePermissionCreate {
  role_id: number;
  module_id: number;
  can_view?: boolean;
  can_create?: boolean;
  can_edit?: boolean;
  can_delete?: boolean;
  can_export?: boolean;
  can_import?: boolean;
  custom_permissions?: Record<string, any>;
}

export interface RolePermissionUpdate {
  can_view?: boolean;
  can_create?: boolean;
  can_edit?: boolean;
  can_delete?: boolean;
  can_export?: boolean;
  can_import?: boolean;
  custom_permissions?: Record<string, any>;
}

// User Role Assignment Types
export interface UserRoleAssignment {
  id: number;
  user_id: number;
  role_id: number;
  assigned_by: number;
  assigned_at: string;
  expires_at?: string;
  is_active: boolean;
}

export interface UserRoleAssignmentCreate {
  user_id: number;
  role_id: number;
  assigned_by: number;
  expires_at?: string;
}

export interface UserRoleAssignmentUpdate {
  expires_at?: string;
  is_active?: boolean;
}

// User Session Types
export interface UserSession {
  id: number;
  user_id: number;
  session_token: string;
  ip_address?: string;
  user_agent?: string;
  is_active: boolean;
  last_activity: string;
  created_at: string;
}

export interface UserSessionCreate {
  user_id: number;
  session_token: string;
  ip_address?: string;
  user_agent?: string;
}

export interface UserSessionUpdate {
  is_active?: boolean;
  last_activity?: string;
}

// Audit Types
export interface UserAudit {
  id: number;
  user_id: number;
  action: string;
  resource_type: string;
  resource_id?: number;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface UserAuditCreate {
  user_id: number;
  action: string;
  resource_type: string;
  resource_id?: number;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

// Filter and Search Types
export interface UserFilters {
  search?: string;
  role?: string;
  is_active?: boolean;
  clinic_id?: number;
  specialty?: string;
  created_after?: string;
  created_before?: string;
  last_login_after?: string;
  last_login_before?: string;
}

export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// Permission Matrix Types
export interface PermissionMatrix {
  role_id: number;
  role_name: string;
  modules: {
    module_id: number;
    module_name: string;
    module_code: string;
    permissions: {
      can_view: boolean;
      can_create: boolean;
      can_edit: boolean;
      can_delete: boolean;
      can_export: boolean;
      can_import: boolean;
      custom_permissions?: Record<string, any>;
    };
  }[];
}

// System Roles Constants
export const SYSTEM_ROLES = {
  ADMIN: 'admin',
  DOCTOR: 'doctor',
  NURSE: 'nurse',
  RECEPTIONIST: 'receptionist',
  MANAGER: 'manager'
} as const;

export type SystemRole = typeof SYSTEM_ROLES[keyof typeof SYSTEM_ROLES];

// User Status Constants
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  LOCKED: 'locked',
  PENDING: 'pending'
} as const;

export type UserStatus = typeof USER_STATUS[keyof typeof USER_STATUS];

// Action Types for Audit
export const AUDIT_ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  VIEW: 'view',
  LOGIN: 'login',
  LOGOUT: 'logout',
  PASSWORD_CHANGE: 'password_change',
  ROLE_ASSIGN: 'role_assign',
  ROLE_REVOKE: 'role_revoke',
  PERMISSION_GRANT: 'permission_grant',
  PERMISSION_REVOKE: 'permission_revoke'
} as const;

export type AuditAction = typeof AUDIT_ACTIONS[keyof typeof AUDIT_ACTIONS];

// Resource Types for Audit
export const RESOURCE_TYPES = {
  USER: 'user',
  ROLE: 'role',
  PERMISSION: 'permission',
  MODULE: 'module',
  SESSION: 'session'
} as const;

export type ResourceType = typeof RESOURCE_TYPES[keyof typeof RESOURCE_TYPES];