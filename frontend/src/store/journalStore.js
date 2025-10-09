import { create } from 'zustand';
import { journalApi } from '../services/journalApi';

const useJournalStore = create((set, get) => ({
  entries: [],
  stats: null,
  loading: false,
  error: null,
  filters: {
    activo: null,
    estatus: null,
    resultado: null,
    fecha_desde: null,
    fecha_hasta: null,
    confluencias: null,
  },

  fetchEntries: async () => {
    set({ loading: true, error: null });
    try {
      const { filters } = get();
      const data = await journalApi.getEntries(filters);
      set({ entries: data.entries, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  fetchStats: async () => {
    try {
      const data = await journalApi.getStats();
      set({ stats: data });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  },

  setFilters: (newFilters) => {
    set(state => ({
      filters: { ...state.filters, ...newFilters }
    }));
  },

  clearFilters: () => {
    set({ 
      filters: {
        activo: null,
        estatus: null,
        resultado: null,
        fecha_desde: null,
        fecha_hasta: null,
        confluencias: null,
      }
    });
    get().fetchEntries();
  },

  closeTrade: async (entryId, closeData) => {
    try {
      await journalApi.closeTrade(entryId, closeData);
      get().fetchEntries();
      get().fetchStats();
    } catch (error) {
      throw error;
    }
  },
}));

export default useJournalStore;
