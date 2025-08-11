#!/usr/bin/env python3
"""
DataClínica - Rotas de Controle de Estoque Ampliado

Este módulo implementa as rotas da API para controle avançado de estoque,
incluindo inventários, transferências, alertas e ajustes de estoque.
"""

from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func

from database import get_db
from auth import get_current_user
from models import (
    User, StockInventory, InventoryCount, StockAlert, StockTransfer,
    StockTransferItem, StockAdjustment, DepartmentStockLevel,
    Product, Supplier, StockMovement
)
from schemas import (
    StockInventoryCreate, StockInventoryUpdate, StockInventory as StockInventorySchema,
    InventoryCountCreate, InventoryCount as InventoryCountSchema,
    StockAlertCreate, StockAlert as StockAlertSchema,
    StockTransferCreate, StockTransferUpdate, StockTransfer as StockTransferSchema,
    StockAdjustmentCreate, StockAdjustment as StockAdjustmentSchema,
    DepartmentStockLevelCreate, DepartmentStockLevel as DepartmentStockLevelSchema
)
from encryption import field_encryption

router = APIRouter(
    prefix="/stock-management",
    tags=["Controle de Estoque Ampliado"]
)

# ==================== INVENTÁRIOS ====================

@router.post("/inventories/", response_model=StockInventorySchema)
async def create_inventory(
    inventory: StockInventoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Cria um novo inventário de estoque.
    """
    try:
        # Aplicar criptografia aos campos sensíveis
        inventory_data = field_encryption.encrypt_model_data(inventory.dict(), "StockInventory")
        
        db_inventory = StockInventory(
            **inventory_data,
            created_by=current_user.id,
            created_at=datetime.now()
        )
        
        db.add(db_inventory)
        db.commit()
        db.refresh(db_inventory)
        
        return db_inventory
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar inventário: {str(e)}"
        )

@router.get("/inventories/", response_model=List[StockInventorySchema])
async def get_inventories(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status_filter: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Lista todos os inventários de estoque.
    """
    query = db.query(StockInventory)
    
    if status_filter:
        query = query.filter(StockInventory.status == status_filter)
    
    inventories = query.offset(skip).limit(limit).all()
    return inventories

@router.get("/inventories/{inventory_id}", response_model=StockInventorySchema)
async def get_inventory(
    inventory_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obtém um inventário específico por ID.
    """
    inventory = db.query(StockInventory).filter(StockInventory.id == inventory_id).first()
    
    if not inventory:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventário não encontrado"
        )
    
    return inventory

@router.put("/inventories/{inventory_id}", response_model=StockInventorySchema)
async def update_inventory(
    inventory_id: int,
    inventory_update: StockInventoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Atualiza um inventário existente.
    """
    db_inventory = db.query(StockInventory).filter(StockInventory.id == inventory_id).first()
    
    if not db_inventory:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventário não encontrado"
        )
    
    try:
        update_data = inventory_update.dict(exclude_unset=True)
        encrypted_data = field_encryption.encrypt_model_data(update_data, "StockInventory")
        
        for field, value in encrypted_data.items():
            setattr(db_inventory, field, value)
        
        db_inventory.updated_at = datetime.now()
        db.commit()
        db.refresh(db_inventory)
        
        return db_inventory
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao atualizar inventário: {str(e)}"
        )

# ==================== CONTAGENS DE INVENTÁRIO ====================

@router.post("/inventory-counts/", response_model=InventoryCountSchema)
async def create_inventory_count(
    count: InventoryCountCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Registra uma contagem de inventário.
    """
    try:
        count_data = field_encryption.encrypt_model_data(count.dict(), "InventoryCount")
        
        db_count = InventoryCount(
            **count_data,
            counted_by=current_user.id,
            counted_at=datetime.now()
        )
        
        db.add(db_count)
        db.commit()
        db.refresh(db_count)
        
        return db_count
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao registrar contagem: {str(e)}"
        )

@router.get("/inventory-counts/", response_model=List[InventoryCountSchema])
async def get_inventory_counts(
    inventory_id: Optional[int] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Lista as contagens de inventário.
    """
    query = db.query(InventoryCount)
    
    if inventory_id:
        query = query.filter(InventoryCount.inventory_id == inventory_id)
    
    counts = query.offset(skip).limit(limit).all()
    return counts

# ==================== ALERTAS DE ESTOQUE ====================

@router.post("/alerts/", response_model=StockAlertSchema)
async def create_stock_alert(
    alert: StockAlertCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Cria um novo alerta de estoque.
    """
    try:
        alert_data = field_encryption.encrypt_model_data(alert.dict(), "StockAlert")
        
        db_alert = StockAlert(
            **alert_data,
            created_at=datetime.now()
        )
        
        db.add(db_alert)
        db.commit()
        db.refresh(db_alert)
        
        return db_alert
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar alerta: {str(e)}"
        )

@router.get("/alerts/", response_model=List[StockAlertSchema])
async def get_stock_alerts(
    active_only: bool = Query(True),
    alert_type: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Lista os alertas de estoque.
    """
    query = db.query(StockAlert)
    
    if active_only:
        query = query.filter(StockAlert.is_active == True)
    
    if alert_type:
        query = query.filter(StockAlert.alert_type == alert_type)
    
    alerts = query.order_by(StockAlert.created_at.desc()).offset(skip).limit(limit).all()
    return alerts

@router.put("/alerts/{alert_id}/resolve")
async def resolve_stock_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Resolve um alerta de estoque.
    """
    db_alert = db.query(StockAlert).filter(StockAlert.id == alert_id).first()
    
    if not db_alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alerta não encontrado"
        )
    
    try:
        db_alert.is_active = False
        db_alert.resolved_at = datetime.now()
        db_alert.resolved_by = current_user.id
        
        db.commit()
        
        return {"message": "Alerta resolvido com sucesso"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao resolver alerta: {str(e)}"
        )

# ==================== TRANSFERÊNCIAS DE ESTOQUE ====================

@router.post("/transfers/", response_model=StockTransferSchema)
async def create_stock_transfer(
    transfer: StockTransferCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Cria uma nova transferência de estoque.
    """
    try:
        transfer_data = field_encryption.encrypt_model_data(transfer.dict(), "StockTransfer")
        
        db_transfer = StockTransfer(
            **transfer_data,
            created_by=current_user.id,
            created_at=datetime.now(),
            status="pending"
        )
        
        db.add(db_transfer)
        db.commit()
        db.refresh(db_transfer)
        
        return db_transfer
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar transferência: {str(e)}"
        )

@router.get("/transfers/", response_model=List[StockTransferSchema])
async def get_stock_transfers(
    status_filter: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Lista as transferências de estoque.
    """
    query = db.query(StockTransfer)
    
    if status_filter:
        query = query.filter(StockTransfer.status == status_filter)
    
    transfers = query.order_by(StockTransfer.created_at.desc()).offset(skip).limit(limit).all()
    return transfers

@router.put("/transfers/{transfer_id}/approve")
async def approve_stock_transfer(
    transfer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Aprova uma transferência de estoque.
    """
    db_transfer = db.query(StockTransfer).filter(StockTransfer.id == transfer_id).first()
    
    if not db_transfer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transferência não encontrada"
        )
    
    try:
        db_transfer.status = "approved"
        db_transfer.approved_by = current_user.id
        db_transfer.approved_at = datetime.now()
        
        db.commit()
        
        return {"message": "Transferência aprovada com sucesso"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao aprovar transferência: {str(e)}"
        )

# ==================== AJUSTES DE ESTOQUE ====================

@router.post("/adjustments/", response_model=StockAdjustmentSchema)
async def create_stock_adjustment(
    adjustment: StockAdjustmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Cria um novo ajuste de estoque.
    """
    try:
        adjustment_data = field_encryption.encrypt_model_data(adjustment.dict(), "StockAdjustment")
        
        db_adjustment = StockAdjustment(
            **adjustment_data,
            created_by=current_user.id,
            created_at=datetime.now()
        )
        
        db.add(db_adjustment)
        db.commit()
        db.refresh(db_adjustment)
        
        return db_adjustment
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar ajuste: {str(e)}"
        )

@router.get("/adjustments/", response_model=List[StockAdjustmentSchema])
async def get_stock_adjustments(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Lista os ajustes de estoque.
    """
    adjustments = db.query(StockAdjustment).order_by(
        StockAdjustment.created_at.desc()
    ).offset(skip).limit(limit).all()
    
    return adjustments

# ==================== NÍVEIS DE ESTOQUE POR DEPARTAMENTO ====================

@router.post("/department-levels/", response_model=DepartmentStockLevelSchema)
async def create_department_stock_level(
    level: DepartmentStockLevelCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Define níveis de estoque por departamento.
    """
    try:
        level_data = field_encryption.encrypt_model_data(level.dict(), "DepartmentStockLevel")
        
        db_level = DepartmentStockLevel(
            **level_data,
            created_at=datetime.now()
        )
        
        db.add(db_level)
        db.commit()
        db.refresh(db_level)
        
        return db_level
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao definir nível de estoque: {str(e)}"
        )

@router.get("/department-levels/", response_model=List[DepartmentStockLevelSchema])
async def get_department_stock_levels(
    department: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Lista os níveis de estoque por departamento.
    """
    query = db.query(DepartmentStockLevel)
    
    if department:
        query = query.filter(DepartmentStockLevel.department == department)
    
    levels = query.offset(skip).limit(limit).all()
    return levels

# ==================== RELATÓRIOS DE ESTOQUE ====================

@router.get("/reports/low-stock")
async def get_low_stock_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Relatório de produtos com estoque baixo.
    """
    try:
        # Query para produtos com estoque abaixo do mínimo
        low_stock_query = db.query(
            Product.id,
            Product.name,
            Product.current_stock,
            Product.minimum_stock,
            Product.category
        ).filter(
            Product.current_stock <= Product.minimum_stock
        ).all()
        
        low_stock_products = [
            {
                "product_id": item.id,
                "name": item.name,
                "current_stock": item.current_stock,
                "minimum_stock": item.minimum_stock,
                "category": item.category,
                "deficit": item.minimum_stock - item.current_stock
            }
            for item in low_stock_query
        ]
        
        return {
            "total_products": len(low_stock_products),
            "products": low_stock_products,
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao gerar relatório: {str(e)}"
        )

@router.get("/reports/expiring-products")
async def get_expiring_products_report(
    days_ahead: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Relatório de produtos próximos ao vencimento.
    """
    try:
        expiry_date = datetime.now() + timedelta(days=days_ahead)
        
        # Query para produtos próximos ao vencimento
        expiring_query = db.query(
            Product.id,
            Product.name,
            Product.expiry_date,
            Product.current_stock,
            Product.category
        ).filter(
            and_(
                Product.expiry_date.isnot(None),
                Product.expiry_date <= expiry_date,
                Product.current_stock > 0
            )
        ).order_by(Product.expiry_date).all()
        
        expiring_products = [
            {
                "product_id": item.id,
                "name": item.name,
                "expiry_date": item.expiry_date.isoformat() if item.expiry_date else None,
                "current_stock": item.current_stock,
                "category": item.category,
                "days_to_expiry": (item.expiry_date - datetime.now()).days if item.expiry_date else None
            }
            for item in expiring_query
        ]
        
        return {
            "total_products": len(expiring_products),
            "products": expiring_products,
            "days_ahead": days_ahead,
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao gerar relatório: {str(e)}"
        )