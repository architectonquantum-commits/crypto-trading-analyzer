"""
Journal API Endpoints - Trading journal routes.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from app.models.journal import (
    CreateJournalFromSignal,
    CreateJournalManual,
    CloseTradeRequest,
    JournalEntryResponse,
    JournalListResponse,
    JournalStatsResponse
)
from app.db.database import get_db
from app.services import journal_service

router = APIRouter()


@router.post("/entries/from-signal", response_model=dict)
async def create_entry_from_signal(request: CreateJournalFromSignal):
    """Crear entrada desde validación de señal."""
    try:
        async for db in get_db():
            entry_id = await journal_service.create_journal_entry_from_signal(
                db,
                signal_data=request.signal_data.dict(),
                user_context=request.user_context.dict()
            )

            if not entry_id:
                raise HTTPException(status_code=500, detail="Error al crear entrada")

            return {
                "success": True,
                "entry_id": entry_id,
                "message": "Entrada guardada en bitácora exitosamente"
            }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error inesperado: {str(e)}")


@router.get("/entries", response_model=JournalListResponse)
async def list_entries(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    activo: Optional[str] = Query(None),
    resultado: Optional[str] = Query(None),
    estatus: Optional[str] = Query(None),
    fecha_desde: Optional[str] = Query(None),
    fecha_hasta: Optional[str] = Query(None),
    confluencias: Optional[str] = Query(None)
):
    """Listar entradas con filtros avanzados."""
    async for db in get_db():
        # Construir filtros
        filters = {}
        if activo:
            filters['activo'] = activo
        if resultado:
            filters['resultado'] = resultado
        if estatus:
            filters['estatus'] = estatus
        if fecha_desde:
            filters['fecha_desde'] = fecha_desde
        if fecha_hasta:
            filters['fecha_hasta'] = fecha_hasta
        if confluencias:
            filters['confluencias'] = confluencias

        entries, total = await journal_service.list_trading_journal(
            db,
            page=page,
            limit=limit,
            **filters
        )

        return {
            "total": total,
            "page": page,
            "limit": limit,
            "entries": entries
        }


@router.get("/entries/{entry_id}", response_model=JournalEntryResponse)
async def get_entry(entry_id: str):
    """Obtener entrada específica."""
    async for db in get_db():
        entry = await journal_service.get_journal_entry(db, entry_id)

        if not entry:
            raise HTTPException(status_code=404, detail="Entrada no encontrada")

        return entry


@router.put("/entries/{entry_id}/close", response_model=dict)
async def close_entry(entry_id: str, request: CloseTradeRequest):
    """Cerrar un trade."""
    try:
        async for db in get_db():
            entry = await journal_service.get_journal_entry(db, entry_id)
            if not entry:
                raise HTTPException(status_code=404, detail="Entrada no encontrada")

            if entry.get("estatus") == "Cerrado":
                raise HTTPException(status_code=400, detail="El trade ya está cerrado")

            success = await journal_service.close_trade(
                db,
                entry_id,
                close_data=request.dict()
            )

            return {
                "success": success,
                "message": "Trade cerrado exitosamente"
            }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al cerrar trade: {str(e)}")


@router.get("/stats", response_model=JournalStatsResponse)
async def get_stats():
    """Obtener métricas generales del journal."""
    async for db in get_db():
        stats = await journal_service.get_journal_stats(db)
        return stats
