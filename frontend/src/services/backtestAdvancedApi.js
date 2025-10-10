import api from './api';
import { API_ENDPOINTS } from '../config/apiConfig';

export const backtestAdvancedApi = {
  
  /**
   * Ejecuta backtesting avanzado completo
   */
  runAdvanced: async (requestData) => {
    const response = await api.post('/api/backtest/advanced', requestData, {
      timeout: 120000 // 2 minutos
    });
    return response.data;
  },
  
  /**
   * Health check del servicio
   */
  healthCheck: async () => {
    const response = await api.get('/api/backtest/health');
    return response.data;
  }
};
