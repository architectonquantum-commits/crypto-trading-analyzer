// frontend/src/services/backtestApi.js
import api from './api';

export const backtestApi = {
  // Ejecutar backtesting
  runBacktest: async (symbol, timeframe = '1h', numTrades = 100) => {
    const response = await api.post('/api/backtest/run', {
      symbol,
      timeframe,
      num_trades: numTrades
    });
    return response.data;
  },

  // Estado del backtesting
  getStatus: async () => {
    const response = await api.get('/api/backtest/status');
    return response.data;
  }
};

export default backtestApi;
