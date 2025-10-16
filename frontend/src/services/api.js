import axios from 'axios';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config/apiConfig';

// 🔐 Credenciales desde variables de entorno
const API_USERNAME = import.meta.env.VITE_API_USERNAME || 'architecton';
const API_PASSWORD = import.meta.env.VITE_API_PASSWORD || '751826Tm#@!';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
  // 🔐 AUTH AUTOMÁTICO - HTTP Basic Auth
  auth: {
    username: API_USERNAME,
    password: API_PASSWORD
  }
});

api.interceptors.request.use(
  (config) => {
    // Log para debugging (opcional - puedes comentarlo en producción)
    console.log('🚀 API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    // Log para debugging (opcional)
    console.log('✅ API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    const message = error.response?.data?.detail || 
                    error.message || 
                    'Error de conexión con el servidor';
    
    toast.error(message);
    return Promise.reject(error);
  }
);

export default api;
