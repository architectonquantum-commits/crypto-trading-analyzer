import api from './api';
import { API_ENDPOINTS } from '../config/apiConfig';

export const validatorApi = {
  // Validar señal manual
  validateSignal: async (signalData) => {
    const response = await api.post(API_ENDPOINTS.VALIDATE_SIGNAL, signalData);
    return response.data;
  },
};

export default validatorApi;
