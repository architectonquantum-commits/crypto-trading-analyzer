import { create } from 'zustand';
import { levelsApi } from '../services/levelsApi';
import toast from 'react-hot-toast';

const useLevelsStore = create((set, get) => ({
  levels: [],
  currentSymbol: null,
  loading: false,
  analysis: null,

  // Cargar niveles por símbolo
  fetchLevelsBySymbol: async (symbol) => {
    set({ loading: true, currentSymbol: symbol });
    try {
      const result = await levelsApi.getLevelsBySymbol(symbol);
      set({ levels: result.levels, loading: false });
    } catch (error) {
      console.error('Error cargando niveles:', error);
      set({ levels: [], loading: false });
    }
  },

  // Crear nuevo nivel
  createLevel: async (levelData) => {
    try {
      const result = await levelsApi.createLevel(levelData);
      toast.success('📍 Nivel agregado');
      
      // Recargar niveles del símbolo actual
      if (get().currentSymbol === levelData.symbol) {
        await get().fetchLevelsBySymbol(levelData.symbol);
      }
      
      return result.level;
    } catch (error) {
      toast.error('Error al agregar nivel');
      throw error;
    }
  },

  // Toggle activo/inactivo
  toggleLevel: async (levelId) => {
    try {
      const level = get().levels.find(l => l.id === levelId);
      await levelsApi.updateLevel(levelId, { active: !level.active });
      
      // Actualizar localmente
      set({
        levels: get().levels.map(l =>
          l.id === levelId ? { ...l, active: !l.active } : l
        )
      });
      
      toast.success(level.active ? 'Nivel desactivado' : 'Nivel activado');
    } catch (error) {
      toast.error('Error al actualizar nivel');
    }
  },

  // Eliminar nivel
  deleteLevel: async (levelId) => {
    try {
      await levelsApi.deleteLevel(levelId);
      set({ levels: get().levels.filter(l => l.id !== levelId) });
      toast.success('🗑️ Nivel eliminado');
    } catch (error) {
      toast.error('Error al eliminar nivel');
    }
  },

  // Analizar proximidad
  analyzeProximity: async (symbol, entryPrice, direction) => {
    try {
      const result = await levelsApi.analyzeProximity(symbol, entryPrice, direction);
      set({ analysis: result.analysis });
      return result.analysis;
    } catch (error) {
      console.error('Error analizando proximidad:', error);
      set({ analysis: null });
    }
  },

  // Limpiar análisis
  clearAnalysis: () => set({ analysis: null }),
}));

export default useLevelsStore;
