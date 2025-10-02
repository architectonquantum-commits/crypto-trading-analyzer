import React, { useState, useEffect } from 'react';
import Chart from './components/Chart';
import { api } from './services/api';

function App() {
  const [pares, setPares] = useState([]);
  const [analisis, setAnalisis] = useState([]);
  const [parSeleccionado, setParSeleccionado] = useState(null);
  const [datosDetallados, setDatosDetallados] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarPares();
  }, []);

  const cargarPares = async () => {
    try {
      const data = await api.obtenerPares();
      setPares(data.pares || []);
    } catch (err) {
      setError('Error al cargar pares de trading');
      console.error(err);
    }
  };

  const analizarTodos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.analizarMultiplesPares();
      setAnalisis(data.pares || []);
    } catch (err) {
      setError('Error al analizar los pares. Verifica la conexión con Binance API.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const verDetalles = async (par) => {
    setLoading(true);
    setError(null);
    setParSeleccionado(par);
    try {
      const data = await api.analizarPar(par);
      setDatosDetallados(data);
    } catch (err) {
      setError(`Error al cargar detalles de ${par}`);
      console.error(err);
      setDatosDetallados(null);
    } finally {
      setLoading(false);
    }
  };

  const limpiarCache = async () => {
    try {
      await api.limpiarCache();
      setAnalisis([]);
      setDatosDetallados(null);
      setParSeleccionado(null);
      alert('Caché limpiado exitosamente');
    } catch (err) {
      setError('Error al limpiar caché');
      console.error(err);
    }
  };

  const getRSIColor = (rsi) => {
    if (!rsi) return 'neutral';
    if (rsi > 70) return 'bearish';
    if (rsi < 30) return 'bullish';
    return 'neutral';
  };

  const getADXColor = (adx) => {
    if (!adx) return 'neutral';
    if (adx > 25) return 'bullish';
    return 'neutral';
  };

  return (
    <div className="app">
      <header className="header">
        <h1>📊 TRADE-ARCHI</h1>
        <p>Análisis Técnico Avanzado para Criptomonedas</p>
      </header>

      <div className="controls">
        <button 
          className="btn btn-primary" 
          onClick={analizarTodos}
          disabled={loading}
        >
          {loading ? 'Analizando...' : 'Analizar Todos los Pares'}
        </button>
        
        <button 
          className="btn btn-secondary" 
          onClick={limpiarCache}
        >
          Limpiar Caché
        </button>

        {pares.length > 0 && (
          <select 
            onChange={(e) => verDetalles(e.target.value)}
            value={parSeleccionado || ''}
          >
            <option value="">Ver detalles de un par...</option>
            {pares.map(par => (
              <option key={par} value={par}>{par}</option>
            ))}
          </select>
        )}
      </div>

      {error && <div className="error">{error}</div>}

      {loading && analisis.length === 0 && (
        <div className="loading">Cargando análisis técnico...</div>
      )}

      {analisis.length > 0 && (
        <div className="pairs-grid">
          {analisis.map((item) => (
            <div 
              key={item.par} 
              className="pair-card"
              onClick={() => verDetalles(item.par)}
            >
              <div className="pair-header">
                <div className="pair-symbol">{item.par}</div>
                <div className="pair-price">${item.precio?.toFixed(2)}</div>
              </div>

              <div className="indicators">
                <div className="indicator">
                  <span className="indicator-label">RSI:</span>
                  <span className={`indicator-value ${getRSIColor(item.rsi)}`}>
                    {item.rsi?.toFixed(2) || 'N/A'}
                  </span>
                </div>

                <div className="indicator">
                  <span className="indicator-label">ADX:</span>
                  <span className={`indicator-value ${getADXColor(item.adx)}`}>
                    {item.adx?.toFixed(2) || 'N/A'}
                  </span>
                </div>

                <div className="indicator">
                  <span className="indicator-label">SMA 20:</span>
                  <span className="indicator-value">
                    {item.sma_20?.toFixed(2) || 'N/A'}
                  </span>
                </div>

                <div className="indicator">
                  <span className="indicator-label">EMA 12:</span>
                  <span className="indicator-value">
                    {item.ema_12?.toFixed(2) || 'N/A'}
                  </span>
                </div>

                <div className="indicator">
                  <span className="indicator-label">OBV:</span>
                  <span className="indicator-value">
                    {item.obv ? item.obv.toLocaleString('es-ES', {notation: 'compact'}) : 'N/A'}
                  </span>
                </div>

                <div className="indicator">
                  <span className="indicator-label">Volumen:</span>
                  <span className="indicator-value">
                    {item.volumen ? item.volumen.toLocaleString('es-ES', {notation: 'compact'}) : 'N/A'}
                  </span>
                </div>
              </div>

              {item.patron_velas && (
                <div className="pattern">
                  🕯️ {item.patron_velas.replace(/_/g, ' ').toUpperCase()}
                </div>
              )}

              {item.order_block && (
                <div className="pattern">
                  📦 {item.order_block}
                </div>
              )}

              {item.fvg && (
                <div className="pattern">
                  ⚡ {item.fvg}
                </div>
              )}

              {(item.soporte || item.resistencia) && (
                <div className="indicators" style={{ marginTop: '10px' }}>
                  {item.soporte && (
                    <div className="indicator">
                      <span className="indicator-label">Soporte:</span>
                      <span className="indicator-value bullish">
                        ${item.soporte.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {item.resistencia && (
                    <div className="indicator">
                      <span className="indicator-label">Resistencia:</span>
                      <span className="indicator-value bearish">
                        ${item.resistencia.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {datosDetallados && (
        <Chart data={datosDetallados} symbol={parSeleccionado} />
      )}
    </div>
  );
}

export default App;
