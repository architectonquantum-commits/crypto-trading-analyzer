import json
import uuid
from datetime import datetime
from typing import List, Optional
from pathlib import Path
from app.models.trading_levels import TradingLevel, TradingLevelCreate, TradingLevelUpdate, LevelsAnalysis

class TradingLevelsService:
    def __init__(self):
        self.data_file = Path("data/trading_levels.json")
        self.data_file.parent.mkdir(parents=True, exist_ok=True)
        
        if not self.data_file.exists():
            self.data_file.write_text("[]")
    
    def _load_levels(self) -> List[dict]:
        """Cargar niveles desde JSON"""
        try:
            return json.loads(self.data_file.read_text())
        except:
            return []
    
    def _save_levels(self, levels: List[dict]):
        """Guardar niveles a JSON"""
        self.data_file.write_text(json.dumps(levels, indent=2))
    
    def create_level(self, level_data: TradingLevelCreate) -> TradingLevel:
        """Crear nuevo nivel"""
        levels = self._load_levels()
        
        new_level = {
            "id": str(uuid.uuid4()),
            "symbol": level_data.symbol,
            "level_type": level_data.level_type,
            "direction": level_data.direction,
            "zone_high": level_data.zone_high,
            "zone_low": level_data.zone_low,
            "notes": level_data.notes,
            "active": True,
            "created_at": datetime.now().isoformat()
        }
        
        levels.append(new_level)
        self._save_levels(levels)
        
        return TradingLevel(**new_level)
    
    def get_levels_by_symbol(self, symbol: str, active_only: bool = True) -> List[TradingLevel]:
        """Obtener niveles por símbolo"""
        levels = self._load_levels()
        
        filtered = [
            TradingLevel(**level)
            for level in levels
            if level["symbol"] == symbol and (not active_only or level["active"])
        ]
        
        return filtered
    
    def update_level(self, level_id: str, update_data: TradingLevelUpdate) -> Optional[TradingLevel]:
        """Actualizar nivel"""
        levels = self._load_levels()
        
        for level in levels:
            if level["id"] == level_id:
                if update_data.active is not None:
                    level["active"] = update_data.active
                if update_data.notes is not None:
                    level["notes"] = update_data.notes
                
                self._save_levels(levels)
                return TradingLevel(**level)
        
        return None
    
    def delete_level(self, level_id: str) -> bool:
        """Eliminar nivel"""
        levels = self._load_levels()
        original_count = len(levels)
        
        levels = [level for level in levels if level["id"] != level_id]
        
        if len(levels) < original_count:
            self._save_levels(levels)
            return True
        
        return False
    
    def analyze_proximity(self, symbol: str, entry_price: float, direction: str) -> LevelsAnalysis:
        """
        Analizar proximidad del precio de entrada a niveles clave
        
        Scoring:
        - Dentro de FVG: +5 puntos
        - Cerca de Order Block (2%): +3 puntos
        - Cerca de Soporte/Resistencia (1%): +2 puntos
        
        Máximo: 10 puntos bonus
        """
        levels = self.get_levels_by_symbol(symbol, active_only=True)
        
        bonus_points = 0
        nearby = []
        
        for level in levels:
            # Calcular distancia
            if level.zone_low:  # FVG con zona
                is_inside = level.zone_low <= entry_price <= level.zone_high
                distance_pct = 0 if is_inside else min(
                    abs(entry_price - level.zone_high) / entry_price * 100,
                    abs(entry_price - level.zone_low) / entry_price * 100
                )
            else:  # Nivel simple
                distance_pct = abs(entry_price - level.zone_high) / entry_price * 100
                is_inside = distance_pct < 0.5  # Dentro si está a menos de 0.5%
            
            # Determinar si es relevante
            is_relevant = False
            points = 0
            
            if level.level_type == "FVG" and is_inside:
                points = 5
                is_relevant = True
                status = "🎯 Dentro de FVG"
            elif level.level_type == "Order Block" and distance_pct <= 2:
                points = 3
                is_relevant = True
                status = f"⚠️ A {distance_pct:.1f}% del Order Block"
            elif level.level_type in ["Soporte", "Resistencia"] and distance_pct <= 1:
                points = 2
                is_relevant = True
                status = f"📍 A {distance_pct:.1f}% del {level.level_type}"
            elif distance_pct <= 5:  # Cercano pero sin puntos
                is_relevant = True
                status = f"📊 Cerca ({distance_pct:.1f}%)"
            
            if is_relevant:
                bonus_points += points
                nearby.append({
                    "level_type": level.level_type,
                    "direction": level.direction,
                    "zone_high": level.zone_high,
                    "zone_low": level.zone_low,
                    "distance_pct": round(distance_pct, 2),
                    "points": points,
                    "status": status,
                    "notes": level.notes
                })
        
        # Cap a 10 puntos máximo
        bonus_points = min(bonus_points, 10)
        
        return LevelsAnalysis(
            has_nearby_levels=len(nearby) > 0,
            nearby_count=len(nearby),
            bonus_points=bonus_points,
            details=nearby
        )
