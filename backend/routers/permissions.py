from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from database import get_db
from models import UserRole, Module, RolePermission, UserRoleAssignment, User
from schemas import (
    UserRoleCreate, UserRoleUpdate, UserRole as UserRoleSchema,
    ModuleCreate, ModuleUpdate, Module as ModuleSchema,
    RolePermissionCreate, RolePermission as RolePermissionSchema,
    UserRoleAssignmentCreate, UserRoleAssignment as UserRoleAssignmentSchema
)
from auth import get_current_user
from encryption import field_encryption

router = APIRouter(prefix="/permissions", tags=["Permissions"])

# User Role endpoints
@router.post("/roles/", response_model=UserRoleSchema)
def create_user_role(
    role: UserRoleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Criar um novo papel de usuário"""
    # Verificar se já existe um papel com o mesmo nome na clínica
    existing_role = db.query(UserRole).filter(
        UserRole.name == role.name,
        UserRole.clinic_id == current_user.clinic_id
    ).first()
    
    if existing_role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Já existe um papel com este nome"
        )
    
    # Apply encryption to sensitive fields
    role_data = field_encryption.encrypt_model_data(role.dict(), "UserRole")
    
    db_role = UserRole(
        **role_data,
        clinic_id=current_user.clinic_id,
        created_by=current_user.id
    )
    db.add(db_role)
    db.commit()
    db.refresh(db_role)
    return db_role

@router.get("/roles/", response_model=List[UserRoleSchema])
def get_user_roles(
    skip: int = 0,
    limit: int = 100,
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Listar papéis de usuário"""
    query = db.query(UserRole).filter(
        UserRole.clinic_id == current_user.clinic_id
    )
    
    if is_active is not None:
        query = query.filter(UserRole.is_active == is_active)
    
    if search:
        query = query.filter(
            UserRole.name.ilike(f"%{search}%") |
            UserRole.description.ilike(f"%{search}%")
        )
    
    return query.order_by(UserRole.name).offset(skip).limit(limit).all()

@router.get("/roles/{role_id}", response_model=UserRoleSchema)
def get_user_role(
    role_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obter detalhes de um papel de usuário"""
    role = db.query(UserRole).filter(
        UserRole.id == role_id,
        UserRole.clinic_id == current_user.clinic_id
    ).first()
    
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Papel de usuário não encontrado"
        )
    
    return role

@router.put("/roles/{role_id}", response_model=UserRoleSchema)
def update_user_role(
    role_id: int,
    role_update: UserRoleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Atualizar papel de usuário"""
    role = db.query(UserRole).filter(
        UserRole.id == role_id,
        UserRole.clinic_id == current_user.clinic_id
    ).first()
    
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Papel de usuário não encontrado"
        )
    
    # Verificar se o novo nome já existe (se foi alterado)
    if role_update.name and role_update.name != role.name:
        existing_role = db.query(UserRole).filter(
            UserRole.name == role_update.name,
            UserRole.clinic_id == current_user.clinic_id,
            UserRole.id != role_id
        ).first()
        
        if existing_role:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Já existe um papel com este nome"
            )
    
    update_data = role_update.dict(exclude_unset=True)
    # Apply encryption to sensitive fields
    encrypted_data = field_encryption.encrypt_model_data(update_data, "UserRole")
    for field, value in encrypted_data.items():
        setattr(role, field, value)
    
    role.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(role)
    return role

@router.delete("/roles/{role_id}")
def delete_user_role(
    role_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Excluir papel de usuário"""
    role = db.query(UserRole).filter(
        UserRole.id == role_id,
        UserRole.clinic_id == current_user.clinic_id
    ).first()
    
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Papel de usuário não encontrado"
        )
    
    # Verificar se há usuários atribuídos a este papel
    assignments = db.query(UserRoleAssignment).filter(
        UserRoleAssignment.role_id == role_id
    ).count()
    
    if assignments > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não é possível excluir papel que possui usuários atribuídos"
        )
    
    # Excluir permissões associadas
    db.query(RolePermission).filter(
        RolePermission.role_id == role_id
    ).delete()
    
    db.delete(role)
    db.commit()
    return {"message": "Papel de usuário excluído com sucesso"}

# Module endpoints
@router.post("/modules/", response_model=ModuleSchema)
def create_module(
    module: ModuleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Criar um novo módulo do sistema"""
    # Verificar se já existe um módulo com o mesmo nome
    existing_module = db.query(Module).filter(
        Module.name == module.name
    ).first()
    
    if existing_module:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Já existe um módulo com este nome"
        )
    
    # Apply encryption to sensitive fields
    module_data = field_encryption.encrypt_model_data(module.dict(), "Module")
    
    db_module = Module(**module_data)
    db.add(db_module)
    db.commit()
    db.refresh(db_module)
    return db_module

@router.get("/modules/", response_model=List[ModuleSchema])
def get_modules(
    skip: int = 0,
    limit: int = 100,
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Listar módulos do sistema"""
    query = db.query(Module)
    
    if is_active is not None:
        query = query.filter(Module.is_active == is_active)
    
    if search:
        query = query.filter(
            Module.name.ilike(f"%{search}%") |
            Module.description.ilike(f"%{search}%")
        )
    
    return query.order_by(Module.name).offset(skip).limit(limit).all()

@router.get("/modules/{module_id}", response_model=ModuleSchema)
def get_module(
    module_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obter detalhes de um módulo"""
    module = db.query(Module).filter(Module.id == module_id).first()
    
    if not module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Módulo não encontrado"
        )
    
    return module

@router.put("/modules/{module_id}", response_model=ModuleSchema)
def update_module(
    module_id: int,
    module_update: ModuleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Atualizar módulo do sistema"""
    module = db.query(Module).filter(Module.id == module_id).first()
    
    if not module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Módulo não encontrado"
        )
    
    # Verificar se o novo nome já existe (se foi alterado)
    if module_update.name and module_update.name != module.name:
        existing_module = db.query(Module).filter(
            Module.name == module_update.name,
            Module.id != module_id
        ).first()
        
        if existing_module:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Já existe um módulo com este nome"
            )
    
    update_data = module_update.dict(exclude_unset=True)
    # Apply encryption to sensitive fields
    encrypted_data = field_encryption.encrypt_model_data(update_data, "Module")
    for field, value in encrypted_data.items():
        setattr(module, field, value)
    
    module.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(module)
    return module

# Role Permission endpoints
@router.post("/role-permissions/", response_model=RolePermissionSchema)
def create_role_permission(
    permission: RolePermissionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Criar permissão para um papel"""
    # Verificar se o papel existe e pertence à clínica
    role = db.query(UserRole).filter(
        UserRole.id == permission.role_id,
        UserRole.clinic_id == current_user.clinic_id
    ).first()
    
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Papel de usuário não encontrado"
        )
    
    # Verificar se o módulo existe
    module = db.query(Module).filter(
        Module.id == permission.module_id
    ).first()
    
    if not module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Módulo não encontrado"
        )
    
    # Verificar se a permissão já existe
    existing_permission = db.query(RolePermission).filter(
        RolePermission.role_id == permission.role_id,
        RolePermission.module_id == permission.module_id
    ).first()
    
    if existing_permission:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Permissão já existe para este papel e módulo"
        )
    
    # Apply encryption to sensitive fields
    permission_data = field_encryption.encrypt_model_data(permission.dict(), "RolePermission")
    
    db_permission = RolePermission(**permission_data)
    db.add(db_permission)
    db.commit()
    db.refresh(db_permission)
    return db_permission

@router.get("/role-permissions/", response_model=List[RolePermissionSchema])
def get_role_permissions(
    skip: int = 0,
    limit: int = 100,
    role_id: Optional[int] = None,
    module_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Listar permissões de papéis"""
    # Subquery para obter apenas papéis da clínica do usuário
    role_subquery = db.query(UserRole.id).filter(
        UserRole.clinic_id == current_user.clinic_id
    ).subquery()
    
    query = db.query(RolePermission).filter(
        RolePermission.role_id.in_(role_subquery)
    )
    
    if role_id:
        query = query.filter(RolePermission.role_id == role_id)
    if module_id:
        query = query.filter(RolePermission.module_id == module_id)
    
    return query.offset(skip).limit(limit).all()

@router.get("/role-permissions/{permission_id}", response_model=RolePermissionSchema)
def get_role_permission(
    permission_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obter detalhes de uma permissão"""
    # Subquery para obter apenas papéis da clínica do usuário
    role_subquery = db.query(UserRole.id).filter(
        UserRole.clinic_id == current_user.clinic_id
    ).subquery()
    
    permission = db.query(RolePermission).filter(
        RolePermission.id == permission_id,
        RolePermission.role_id.in_(role_subquery)
    ).first()
    
    if not permission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Permissão não encontrada"
        )
    
    return permission

@router.delete("/role-permissions/{permission_id}")
def delete_role_permission(
    permission_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Excluir permissão de papel"""
    # Subquery para obter apenas papéis da clínica do usuário
    role_subquery = db.query(UserRole.id).filter(
        UserRole.clinic_id == current_user.clinic_id
    ).subquery()
    
    permission = db.query(RolePermission).filter(
        RolePermission.id == permission_id,
        RolePermission.role_id.in_(role_subquery)
    ).first()
    
    if not permission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Permissão não encontrada"
        )
    
    db.delete(permission)
    db.commit()
    return {"message": "Permissão excluída com sucesso"}

# User Role Assignment endpoints
@router.post("/user-assignments/", response_model=UserRoleAssignmentSchema)
def create_user_role_assignment(
    assignment: UserRoleAssignmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Atribuir papel a um usuário"""
    # Verificar se o usuário existe e pertence à clínica
    user = db.query(User).filter(
        User.id == assignment.user_id,
        User.clinic_id == current_user.clinic_id
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    # Verificar se o papel existe e pertence à clínica
    role = db.query(UserRole).filter(
        UserRole.id == assignment.role_id,
        UserRole.clinic_id == current_user.clinic_id
    ).first()
    
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Papel de usuário não encontrado"
        )
    
    # Verificar se a atribuição já existe
    existing_assignment = db.query(UserRoleAssignment).filter(
        UserRoleAssignment.user_id == assignment.user_id,
        UserRoleAssignment.role_id == assignment.role_id
    ).first()
    
    if existing_assignment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuário já possui este papel atribuído"
        )
    
    # Apply encryption to sensitive fields
    assignment_data = field_encryption.encrypt_model_data(assignment.dict(), "UserRoleAssignment")
    
    db_assignment = UserRoleAssignment(
        **assignment_data,
        assigned_by=current_user.id
    )
    db.add(db_assignment)
    db.commit()
    db.refresh(db_assignment)
    return db_assignment

@router.get("/user-assignments/", response_model=List[UserRoleAssignmentSchema])
def get_user_role_assignments(
    skip: int = 0,
    limit: int = 100,
    user_id: Optional[int] = None,
    role_id: Optional[int] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Listar atribuições de papéis"""
    # Subquery para obter apenas usuários da clínica
    user_subquery = db.query(User.id).filter(
        User.clinic_id == current_user.clinic_id
    ).subquery()
    
    # Subquery para obter apenas papéis da clínica
    role_subquery = db.query(UserRole.id).filter(
        UserRole.clinic_id == current_user.clinic_id
    ).subquery()
    
    query = db.query(UserRoleAssignment).filter(
        UserRoleAssignment.user_id.in_(user_subquery),
        UserRoleAssignment.role_id.in_(role_subquery)
    )
    
    if user_id:
        query = query.filter(UserRoleAssignment.user_id == user_id)
    if role_id:
        query = query.filter(UserRoleAssignment.role_id == role_id)
    if is_active is not None:
        query = query.filter(UserRoleAssignment.is_active == is_active)
    
    return query.order_by(UserRoleAssignment.assigned_at.desc()).offset(skip).limit(limit).all()

@router.get("/user-assignments/{assignment_id}", response_model=UserRoleAssignmentSchema)
def get_user_role_assignment(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obter detalhes de uma atribuição"""
    # Subquery para obter apenas usuários da clínica
    user_subquery = db.query(User.id).filter(
        User.clinic_id == current_user.clinic_id
    ).subquery()
    
    # Subquery para obter apenas papéis da clínica
    role_subquery = db.query(UserRole.id).filter(
        UserRole.clinic_id == current_user.clinic_id
    ).subquery()
    
    assignment = db.query(UserRoleAssignment).filter(
        UserRoleAssignment.id == assignment_id,
        UserRoleAssignment.user_id.in_(user_subquery),
        UserRoleAssignment.role_id.in_(role_subquery)
    ).first()
    
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Atribuição não encontrada"
        )
    
    return assignment

@router.put("/user-assignments/{assignment_id}/deactivate")
def deactivate_user_role_assignment(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Desativar atribuição de papel"""
    # Subquery para obter apenas usuários da clínica
    user_subquery = db.query(User.id).filter(
        User.clinic_id == current_user.clinic_id
    ).subquery()
    
    # Subquery para obter apenas papéis da clínica
    role_subquery = db.query(UserRole.id).filter(
        UserRole.clinic_id == current_user.clinic_id
    ).subquery()
    
    assignment = db.query(UserRoleAssignment).filter(
        UserRoleAssignment.id == assignment_id,
        UserRoleAssignment.user_id.in_(user_subquery),
        UserRoleAssignment.role_id.in_(role_subquery)
    ).first()
    
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Atribuição não encontrada"
        )
    
    assignment.is_active = False
    assignment.deactivated_at = datetime.utcnow()
    assignment.deactivated_by = current_user.id
    
    db.commit()
    return {"message": "Atribuição desativada com sucesso"}

@router.put("/user-assignments/{assignment_id}/activate")
def activate_user_role_assignment(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Reativar atribuição de papel"""
    # Subquery para obter apenas usuários da clínica
    user_subquery = db.query(User.id).filter(
        User.clinic_id == current_user.clinic_id
    ).subquery()
    
    # Subquery para obter apenas papéis da clínica
    role_subquery = db.query(UserRole.id).filter(
        UserRole.clinic_id == current_user.clinic_id
    ).subquery()
    
    assignment = db.query(UserRoleAssignment).filter(
        UserRoleAssignment.id == assignment_id,
        UserRoleAssignment.user_id.in_(user_subquery),
        UserRoleAssignment.role_id.in_(role_subquery)
    ).first()
    
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Atribuição não encontrada"
        )
    
    assignment.is_active = True
    assignment.deactivated_at = None
    assignment.deactivated_by = None
    
    db.commit()
    return {"message": "Atribuição reativada com sucesso"}

# Utility endpoints
@router.get("/user-permissions/{user_id}")
def get_user_permissions(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obter todas as permissões de um usuário"""
    # Verificar se o usuário existe e pertence à clínica
    user = db.query(User).filter(
        User.id == user_id,
        User.clinic_id == current_user.clinic_id
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    # Obter todas as permissões através dos papéis ativos
    permissions = db.query(
        Module.name.label("module_name"),
        Module.description.label("module_description"),
        RolePermission.can_create,
        RolePermission.can_read,
        RolePermission.can_update,
        RolePermission.can_delete,
        UserRole.name.label("role_name")
    ).join(
        RolePermission, Module.id == RolePermission.module_id
    ).join(
        UserRole, RolePermission.role_id == UserRole.id
    ).join(
        UserRoleAssignment, UserRole.id == UserRoleAssignment.role_id
    ).filter(
        UserRoleAssignment.user_id == user_id,
        UserRoleAssignment.is_active == True,
        UserRole.is_active == True,
        Module.is_active == True
    ).all()
    
    # Agrupar permissões por módulo
    grouped_permissions = {}
    for perm in permissions:
        module_name = perm.module_name
        if module_name not in grouped_permissions:
            grouped_permissions[module_name] = {
                "module_name": perm.module_name,
                "module_description": perm.module_description,
                "can_create": False,
                "can_read": False,
                "can_update": False,
                "can_delete": False,
                "roles": []
            }
        
        # Aplicar OR lógico nas permissões (se qualquer papel permitir, o usuário pode)
        grouped_permissions[module_name]["can_create"] |= perm.can_create
        grouped_permissions[module_name]["can_read"] |= perm.can_read
        grouped_permissions[module_name]["can_update"] |= perm.can_update
        grouped_permissions[module_name]["can_delete"] |= perm.can_delete
        grouped_permissions[module_name]["roles"].append(perm.role_name)
    
    return {
        "user_id": user_id,
        "user_name": user.name,
        "permissions": list(grouped_permissions.values())
    }