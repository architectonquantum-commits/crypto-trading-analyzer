/**
 * Configuración de Tipos de Activos
 * 
 * V1.0: Solo Crypto
 * V2.0: Agregar Stocks y Forex
 */

export const ASSET_TYPES = {
  CRYPTO: {
    id: 'crypto',
    name: 'Criptomonedas',
    icon: '₿',
    color: '#f7931a',
    enabled: true,
    examples: ['BTC/USDT', 'ETH/USDT', 'SOL/USDT'],
    // Campos específicos para crypto
    fields: {
      funding_rate: true,
      liquidation_price: true,
      leverage: true
    }
  },
  
  // V2.0 - Descomentar cuando esté listo
  /*
  STOCKS: {
    id: 'stocks',
    name: 'Acciones',
    icon: '📈',
    color: '#3b82f6',
    enabled: false, // Cambiar a true en V2.0
    examples: ['AAPL', 'TSLA', 'NVDA', 'GOOGL'],
    // Campos específicos para acciones
    fields: {
      dividend_yield: true,
      market_cap: true,
      pe_ratio: true,
      sector: true
    }
  },
  
  FOREX: {
    id: 'forex',
    name: 'Forex',
    icon: '💱',
    color: '#22c55e',
    enabled: false, // Cambiar a true en V2.0
    examples: ['EUR/USD', 'GBP/USD', 'USD/JPY'],
    // Campos específicos para forex
    fields: {
      spread: true,
      swap_rate: true,
      pip_value: true,
      lot_size: true
    }
  },
  */
};

/**
 * Obtener tipos de activos habilitados
 */
export const getEnabledAssetTypes = () => {
  return Object.values(ASSET_TYPES).filter(type => type.enabled);
};

/**
 * Obtener configuración de un tipo específico
 */
export const getAssetTypeConfig = (typeId) => {
  return Object.values(ASSET_TYPES).find(type => type.id === typeId);
};

/**
 * Validar si un tipo de activo está habilitado
 */
export const isAssetTypeEnabled = (typeId) => {
  const config = getAssetTypeConfig(typeId);
  return config ? config.enabled : false;
};

/**
 * Obtener símbolo/ícono de un tipo de activo
 */
export const getAssetTypeIcon = (typeId) => {
  const config = getAssetTypeConfig(typeId);
  return config ? config.icon : '💼';
};

/**
 * Obtener color de un tipo de activo
 */
export const getAssetTypeColor = (typeId) => {
  const config = getAssetTypeConfig(typeId);
  return config ? config.color : '#64748b';
};

// Exportar para uso directo
export default ASSET_TYPES;
