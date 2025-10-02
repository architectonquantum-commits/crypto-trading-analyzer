import time
from typing import Dict, Any, Optional

class SimpleCache:
    """Sistema de caché simple en memoria"""
    
    def __init__(self, expiration_seconds=300):
        self.cache: Dict[str, Dict[str, Any]] = {}
        self.expiration = expiration_seconds
    
    def get(self, key: str) -> Optional[Any]:
        """Obtiene un valor del caché"""
        if key in self.cache:
            entry = self.cache[key]
            if time.time() - entry['timestamp'] < self.expiration:
                return entry['data']
            else:
                del self.cache[key]
        return None
    
    def set(self, key: str, data: Any):
        """Guarda un valor en el caché"""
        self.cache[key] = {
            'data': data,
            'timestamp': time.time()
        }
    
    def clear(self):
        """Limpia todo el caché"""
        self.cache.clear()
    
    def delete(self, key: str):
        """Elimina una entrada específica del caché"""
        if key in self.cache:
            del self.cache[key]

cache_manager = SimpleCache()
