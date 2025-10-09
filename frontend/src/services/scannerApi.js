import api from './api';
import { API_ENDPOINTS } from '../config/apiConfig';

export const scannerApi = {
  // ✅ Ejecutar scanner (timeout: 180 segundos = 3 minutos)
  runScanner: async () => {
    const response = await api.post(
      API_ENDPOINTS.SCANNER_RUN,
      {},
      { timeout: 180000 } // 180 segundos (3 minutos)
    );
    return response.data;
  },

  // ✅ Obtener último resultado
  getStatus: async () => {
    const response = await api.get(API_ENDPOINTS.SCANNER_STATUS);
    return response.data;
  },
};
