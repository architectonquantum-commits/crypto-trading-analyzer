from sqlalchemy import Column, String, Float, DateTime, Text, Enum
from datetime import datetime
import uuid
import enum
from app.database import Base

class TipoOperacion(str, enum.Enum):
    LONG = "LONG"
    SHORT = "SHORT"

class Operacion(Base):
    __tablename__ = "bitacora"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    symbol = Column(String, nullable=False)
    timeframe = Column(String, nullable=False)
    tipo = Column(Enum(TipoOperacion), nullable=False)

    fecha_entrada = Column(DateTime, default=datetime.utcnow, nullable=False)
    precio_entrada = Column(Float, nullable=False)
    stop_loss = Column(Float, nullable=False)
    take_profit = Column(Float, nullable=False)

    fecha_salida = Column(DateTime, nullable=True)
    precio_salida = Column(Float, nullable=True)
    resultado = Column(Float, nullable=True)

    notas = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)