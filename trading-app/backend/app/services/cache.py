from datetime import datetime, timedelta
from typing import Optional, Any
import json

class SimpleCache:
    """Cache simple en memoria para datos de mercado"""

    def __init__(self):
        self._cache = {}

    def get(self, key: str) -> Optional[Any]:
        """Obtener valor del cache"""
        if key in self._cache:
            data, expiry = self._cache[key]
            if datetime.now() < expiry:
                return data
            else:
                del self._cache[key]
        return None

    def set(self, key: str, value: Any, ttl: int = 300):
        """Guardar valor en cache con TTL en segundos"""
        expiry = datetime.now() + timedelta(seconds=ttl)
        self._cache[key] = (value, expiry)

    def clear(self):
        """Limpiar todo el cache"""
        self._cache.clear()

# Instancia global
cache = SimpleCache()