import api from './api';

export const entryContextApi = {
  analyzeContext: async (signalData) => {
    const response = await api.post('/api/validator/entry-context', {
      symbol: signalData.symbol,
      entry_price: signalData.entry_price,
      direction: signalData.direction,
      timeframe: signalData.timeframe
    });
    return response.data;
  }
};
