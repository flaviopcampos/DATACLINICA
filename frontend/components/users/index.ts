// Componentes principais
export { UserForm } from './UserForm';
export { UserCard } from './UserCard';
export { UserList } from './UserList';
export { UserDialog } from './UserDialog';
export { UserStats, UserStatsCompact } from './UserStats';

// Componentes de roles e permissões
export { RoleSelector, RoleBadges } from './RoleSelector';
export { PermissionMatrix } from './PermissionMatrix';

// Tipos e interfaces (re-exportados para conveniência)
export type {
  User,
  UserCreate,
  UserUpdate,
  UserResponse,
  UserRole,
  UserFilters,
  UserListResponse,
  PermissionMatrix as PermissionMatrixType,
} from '@/types/users';