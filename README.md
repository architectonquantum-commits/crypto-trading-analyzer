# 📊 TRADE-ARCHI - Plataforma de Trading de Criptomonedas

Aplicación web profesional de análisis técnico para trading de criptomonedas con datos en tiempo real de **Kraken Exchange**.

## ✨ Características Principales

### 📈 Análisis Técnico Completo
- **Indicadores Clásicos:** RSI, ADX, SMA, EMA, OBV
- **Análisis Avanzado:** Order Blocks, Fair Value Gaps (FVG)
- **Patrones:** Detección automática de velas japonesas
- **Niveles:** Soporte y resistencia calculados automáticamente

### 💱 Pares de Trading Disponibles
14 pares principales con USDT en Kraken:

| Categoría | Pares |
|-----------|-------|
| **Top Caps** | BTC/USDT, ETH/USDT, BNB/USDT |
| **Layer 1** | SOL/USDT, ADA/USDT, DOT/USDT, AVAX/USDT, ATOM/USDT |
| **DeFi** | LINK/USDT, ALGO/USDT |
| **Altcoins** | XRP/USDT, DOGE/USDT, LTC/USDT, BCH/USDT |

### 🕐 Temporalidades
- 1 minuto (1m)
- 5 minutos (5m)
- 15 minutos (15m)
- 1 hora (1h)
- 4 horas (4h)
- 1 día (1d)

## 🚀 Inicio Rápido

### Ejecutar la Aplicación
```bash
bash start.sh
```

La aplicación se iniciará en:
- **Frontend:** http://localhost:5000
- **Backend API:** http://localhost:8000
- **Documentación API:** http://localhost:8000/docs

### Requisitos
- Python 3.11+
- Node.js 20+
- PostgreSQL (gestionado por Replit)

## 📚 API Endpoints

### Obtener Símbolos Disponibles
```bash
GET /api/symbols
```

### Obtener Datos de Mercado
```bash
GET /api/data?symbol=BTC/USDT&interval=1h&limit=500
```

### Obtener Análisis Técnico
```bash
GET /api/analysis?symbol=BTC/USDT&interval=1h
```

### Obtener Ticker en Tiempo Real
```bash
GET /api/ticker?symbol=BTC/USDT
```

## 🛠️ Tecnologías

### Backend
- **Framework:** FastAPI
- **Exchange:** Kraken (vía CCXT)
- **Base de datos:** PostgreSQL
- **Análisis:** Pandas, NumPy, TA-Lib

### Frontend
- **Framework:** React 18 + Vite
- **Gráficos:** Lightweight Charts (TradingView)
- **Estilos:** CSS moderno
- **Estado:** React Hooks

## 📖 Ejemplos de Uso

### Ejemplo 1: Obtener precio de Bitcoin
```bash
curl "http://localhost:8000/api/ticker?symbol=BTC/USDT"
```

Respuesta:
```json
{
  "symbol": "BTC/USDT",
  "last": 118798.50,
  "bid": 118797.20,
  "ask": 118798.50,
  "volume": 5234567.89,
  "change_24h": 0.19
}
```

### Ejemplo 2: Análisis técnico de Ethereum
```bash
curl "http://localhost:8000/api/analysis?symbol=ETH/USDT&interval=1h"
```

Respuesta incluye:
- Indicadores (RSI, ADX, SMAs, EMAs)
- Patrones detectados
- Niveles de soporte/resistencia
- Order Blocks y FVG

## 🎯 Características Técnicas

### Sistema de Caché
- **Símbolos:** 1 hora
- **Datos OHLCV:** 30 segundos
- **Análisis técnico:** 1 minuto
- **Ticker:** 10 segundos

### Seguridad
- CORS configurado para desarrollo
- Validación de parámetros con Pydantic
- Manejo de errores robusto
- Sin almacenamiento de credenciales sensibles

### Rendimiento
- Actualización automática cada 30 segundos
- Caché inteligente para reducir latencia
- Optimización de queries a Kraken
- Carga eficiente de datos históricos

## 🌍 Exchange: Kraken

### ¿Por qué Kraken?
- ✅ Sin restricciones geográficas
- ✅ Alta liquidez en pares USDT
- ✅ API confiable y bien documentada
- ✅ Soporte para análisis técnico avanzado

### Migración desde Binance
La aplicación originalmente usaba Binance, pero fue migrada a Kraken para evitar el error 451 por restricciones geográficas.

## 📝 Notas Importantes

1. **Pares USDT vs USD:** Kraken soporta ambos, esta aplicación usa USDT por preferencia del usuario
2. **Símbolos con "/":** Los endpoints usan query parameters para evitar problemas con el carácter "/"
3. **Actualización automática:** El frontend se actualiza automáticamente cada 30 segundos
4. **Base de datos:** PostgreSQL se inicializa automáticamente al iniciar

## 🔧 Desarrollo

### Estructura del Proyecto
```
.
├── backend/
│   ├── app/
│   │   ├── api/          # Rutas y servicios
│   │   ├── utils/        # Análisis técnico
│   │   ├── database.py   # DB config
│   │   └── config.py     # Settings
│   └── main.py
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   └── App.jsx
│   └── index.html
├── start.sh              # Script de inicio
└── README.md
```

### Agregar Nuevos Indicadores
1. Editar `backend/app/utils/technical_analysis.py`
2. Agregar función de cálculo
3. Integrar en `calculate_technical_analysis()`
4. Actualizar frontend si es necesario

## 📞 Soporte

Para preguntas o problemas:
1. Revisa la documentación de la API en `/docs`
2. Verifica los logs de la aplicación
3. Consulta la documentación de Kraken

## 📄 Licencia

Este proyecto es solo para fines educativos y de demostración.

---

**Desarrollado con ❤️ usando FastAPI + React + Kraken**
