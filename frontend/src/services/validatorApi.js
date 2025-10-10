import api from './api';

export const validateSignalManual = async (signalData) => {
  try {
    const response = await api.post('/api/validator/validate-signal', signalData);
    return response.data;
  } catch (error) {
    console.error('Error validating signal:', error);
    throw error;
  }
};

/**
 * Valida ruptura técnica con 5 criterios avanzados
 */
export const validateBreakout = async (symbol, timeframe, currentPrice, resistancePrice) => {
  try {
    const params = new URLSearchParams({
      symbol: symbol,
      timeframe: timeframe,
      current_price: currentPrice,
      resistance_price: resistancePrice
    });
    
    const response = await api.get(`/api/validator/validate-breakout?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error validando ruptura:', error);
    throw error;
  }
};
