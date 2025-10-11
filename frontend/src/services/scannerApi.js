import api from './api';
import { API_ENDPOINTS } from '../config/apiConfig';

export const scannerApi = {
  // ✅ Ejecutar scanner con filtros avanzados
  runScanner: async (requestData = {}) => {
    // Si requestData es un array (backward compatibility con symbols)
    const body = Array.isArray(requestData) 
      ? { symbols: requestData }
      : requestData; // Ya es un objeto con filtros
    
    const response = await api.post(
      API_ENDPOINTS.SCANNER_RUN,
      body,
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
