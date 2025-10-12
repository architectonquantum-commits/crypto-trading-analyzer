import api from './api';

export const levelsApi = {
  // Crear nivel
  createLevel: async (levelData) => {
    const response = await api.post('/api/validator/levels', levelData);
    return response.data;
  },

  // Obtener niveles por símbolo (CON QUERY PARAMS)
  getLevelsBySymbol: async (symbol, activeOnly = true) => {
    const response = await api.get('/api/validator/levels', {
      params: { 
        symbol: symbol,
        active_only: activeOnly 
      }
    });
    return response.data;
  },

  // Actualizar nivel
  updateLevel: async (levelId, updateData) => {
    const response = await api.put(`/api/validator/levels/${levelId}`, updateData);
    return response.data;
  },

  // Eliminar nivel
  deleteLevel: async (levelId) => {
    const response = await api.delete(`/api/validator/levels/${levelId}`);
    return response.data;
  },

  // Analizar proximidad
  analyzeProximity: async (symbol, entryPrice, direction) => {
    const response = await api.post('/api/validator/levels/analyze', {
      symbol,
      entry_price: entryPrice,
      direction
    });
    return response.data;
  },
};
