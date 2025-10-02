import { useEffect, useRef, useState } from 'react'
import { createChart } from 'lightweight-charts'
import api from '../services/api'

function Chart({ symbol, interval }) {
  const chartContainerRef = useRef(null)
  const chartRef = useRef(null)
  const candlestickSeriesRef = useRef(null)
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!chartContainerRef.current) return

    // Crear gráfico
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 500,
      layout: {
        background: { color: '#1e293b' },
        textColor: '#d1d5db',
      },
      grid: {
        vertLines: { color: '#334155' },
        horzLines: { color: '#334155' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    })

    chartRef.current = chart
    candlestickSeriesRef.current = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderUpColor: '#10b981',
      borderDownColor: '#ef4444',
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    })

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ 
          width: chartContainerRef.current.clientWidth 
        })
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [symbol, interval])

  const loadData = async () => {
    setLoading(true)
    try {
      // Obtener datos OHLCV
      const dataResponse = await api.get(`/data/${symbol}/${interval}?limit=500`)
      const candleData = dataResponse.data.data.map(item => ({
        time: new Date(item.timestamp).getTime() / 1000,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
      }))

      candlestickSeriesRef.current.setData(candleData)
      chartRef.current.timeScale().fitContent()

      // Obtener análisis
      const analysisResponse = await api.get(`/analysis/${symbol}/${interval}`)
      setAnalysis(analysisResponse.data)

    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Información del símbolo */}
      <div className="bg-slate-800 p-4 rounded-lg">
        <h2 className="text-xl font-bold mb-2">{symbol}</h2>
        {analysis && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-slate-400 text-sm">Precio</p>
              <p className="text-lg font-semibold">
                ${analysis.last_candle.close.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">RSI</p>
              <p className={`text-lg font-semibold ${
                analysis.indicators.rsi > 70 ? 'text-red-400' :
                analysis.indicators.rsi < 30 ? 'text-green-400' : 'text-white'
              }`}>
                {analysis.indicators.rsi ? analysis.indicators.rsi.toFixed(2) : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">ADX</p>
              <p className={`text-lg font-semibold ${
                analysis.indicators.adx > 25 ? 'text-green-400' : 'text-yellow-400'
              }`}>
                {analysis.indicators.adx ? analysis.indicators.adx.toFixed(2) : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Patrones</p>
              <p className="text-lg font-semibold">
                {analysis.patterns.length}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Gráfico */}
      <div className="bg-slate-800 p-4 rounded-lg">
        {loading && (
          <div className="flex items-center justify-center h-[500px]">
            <p className="text-slate-400">Cargando datos...</p>
          </div>
        )}
        <div ref={chartContainerRef} className={loading ? 'hidden' : ''} />
      </div>

      {/* Patrones detectados */}
      {analysis && analysis.patterns.length > 0 && (
        <div className="bg-slate-800 p-4 rounded-lg">
          <h3 className="text-lg font-bold mb-3">Patrones Detectados</h3>
          <div className="space-y-2">
            {analysis.patterns.map((pattern, index) => (
              <div 
                key={index}
                className={`p-3 rounded border ${
                  pattern.signal === 'LONG' ? 'bg-green-900/20 border-green-600' :
                  pattern.signal === 'SHORT' ? 'bg-red-900/20 border-red-600' :
                  'bg-yellow-900/20 border-yellow-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{pattern.name}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    pattern.signal === 'LONG' ? 'bg-green-600' :
                    pattern.signal === 'SHORT' ? 'bg-red-600' :
                    'bg-yellow-600'
                  }`}>
                    {pattern.signal}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Niveles clave */}
      {analysis && (
        <div className="bg-slate-800 p-4 rounded-lg">
          <h3 className="text-lg font-bold mb-3">Niveles Clave</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-slate-400 text-sm">Soporte</p>
              <p className="text-green-400 font-semibold">
                ${analysis.levels.support.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Precio Actual</p>
              <p className="text-white font-semibold">
                ${analysis.levels.current_price.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Resistencia</p>
              <p className="text-red-400 font-semibold">
                ${analysis.levels.resistance.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Chart