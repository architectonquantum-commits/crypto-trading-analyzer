// Usar rutas relativas - Vite proxy las redirige al backend
export const API_BASE_URL = '';

export const API_ENDPOINTS = {
  // Health
  HEALTH: '/api/health',
  
  // Validator
  VALIDATE_SIGNAL: '/api/validator/validate-signal',  // ✅ ARREGLADO
  
  // Journal
  JOURNAL_FROM_SIGNAL: '/api/journal/entries/from-signal',
  JOURNAL_ENTRIES: '/api/journal/entries',
  JOURNAL_ENTRY: (id) => `/api/journal/entries/${id}`,
  JOURNAL_CLOSE: (id) => `/api/journal/entries/${id}/close`,
  JOURNAL_DELETE: (id) => `/api/journal/entries/${id}`,
  JOURNAL_STATS: '/api/journal/stats',
  
  // Scanner
  SCANNER_RUN: '/api/scanner/run',
  SCANNER_STATUS: '/api/scanner/status',
};
