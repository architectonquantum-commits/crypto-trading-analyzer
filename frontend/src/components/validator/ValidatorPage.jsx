import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FileText, AlertCircle, TrendingUp, CheckCircle, XCircle, BarChart3 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Button, Input, Select, LoadingSpinner } from '../shared';
import EquityCurveChart from './EquityCurveChart';
import useValidatorStore from '../../store/validatorStore';
import SaveToJournalModal from './SaveToJournalModal';
import BacktestResults from '../backtest/BacktestResults';
import backtestApi from '../../services/backtestApi';
import toast from 'react-hot-toast';

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
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [backtestData, setBacktestData] = useState(null);
  const [backtestLoading, setBacktestLoading] = useState(false);
  
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
      
      toast.success(`📊 Datos completos cargados: ${data.activo}`);
      
      window.history.replaceState({}, document.title);
    }
  }, [location, setValue]);

  // 🆕 Auto-cargar backtesting cuando cambia el símbolo
  useEffect(() => {
    if (currentSymbol) {
      loadBacktest(currentSymbol, currentTimeframe);
    }
  }, [currentSymbol, currentTimeframe]);

  const loadBacktest = async (symbol, timeframe) => {
    setBacktestLoading(true);
    try {
      const data = await backtestApi.runBacktest(symbol, timeframe, 100);
      setBacktestData(data);
    } catch (error) {
      console.error('Error loading backtest:', error);
      toast.error('No se pudo cargar el backtesting');
    } finally {
      setBacktestLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
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

  const handleReset = () => {
    reset();
    useValidatorStore.getState().clearResult();
    setBacktestData(null);
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

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Datos de la Señal</h2>
          
          {location.state?.fromScanner && (
            <div className="mb-4 p-3 bg-blue-900/30 border border-blue-600 rounded-lg">
              <p className="text-sm text-blue-300 flex items-center gap-2">
                <TrendingUp size={16} />
                ✅ Datos cargados automáticamente desde Scanner (con SL/TP calculados por ATR)
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
              {...register('direccion', { required: 'Campo requerido' })}
            >
              <option value="LONG">LONG (Compra)</option>
              <option value="SHORT">SHORT (Venta)</option>
            </Select>

            <Input
              label="Precio de Entrada"
              type="number"
              step="0.01"
              placeholder="Ej: 45000.00"
              {...register('precio_entrada', { 
                required: 'Campo requerido',
                min: { value: 0.01, message: 'Debe ser mayor a 0' }
              })}
              error={errors.precio_entrada?.message}
            />

            <Input
              label="Stop Loss"
              type="number"
              step="0.01"
              placeholder="Ej: 44000.00"
              {...register('stop_loss', { 
                required: 'Campo requerido',
                min: { value: 0.01, message: 'Debe ser mayor a 0' }
              })}
              error={errors.stop_loss?.message}
            />

            <Input
              label="Take Profit"
              type="number"
              step="0.01"
              placeholder="Ej: 48000.00"
              {...register('take_profit', { 
                required: 'Campo requerido',
                min: { value: 0.01, message: 'Debe ser mayor a 0' }
              })}
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

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                loading={loading}
                disabled={loading}
              >
                Validar Señal
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={handleReset}
                disabled={loading}
              >
                Limpiar
              </Button>
            </div>
          </form>
        </div>

        <div className="bg-slate-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Resultado del Análisis</h2>

          {loading ? (
            <div className="flex items-center justify-center h-64">
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

      {/* 🆕 SECCIÓN DE BACKTESTING */}
      {currentSymbol && (
        <div>
          {backtestLoading ? (
            <div className="bg-slate-800 rounded-lg p-12">
              <div className="flex flex-col items-center justify-center">
                <LoadingSpinner size="lg" />
                <p className="text-slate-400 mt-4">Calculando backtesting histórico...</p>
              </div>
            </div>
          ) : backtestData ? (
            <BacktestResults data={backtestData} />
          ) : null}
        </div>
      )}

      {showSaveModal && (
        <SaveToJournalModal
          isOpen={showSaveModal}
          onClose={() => setShowSaveModal(false)}
          validationResult={validationResult}
        />
      )}
      
      {/* Equity Curve */}
      <EquityCurveChart />

    </div>
      
      
  );

}
