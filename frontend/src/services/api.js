import axios from 'axios';

const API_BASE_URL = '/api';

export const api = {
  obtenerPares: async () => {
    const response = await axios.get(`${API_BASE_URL}/pares`);
    return response.data;
  },

  analizarPar: async (par) => {
    const response = await axios.get(`${API_BASE_URL}/analisis/${par}`);
    return response.data;
  },

  analizarMultiplesPares: async () => {
    const response = await axios.get(`${API_BASE_URL}/analisis-multiple`);
    return response.data;
  },

  limpiarCache: async () => {
    const response = await axios.delete(`${API_BASE_URL}/cache`);
    return response.data;
  },

  obtenerBitacora: async (limite = 100) => {
    const response = await axios.get(`${API_BASE_URL}/bitacora?limite=${limite}`);
    return response.data;
  },

  obtenerBitacoraPar: async (par, limite = 50) => {
    const response = await axios.get(`${API_BASE_URL}/bitacora/${par}?limite=${limite}`);
    return response.data;
  }
};
