"""
Pydantic models for Trading Journal.
"""

from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import date, datetime


# ==========================================
# REQUEST MODELS
# ==========================================

class UserContext(BaseModel):
    """Contexto emocional del usuario (4 campos manuales)."""
    estado_emocional: Literal["Excelente", "Bien", "Normal", "Cansado", "Estresado"] = Field(
        ..., description="Estado emocional del trader"
    )
    razon_estado: str = Field(..., min_length=1, description="Razón del estado emocional")
    sesion: Optional[Literal["Asia", "Londres", "Nueva York", "Overlap"]] = Field(
        None, description="Sesión de trading"
    )
    riesgo_diario_permitido: float = Field(2.0, ge=0.5, le=10.0, description="% de riesgo máximo diario")


class SignalData(BaseModel):
    """Datos completos de la señal (auto desde validador)."""
    activo: str
    tipo_activo: str = "crypto"
    operacion: Literal["LONG", "SHORT"]

    precio_entrada: float
    stop_loss: float
    take_profit_1: Optional[float] = None
    take_profit_2: Optional[float] = None
    take_profit_3: Optional[float] = None
    beneficio_esperado_porcentaje: Optional[float] = None

    capital_usado: Optional[float] = None
    riesgo_porcentaje: Optional[float] = None
    tamano_posicion: Optional[dict] = None
    apalancamiento_usado: Optional[float] = None
    margen_bloqueado: Optional[float] = None
    rr_ratio: Optional[float] = None

    score_tecnico: Optional[int] = Field(None, ge=0, le=7)
    score_estructura: Optional[int] = Field(None, ge=0, le=5)
    score_riesgo: Optional[int] = Field(None, ge=0, le=4)
    score_macro: Optional[int] = Field(None, ge=0, le=5)
    score_sentimiento: Optional[int] = Field(None, ge=0, le=4)
    score_total: Optional[int] = Field(None, ge=0, le=25)
    confluencia_porcentaje: Optional[float] = Field(None, ge=0, le=100)
    recomendacion: Optional[Literal["OPERAR", "OPERAR CON CAUTELA", "CONSIDERAR", "EVITAR"]] = None

    analisis_completo: dict


class CreateJournalFromSignal(BaseModel):
    """Crear entrada desde validación de señal (FLUJO PRINCIPAL)."""
    signal_data: SignalData
    user_context: UserContext


class CreateJournalManual(BaseModel):
    """Crear entrada manual (sin validador - casos especiales)."""
    activo: str
    operacion: Literal["LONG", "SHORT"]
    precio_entrada: float
    stop_loss: float

    estado_emocional: Literal["Excelente", "Bien", "Normal", "Cansado", "Estresado"]
    razon_estado: str = Field(..., min_length=1)

    take_profit_1: Optional[float] = None
    sesion: Optional[Literal["Asia", "Londres", "Nueva York", "Overlap"]] = None
    riesgo_diario_permitido: float = 2.0


class CloseTradeRequest(BaseModel):
    """Cerrar un trade (POST-TRADE)."""
    fecha_finalizacion: Optional[date] = None
    resultado: Literal["Ganado", "Perdido", "Breakeven"]
    tp_alcanzado: Optional[Literal["TP1", "TP2", "TP3", "SL", "Manual"]] = None
    ganancia_perdida_real: float
    observaciones_cierre: Optional[str] = None
    estado_emocional_post: Optional[str] = None


# ==========================================
# RESPONSE MODELS
# ==========================================

class JournalEntryResponse(BaseModel):
    """Response de una entrada del journal."""
    id: str
    user_id: str

    estado_emocional: str
    razon_estado: str
    sesion: Optional[str] = None
    riesgo_diario_permitido: float

    activo: str
    tipo_activo: str
    operacion: str
    fecha_operacion: str

    precio_entrada: float
    stop_loss: float
    take_profit_1: Optional[float] = None
    take_profit_2: Optional[float] = None
    take_profit_3: Optional[float] = None

    score_total: Optional[int] = None
    confluencia_porcentaje: Optional[float] = None
    recomendacion: Optional[str] = None

    analisis_completo: Optional[dict] = None

    estatus: str
    resultado: Optional[str] = None
    ganancia_perdida_real: Optional[float] = None

    created_at: str
    updated_at: str


class JournalListResponse(BaseModel):
    """Response de lista de entradas."""
    total: int
    page: int
    limit: int
    entries: list[JournalEntryResponse]


class JournalStatsResponse(BaseModel):
    """Response de estadísticas generales."""
    total_trades: int
    trades_abiertos: int
    trades_cerrados: int
    trades_ganados: int
    trades_perdidos: int
    win_rate: float
    profit_factor: float
    mejor_racha: int
    peor_racha: int
    promedio_rr: float
    total_ganado: float
    total_perdido: float
    ganancia_neta: float