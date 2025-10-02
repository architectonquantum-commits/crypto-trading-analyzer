import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Chart from './components/Chart'
import Bitacora from './components/Bitacora'
import api from './services/api'

function App() {
  const [symbols, setSymbols] = useState([])
  const [selectedSymbol, setSelectedSymbol] = useState('BTC/USDT')
  const [selectedInterval, setSelectedInterval] = useState('1h')
  const [currentView, setCurrentView] = useState('chart')

  useEffect(() => {
    loadSymbols()
  }, [])

  const loadSymbols = async () => {
    try {
      const response = await api.get('/symbols')
      setSymbols(response.data.symbols)
    } catch (error) {
      console.error('Error cargando símbolos:', error)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Trading App</h1>

            <nav className="flex gap-4">
              <button
                onClick={() => setCurrentView('chart')}
                className={`px-4 py-2 rounded ${
                  currentView === 'chart'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                Gráfico
              </button>
              <button
                onClick={() => setCurrentView('bitacora')}
                className={`px-4 py-2 rounded ${
                  currentView === 'bitacora'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                Bitácora
              </button>
            </nav>
          </div>

          {/* Controles */}
          {currentView === 'chart' && (
            <div className="flex gap-4 mt-4">
              <select
                value={selectedSymbol}
                onChange={(e) => setSelectedSymbol(e.target.value)}
                className="bg-slate-700 text-white px-4 py-2 rounded border border-slate-600"
              >
                {symbols.map((symbol) => (
                  <option key={symbol} value={symbol}>
                    {symbol}
                  </option>
                ))}
              </select>

              <select
                value={selectedInterval}
                onChange={(e) => setSelectedInterval(e.target.value)}
                className="bg-slate-700 text-white px-4 py-2 rounded border border-slate-600"
              >
                <option value="1m">1 minuto</option>
                <option value="5m">5 minutos</option>
                <option value="15m">15 minutos</option>
                <option value="1h">1 hora</option>
                <option value="4h">4 horas</option>
                <option value="1d">1 día</option>
              </select>
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-6">
        {currentView === 'chart' ? (
          <Chart symbol={selectedSymbol} interval={selectedInterval} />
        ) : (
          <Bitacora />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 border-t border-slate-700 mt-8">
        <div className="container mx-auto px-4 py-4 text-center text-slate-400">
          <p>Trading App v1.0 - Análisis Técnico y Backtesting</p>
        </div>
      </footer>
    </div>
  )
}

export default App