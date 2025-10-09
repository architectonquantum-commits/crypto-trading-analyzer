import api from './api';
import { API_ENDPOINTS } from '../config/apiConfig';

export const journalApi = {
  getEntries: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.estatus) params.append('estatus', filters.estatus);
    if (filters.resultado) params.append('resultado', filters.resultado);
    if (filters.activo) params.append('activo', filters.activo);
    if (filters.fecha_desde) params.append('fecha_desde', filters.fecha_desde);
    if (filters.fecha_hasta) params.append('fecha_hasta', filters.fecha_hasta);
    if (filters.confluencias) params.append('confluencias', filters.confluencias);
    
    const response = await api.get(
      `${API_ENDPOINTS.JOURNAL_ENTRIES}?${params.toString()}`
    );
    return response.data;
  },

  getStats: async () => {
    const response = await api.get(API_ENDPOINTS.JOURNAL_STATS);
    return response.data;
  },

  closeTrade: async (entryId, closeData) => {
    const response = await api.put(
      `${API_ENDPOINTS.JOURNAL_ENTRIES}/${entryId}/close`,
      closeData
    );
    return response.data;
  },

  // ✅ ESTRUCTURA CORRECTA: signal_data + user_context
  createFromSignal: async (signalData, userContext) => {
    const response = await api.post('/api/journal/entries/from-signal', {
      signal_data: signalData,
      user_context: userContext
    });
    return response.data;
  },
};

export default journalApi;
