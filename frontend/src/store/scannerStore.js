import { create } from 'zustand';
import { scannerApi } from '../services/scannerApi';
import toast from 'react-hot-toast';

const useScannerStore = create((set, get) => ({
  // Estado
  scanResults: null,
  loading: false,
  error: null,

  // Acciones
  runScanner: async () => {
    set({ loading: true, error: null });
    try {
      const data = await scannerApi.runScanner();
      
      // 🆕 NUEVO: Filtrar resultados con ERROR
      const validResults = data.all_results?.filter(
        r => r.recommendation !== 'ERROR'
      ) || [];
      
      // 🆕 Agregar los resultados válidos como "top_opportunities"
      // para mantener compatibilidad con el componente
      set({ 
        scanResults: {
          ...data,
          top_opportunities: validResults // Usar all_results en lugar de solo top
        },
        loading: false 
      });
      
      return data;
    } catch (error) {
      set({ error: error.message, loading: false });
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

  clearResults: () => {
    set({ scanResults: null, error: null });
  },
}));

export default useScannerStore;
