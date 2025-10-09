import axios from 'axios';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config/apiConfig';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.detail || 
                    error.message || 
                    'Error de conexión con el servidor';
    
    toast.error(message);
    return Promise.reject(error);
  }
);

export default api;
