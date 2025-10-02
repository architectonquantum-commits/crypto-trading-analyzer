# TRADE-ARCHI - Aplicación de Trading de Criptomonedas

## Resumen del Proyecto
Aplicación web de análisis técnico de criptomonedas en español, conectada al exchange Kraken para obtener datos de mercado en tiempo real sin restricciones geográficas.

**Stack Tecnológico:**
- Backend: Python FastAPI (puerto 8000)
- Frontend: React + Vite (puerto 5000)
- Base de datos: PostgreSQL
- Exchange: Kraken (CCXT)

## Estado Actual
✅ Aplicación completamente funcional
✅ 14 pares USDT disponibles en Kraken
✅ Análisis técnico completo implementado
✅ Sin restricciones geográficas (migrado de Binance a Kraken)

## Decisiones Arquitectónicas Importantes

### Exchange: Kraken
**Fecha:** Octubre 2025
**Razón:** Migración desde Binance debido a restricciones geográficas (error 451)
**Resultado:** Kraken funciona perfectamente sin restricciones geográficas

### Pares de Trading: USDT
**Fecha:** Octubre 2025
**Decisión:** Usar pares USDT en lugar de USD
**Disponibles en Kraken (14 pares):**
- BTC/USDT, ETH/USDT, SOL/USDT, ADA/USDT
- BNB/USDT, AVAX/USDT, DOT/USDT, LINK/USDT
- ATOM/USDT, XRP/USDT, DOGE/USDT, LTC/USDT
- BCH/USDT, ALGO/USDT

**No disponibles:** MATIC, UNI, VET, FIL, AAVE, SAND

### API Routes: Query Parameters
**Decisión:** Usar query parameters en lugar de path parameters para símbolos
**Razón:** Los símbolos contienen "/" (BTC/USDT), lo que causa problemas en URLs
**Implementación:** `GET /api/data?symbol=BTC/USDT&interval=1h`

## Indicadores Técnicos Implementados

### Indicadores Básicos
- RSI (Relative Strength Index) - Periodo 14
- ADX (Average Directional Index) - Periodo 14
- SMA (20, 50, 200)
- EMA (12, 26, 50, 200)
- OBV (On Balance Volume)

### Análisis Avanzado
- Patrones de velas japonesas (detectados automáticamente)
- Order Blocks (zonas institucionales)
- Fair Value Gaps (FVG) - Huecos de liquidez
- Niveles de soporte y resistencia

## Estructura de Archivos Clave

```
backend/
├── app/
│   ├── api/
│   │   ├── exchange.py      # Servicio de Kraken con caché
│   │   └── routes.py         # Endpoints FastAPI
│   ├── utils/
│   │   └── technical_analysis.py  # Análisis técnico
│   ├── database.py          # PostgreSQL setup
│   └── config.py            # Configuración

frontend/
├── src/
│   ├── components/
│   │   └── Chart.jsx        # Gráfico de velas con Lightweight Charts
│   └── App.jsx              # Componente principal

start.sh                     # Script de inicio
```

## Configuración de Desarrollo

### Backend
- Puerto: 8000
- Framework: FastAPI + Uvicorn
- CORS habilitado para puerto 5000
- Caché de datos (TTL: 30-3600 segundos)

### Frontend
- Puerto: 5000
- Framework: React + Vite
- Gráficos: lightweight-charts
- Actualización automática cada 30 segundos

### Base de Datos
- PostgreSQL (Replit managed)
- Variables de entorno: DATABASE_URL, PGHOST, PGPORT, etc.
- Inicialización automática en startup

## Preferencias del Usuario
- **Idioma:** Español (toda la UI y documentación)
- **Exchange:** Kraken (sin restricciones geográficas)
- **Pares:** USDT preferidos
- **Análisis:** Técnico avanzado con Order Blocks y FVG

## Cambios Recientes
**Octubre 2, 2025:**
- Confirmado soporte para USDT en Kraken (14 pares disponibles)
- Actualizada lista de símbolos a solo los disponibles
- Removidos pares no disponibles (MATIC, UNI, VET, FIL, AAVE, SAND)
- Aplicación probada y funcionando correctamente

## Notas Técnicas
- Kraken soporta tanto USD como USDT, pero USDT fue la preferencia original del proyecto
- Los pares USD tienen mayor liquidez, pero los USDT cumplen con los requisitos
- El caché reduce llamadas a la API y mejora rendimiento
- La aplicación funciona completamente sin restricciones geográficas
