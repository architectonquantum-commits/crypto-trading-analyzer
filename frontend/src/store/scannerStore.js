import { create } from 'zustand';
import { scannerApi } from '../services/scannerApi';
import toast from 'react-hot-toast';

const useScannerStore = create((set, get) => ({
  // Estado
  scanResults: null,
  loading: false,
  error: null,
  progress: 0,
  filters: {
    timeframe: '1h',
    min_confluence: 70,
    direction_filter: null,
    exchange_filter: null
  },
  
  // Acciones
  runScanner: async (symbols = null) => {
    set({ loading: true, error: null, progress: 0 });
    
    // Simular progreso mientras escanea
    const progressInterval = setInterval(() => {
      const currentProgress = get().progress;
      if (currentProgress < 90) {
        set({ progress: currentProgress + 10 });
      }
    }, 8000); // Cada 8 segundos avanza 10%
    try {
      const { filters } = get();
      
      // Construir request con filtros del store
      const request = {
        timeframe: filters.timeframe,
        min_confluence: filters.min_confluence,
        symbols: symbols, // Permitir override de símbolos si se pasa
      };
      
      // Agregar filtros avanzados si están definidos
      if (filters.direction_filter) {
        request.direction_filter = filters.direction_filter;
      }
      if (filters.exchange_filter && filters.exchange_filter.length > 0) {
        request.exchange_filter = filters.exchange_filter;
      }
      
      const data = await scannerApi.runScanner(request);
      
      // 🆕 NUEVO: Filtrar resultados con ERROR
      const validResults = data.all_results?.filter(
        r => r.recommendation !== 'ERROR'
      ) || [];
      
      // 🆕 Agregar los resultados válidos como "top_opportunities"
      // para mantener compatibilidad con el componente
      clearInterval(progressInterval);
      set({ 
        scanResults: {
          ...data,
          top_opportunities: validResults // Usar all_results en lugar de solo top
        },
        loading: false,
        progress: 100
      });
      
      return data;
    } catch (error) {
      clearInterval(progressInterval);
      set({ error: error.message, loading: false, progress: 0 });
      throw error;
    }
  },
  
  getStatus: async () => {
    try {
      const data = await scannerApi.getStatus();
      set({ scanResults: data });
      return data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
  

  setFilters: (newFilters) => {
    set({ filters: { ...get().filters, ...newFilters } });
  },

  clearFilters: () => {
    set({
      filters: {
        timeframe: '1h',
        min_confluence: 70,
        direction_filter: null,
        exchange_filter: null
      }
    });
  },

  clearResults: () => {
    set({ scanResults: null, error: null });
  },
}));

export default useScannerStore;
