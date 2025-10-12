import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FileText, AlertCircle, TrendingUp, CheckCircle, XCircle, BarChart3, Activity } from 'lucide-react';
import AdvancedBacktestTab from './advanced/AdvancedBacktestTab';
import { useForm } from 'react-hook-form';
import { Button, Input, Select, LoadingSpinner } from '../shared';
import EquityCurveChart from './EquityCurveChart';
import useValidatorStore from '../../store/validatorStore';
import SaveToJournalModal from './SaveToJournalModal';
import EntryContextCard from './EntryContextCard';
import { entryContextApi } from '../../services/entryContextApi';
import toast from 'react-hot-toast';
import { validateBreakout } from '../../services/validatorApi';

// 🆕 IMPORTS DE NIVELES MANUALES
import LevelsInput from './LevelsInput';
import LevelsList from './LevelsList';
import LevelsProximityIndicator from './LevelsProximityIndicator';
import useLevelsStore from '../../store/levelsStore';

const CRYPTO_PAIRS = [
  'BTC/USDT', 'ETH/USDT', 'XRP/USDT', 'SOL/USDT', 'ADA/USDT',
  'LINK/USDT', 'DOT/USDT', 'AVAX/USDT', 'MATIC/USDT', 'UNI/USDT',
  'LTC/USDT', 'ALGO/USDT', 'ATOM/USDT', 'XLM/USDT', 'DOGE/USDT',
  'AAVE/USDT', 'SNX/USDT', 'FIL/USDT', 'VET/USDT', 'ETC/USDT',
  'TRX/USDT', 'SUSHI/USDT', 'BCH/USDT'
];

export default function ValidatorPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { validationResult, loading, validateSignal } = useValidatorStore();
  
  // 🆕 STORE DE NIVELES
  const { analyzeProximity, analysis: levelsAnalysis } = useLevelsStore();
  
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [activeTab, setActiveTab] = useState('validation');
  const [entryContext, setEntryContext] = useState(null);
  const [contextLoading, setContextLoading] = useState(false);
  const [breakoutResult, setBreakoutResult] = useState(null);
  const [breakoutLoading, setBreakoutLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm({
    defaultValues: {
      activo: '',
      direccion: 'LONG',
      precio_entrada: '',
      stop_loss: '',
      take_profit: '',
      timeframe: '1h'
    }
  });

  const currentSymbol = watch('activo');
  const currentTimeframe = watch('timeframe');

  useEffect(() => {
    if (location.state?.fromScanner && location.state?.prefilledData) {
      const data = location.state.prefilledData;
      if (data.activo) setValue('activo', data.activo);
      if (data.direccion) setValue('direccion', data.direccion);
      if (data.precio_entrada) setValue('precio_entrada', data.precio_entrada);
      if (data.stop_loss) setValue('stop_loss', data.stop_loss);
      if (data.take_profit) setValue('take_profit', data.take_profit);
      toast.success(`📊 Datos cargados: ${data.activo}`);
      window.history.replaceState({}, document.title);
    }
  }, [location, setValue]);

  const analyzeEntryContext = async (signalData) => {
    if (!signalData.symbol || !signalData.entry_price || !signalData.direction) {
      return;
    }

    setContextLoading(true);
    try {
      const context = await entryContextApi.analyzeContext({
        symbol: signalData.symbol,
        entry_price: signalData.entry_price,
        direction: signalData.direction,
        timeframe: signalData.timeframe
      });
      setEntryContext(context);
    } catch (error) {
      console.error('Error analizando contexto:', error);
      setEntryContext({
        type: 'error',
        confidence: 0,
        description: 'Error al analizar contexto',
        icon: '❌'
      });
    } finally {
      setContextLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      // 🆕 ANALIZAR NIVELES PRIMERO
      await analyzeProximity(
        data.activo,
        parseFloat(data.precio_entrada),
        data.direccion
      );

      // Analizar contexto de entrada
      await analyzeEntryContext({
        symbol: data.activo,
        entry_price: parseFloat(data.precio_entrada),
        direction: data.direccion,
        timeframe: data.timeframe
      });

      // Validar señal
      await validateSignal({
        symbol: data.activo,
        entry_price: parseFloat(data.precio_entrada),
        stop_loss: parseFloat(data.stop_loss),
        take_profit_1: parseFloat(data.take_profit),
        direction: data.direccion,
        capital: 10000,
        risk_percentage: 2,
        timeframe: data.timeframe
      });
      
      toast.success('Señal validada correctamente');
    } catch (error) {
      toast.error('Error al validar señal');
    }
  };

  const handleValidateBreakout = async () => {
    console.log("🔍 handleValidateBreakout INICIADO");
    const formData = watch();
    
    if (!formData.activo || !formData.precio_entrada) {
      toast.error('Completa símbolo y precio de entrada primero');
      return;
    }
    
    setBreakoutLoading(true);
    
    try {
      const resistancePrice = parseFloat(formData.precio_entrada) * 0.98;
      
      const result = await validateBreakout(
        formData.activo,
        formData.timeframe || '1h',
        parseFloat(formData.precio_entrada),
        resistancePrice
      );
      
      console.log("✅ Resultado recibido:", result);
      setBreakoutResult(result);
      toast.success('Validación de ruptura completada');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al validar ruptura técnica');
    } finally {
      setBreakoutLoading(false);
    }
  };

  const handleReset = () => {
    reset();
    useValidatorStore.getState().clearResult();
    setBreakoutResult(null);
  };

  const getRecommendationColor = (rec) => {
    if (rec === 'OPERAR') return 'text-green-400';
    if (rec === 'CONSIDERAR') return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRecommendationIcon = (rec) => {
    if (rec === 'OPERAR') return <CheckCircle className="text-green-400" size={32} />;
    if (rec === 'CONSIDERAR') return <AlertCircle className="text-yellow-400" size={32} />;
    return <XCircle className="text-red-400" size={32} />;
  };

  const canSaveToJournal = validationResult && 
    validationResult.validation?.recommendation === 'OPERAR' && 
    validationResult.scores?.percentage >= 70;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <FileText className="text-blue-500" size={32} />
          Validador de Señales
        </h1>
        <p className="text-slate-400 mt-2">
          Analiza tu señal con 5 módulos de confluencias y backtesting histórico
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-slate-800 rounded-lg p-1 flex gap-1">
        <button
          onClick={() => setActiveTab('validation')}
          className={`flex-1 px-4 py-3 rounded font-semibold transition-all ${
            activeTab === 'validation'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-700'
          }`}
        >
          <FileText className="inline mr-2" size={20} />
          Validación
        </button>
        <button
          onClick={() => setActiveTab('advanced')}
          className={`flex-1 px-4 py-3 rounded font-semibold transition-all ${
            activeTab === 'advanced'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-700'
          }`}
        >
          <Activity className="inline mr-2" size={20} />
          Backtesting Avanzado
        </button>
      </div>

      {activeTab === 'validation' && (
        <>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Datos de la Señal</h2>
              
              {location.state?.fromScanner && (
                <div className="mb-4 p-3 bg-blue-900/30 border border-blue-600 rounded-lg">
                  <p className="text-sm text-blue-300 flex items-center gap-2">
                    <TrendingUp size={16} />
                    ✅ Datos cargados desde Scanner
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Select
                  label="Criptomoneda"
                  {...register('activo', { required: 'Campo requerido' })}
                  error={errors.activo?.message}
                >
                  <option value="">Selecciona un par</option>
                  {CRYPTO_PAIRS.map(pair => (
                    <option key={pair} value={pair}>{pair}</option>
                  ))}
                </Select>

                <Select
                  label="Dirección"
                  {...register('direccion')}
                >
                  <option value="LONG">LONG</option>
                  <option value="SHORT">SHORT</option>
                </Select>

                <Input
                  label="Precio de Entrada"
                  type="number"
                  step="0.01"
                  {...register('precio_entrada', { required: 'Campo requerido' })}
                  error={errors.precio_entrada?.message}
                />

                <Input
                  label="Stop Loss"
                  type="number"
                  step="0.01"
                  {...register('stop_loss', { required: 'Campo requerido' })}
                  error={errors.stop_loss?.message}
                />

                <Input
                  label="Take Profit"
                  type="number"
                  step="0.01"
                  {...register('take_profit', { required: 'Campo requerido' })}
                  error={errors.take_profit?.message}
                />

                <Select
                  label="Timeframe"
                  {...register('timeframe')}
                >
                  <option value="1h">1 Hora</option>
                  <option value="4h">4 Horas</option>
                  <option value="1d">1 Día</option>
                </Select>

                <div className="flex gap-3">
                  <Button type="submit" loading={loading} className="flex-1">
                    Validar Señal
                  </Button>
                  <Button type="button" variant="secondary" onClick={handleReset}>
                    Limpiar
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleValidateBreakout}
                    loading={breakoutLoading}
                    className="flex-1"
                  >
                    🔍 Validar Ruptura
                  </Button>
                </div>
              </form>

              {/* 🆕 SECCIÓN DE NIVELES MANUALES */}
              <div className="mt-6 space-y-4">
                <LevelsInput symbol={currentSymbol} />
                <LevelsList symbol={currentSymbol} />
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Resultados</h2>
              
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <LoadingSpinner size="lg" />
                </div>
              ) : validationResult ? (
                <div className="space-y-4">
                  <div className={`text-center p-6 rounded-lg ${
                    validationResult.validation?.recommendation === 'OPERAR' ? 'bg-green-900/30 border-2 border-green-600' :
                    validationResult.validation?.recommendation === 'CONSIDERAR' ? 'bg-yellow-900/30 border-2 border-yellow-600' :
                    'bg-red-900/30 border-2 border-red-600'
                  }`}>
                    <div className="flex justify-center mb-2">
                      {getRecommendationIcon(validationResult.validation?.recommendation)}
                    </div>
                    <p className="text-sm text-slate-300 mb-1">Recomendación:</p>
                    <p className={`text-3xl font-bold ${getRecommendationColor(validationResult.validation?.recommendation)}`}>
                      {validationResult.validation?.recommendation}
                    </p>
                    <p className="text-lg text-white mt-2">
                      {validationResult.scores?.percentage}% de Confluencias
                    </p>
                    <p className="text-sm text-slate-400">
                      {validationResult.scores?.total}/{validationResult.scores?.max_possible} puntos
                    </p>
                  </div>

                  {/* Contexto de Entrada */}
                  <EntryContextCard 
                    context={entryContext} 
                    loading={contextLoading}
                  />

                  {/* 🆕 INDICADOR DE PROXIMIDAD A NIVELES */}
                  <LevelsProximityIndicator analysis={levelsAnalysis} />

                  <div className="space-y-2">
                    <h3 className="font-semibold text-slate-300">Análisis por Módulo:</h3>
                    {validationResult.scores && (
                      <>
                        <div className="flex justify-between items-center p-3 bg-slate-700 rounded">
                          <span>Técnico</span>
                          <span className="font-bold">{validationResult.scores.technical}/7</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-700 rounded">
                          <span>Estructura</span>
                          <span className="font-bold">{validationResult.scores.structure}/5</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-700 rounded">
                          <span>Riesgo</span>
                          <span className="font-bold">{validationResult.scores.risk}/4</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-700 rounded">
                          <span>Macro</span>
                          <span className="font-bold">{validationResult.scores.macro}/5</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-700 rounded">
                          <span>Sentimiento</span>
                          <span className="font-bold">{validationResult.scores.sentiment}/4</span>
                        </div>

                        {/* 🆕 MOSTRAR PUNTOS BONUS DE NIVELES */}
                        {levelsAnalysis && levelsAnalysis.bonus_points > 0 && (
                          <div className="flex justify-between items-center p-3 bg-green-900/30 border border-green-600 rounded">
                            <span className="flex items-center gap-2">
                              <span>📍 Niveles Clave</span>
                            </span>
                            <span className="font-bold text-green-400">
                              +{levelsAnalysis.bonus_points}/10
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {canSaveToJournal && (
                    <Button
                      variant="success"
                      onClick={() => navigate("/journal/new", { state: { validationResult } })}
                    >
                      💾 Guardar en Bitácora
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                  <FileText size={48} className="mb-4 text-slate-600" />
                  <p>Completa el formulario y haz clic en "Validar Señal"</p>
                </div>
              )}
            </div>
          </div>

          {/* Card de Resultados de Ruptura Técnica */}
          {breakoutResult && (
            <div className="bg-slate-800 rounded-lg p-6 mt-6">
              <h2 className="text-xl font-bold mb-4">🔍 Validación de Ruptura Técnica</h2>
              
              <div className={`text-center p-6 rounded-lg mb-4 ${
                breakoutResult.recommendation === 'STRONG_BREAKOUT' ? 'bg-green-900/30 border-2 border-green-600' :
                breakoutResult.recommendation === 'GOOD_BREAKOUT' ? 'bg-blue-900/30 border-2 border-blue-600' :
                breakoutResult.recommendation === 'WEAK_BREAKOUT' ? 'bg-yellow-900/30 border-2 border-yellow-600' :
                'bg-red-900/30 border-2 border-red-600'
              }`}>
                <p className="text-sm text-slate-300 mb-1">Score Total:</p>
                <p className="text-3xl font-bold text-white">
                  {breakoutResult.total_score}/{breakoutResult.max_score}
                </p>
                <p className="text-lg text-slate-300 mt-2">
                  {breakoutResult.score_percentage}% - {breakoutResult.confidence}
                </p>
                <p className="text-sm text-slate-400 mt-2">
                  {breakoutResult?.recommendation?.replace('_', ' ')}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-slate-300 mb-3">Criterios de Validación:</h3>
                
                <div className="flex justify-between items-center p-3 bg-slate-700 rounded">
                  <span>🚧 Ruptura de Resistencia</span>
                  <span className="font-bold">
                    {breakoutResult?.criteria?.criterion_1_resistance_breakout?.score}/2
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-slate-700 rounded">
                  <span>📊 RSI (50-70)</span>
                  <span className="font-bold">
                    {breakoutResult?.criteria?.criterion_2_rsi?.score}/2
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-slate-700 rounded">
                  <span>📈 MACD Cruce Alcista</span>
                  <span className="font-bold">
                    {breakoutResult?.criteria?.criterion_3_macd?.score}/2
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-slate-700 rounded">
                  <span>📉 Precio &gt; EMA 21</span>
                  <span className="font-bold">
                    {breakoutResult?.criteria?.criterion_4_ema?.score}/2
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-slate-700 rounded">
                  <span>🔊 Volumen &gt; Promedio</span>
                  <span className="font-bold">
                    {breakoutResult?.criteria?.criterion_5_volume_trend?.score}/2
                  </span>
                </div>
              </div>

              <div className="mt-4 p-4 bg-slate-700 rounded-lg">
                <p className="text-sm text-slate-300">{breakoutResult.summary}</p>
              </div>
            </div>
          )}

          {showSaveModal && (
            <SaveToJournalModal
              isOpen={showSaveModal}
              onClose={() => setShowSaveModal(false)}
              validationResult={validationResult}
            />
          )}
          
          <EquityCurveChart />
        </>
      )}

      {activeTab === 'advanced' && (
        <AdvancedBacktestTab validationResult={validationResult} />
      )}
    </div>
  );
}
