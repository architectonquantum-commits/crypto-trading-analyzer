import { useState } from 'react';
import { Play, Activity } from 'lucide-react';
import api from '../../../services/api';
import { backtestAdvancedApi } from '../../../services/backtestAdvancedApi';
import Card from '../../shared/Card';
import LoadingSpinner from '../../shared/LoadingSpinner';
import MonteCarloChart from './MonteCarloChart';
import AdvancedMetricsTable from './AdvancedMetricsTable';
import SessionAnalysis from './SessionAnalysis';
import TemporalAnalysisCard from './TemporalAnalysisCard';

export default function AdvancedBacktestTab({ validationResult }) {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [temporalAnalysis, setTemporalAnalysis] = useState(null);
  const [contextLoading, setContextLoading] = useState(false);

  const analyzeTemporalConsistency = async (trades) => {
    console.log('🔍 analyzeTemporalConsistency called with', trades.length, 'trades');
    
    if (!trades || trades.length < 20) {
      console.log('⚠️ Not enough trades:', trades?.length);
      return;
    }

    setContextLoading(true);
    console.log('📤 Sending request to temporal-analysis...');
    
    try {
      const response = await api.post('/api/backtest/temporal-analysis', { trades });

      const data = response.data;
      
      if (data.success) {
        setTemporalAnalysis(data.data);
      }
    } catch (error) {
      console.error('Error en análisis temporal:', error);
    } finally {
      setContextLoading(false);
    }
  };
  const [temporalLoading, setTemporalLoading] = useState(false);
  const [config, setConfig] = useState({
    start_date: '2024-01-01',
    end_date: '2025-09-30',
    initial_capital: 10000,
    risk_per_trade: 2.0,
    num_simulations: 10000,
    confidence_level: 95
  });

  // ✅ CORRECCIÓN: Los datos están en signal_input
  const signalInput = validationResult?.signal_input;
  const hasValidation = signalInput && signalInput.symbol;

  const runBacktest = async () => {
    if (!hasValidation) {
      alert('Primero valida una señal en el tab "Validación"');
      return;
    }

    setLoading(true);
    try {
      // Construir signal_data desde signal_input
      const signalData = {
        symbol: signalInput.symbol,
        direction: signalInput.direction || 'long',
        timeframe: signalInput.timeframe || '1h',
        entry_price: signalInput.entry_price || 0,
        stop_loss: signalInput.stop_loss || 0,
        take_profit: signalInput.take_profit_1 || 0
      };

      console.log('Enviando al backend:', signalData);

      const response = await backtestAdvancedApi.runAdvanced({
        signal_data: signalData,
        ...config
      });
      
      setResults(response);
      
      // Analizar consistencia temporal
      if (response.trades_sample) {
        await analyzeTemporalConsistency(response.trades_sample);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2 mb-2">
            <Activity className="text-blue-500" />
            Backtesting Avanzado
          </h2>
          <p className="text-slate-400">Monte Carlo + Métricas Profesionales + Análisis por Sesiones</p>
        </div>

        {hasValidation && (
          <div className="mb-6 p-4 bg-green-900/20 border border-green-600 rounded-lg">
            <p className="text-green-400 font-semibold mb-2">✅ Señal detectada:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <div><span className="text-slate-400">Par:</span> <span className="ml-2 text-white font-bold">{signalInput.symbol}</span></div>
              <div><span className="text-slate-400">Dirección:</span> <span className="ml-2 text-white font-bold">{signalInput.direction?.toUpperCase()}</span></div>
              <div><span className="text-slate-400">Entrada:</span> <span className="ml-2 text-white">${signalInput.entry_price}</span></div>
              <div><span className="text-slate-400">Timeframe:</span> <span className="ml-2 text-white">{signalInput.timeframe}</span></div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Fecha Inicio</label>
            <input type="date" value={config.start_date} onChange={(e) => setConfig({...config, start_date: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fecha Fin</label>
            <input type="date" value={config.end_date} onChange={(e) => setConfig({...config, end_date: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Capital ($)</label>
            <input type="number" value={config.initial_capital} onChange={(e) => setConfig({...config, initial_capital: Number(e.target.value)})} className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Riesgo (%)</label>
            <input type="number" step="0.1" value={config.risk_per_trade} onChange={(e) => setConfig({...config, risk_per_trade: Number(e.target.value)})} className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Simulaciones</label>
            <select value={config.num_simulations} onChange={(e) => setConfig({...config, num_simulations: Number(e.target.value)})} className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white">
              <option value={1000}>1,000 (10s)</option>
              <option value={5000}>5,000 (20s)</option>
              <option value={10000}>10,000 (30s)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Confianza</label>
            <select value={config.confidence_level} onChange={(e) => setConfig({...config, confidence_level: Number(e.target.value)})} className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white">
              <option value={90}>90%</option>
              <option value={95}>95%</option>
              <option value={99}>99%</option>
            </select>
          </div>
        </div>

        <button onClick={runBacktest} disabled={loading || !hasValidation} className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 disabled:from-slate-600 disabled:to-slate-500 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg text-lg flex items-center justify-center gap-3 transition-all transform hover:scale-105 disabled:hover:scale-100 shadow-lg">
          {loading ? (<><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>Ejecutando...</>) : (<><Play size={24} />🚀 EJECUTAR ANÁLISIS AVANZADO</>)}
        </button>

        {!hasValidation && (
          <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-600 rounded-lg">
            <p className="text-yellow-400 text-center font-semibold">⚠️ Primero valida una señal</p>
            <p className="text-slate-400 text-center text-sm mt-2">Ve al tab "Validación" → Completa el formulario → Valida la señal</p>
          </div>
        )}
      </Card>

      {loading && (<Card><div className="text-center py-12"><LoadingSpinner size="lg" /><p className="text-slate-400 mt-4 text-lg">Ejecutando {config.num_simulations.toLocaleString()} simulaciones...</p></div></Card>)}

      {results && !loading && (
        <>
          <AdvancedMetricsTable metrics={results.advanced_metrics} />
          <MonteCarloChart data={results.monte_carlo} />
          <SessionAnalysis bestSession={results.best_session} worstSession={results.worst_session} bestWeekday={results.best_weekday} worstWeekday={results.worst_weekday} />
          
          {/* Análisis Temporal */}
          <TemporalAnalysisCard 
            analysis={temporalAnalysis}
            loading={contextLoading}
          />
        </>
      )}
    </div>
  );
}
