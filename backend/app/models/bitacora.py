from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from datetime import datetime
from ..database import Base

class Bitacora(Base):
    __tablename__ = "bitacora"
    
    id = Column(Integer, primary_key=True, index=True)
    par = Column(String, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    precio = Column(Float)
    rsi = Column(Float, nullable=True)
    adx = Column(Float, nullable=True)
    sma_20 = Column(Float, nullable=True)
    sma_50 = Column(Float, nullable=True)
    sma_200 = Column(Float, nullable=True)
    ema_12 = Column(Float, nullable=True)
    ema_26 = Column(Float, nullable=True)
    ema_50 = Column(Float, nullable=True)
    ema_200 = Column(Float, nullable=True)
    volumen = Column(Float)
    obv = Column(Float, nullable=True)
    patron_velas = Column(String, nullable=True)
    order_block = Column(String, nullable=True)
    fvg = Column(String, nullable=True)
    soporte = Column(Float, nullable=True)
    resistencia = Column(Float, nullable=True)
    notas = Column(Text, nullable=True)
    
    def __repr__(self):
        return f"<Bitacora(par={self.par}, precio={self.precio}, timestamp={self.timestamp})>"
