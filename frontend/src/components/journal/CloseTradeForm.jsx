import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Button } from '../shared';
import useJournalStore from '../../store/journalStore';
import { formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function CloseTradeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { entries, closeTrade, fetchEntries, fetchStats } = useJournalStore();
  const [trade, setTrade] = useState(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      precio_cierre: '',
      resultado: '',
      razon_salida: '',
      lecciones: '',
    }
  });

  useEffect(() => {
    const foundTrade = entries.find(e => e.id === id);
    setTrade(foundTrade);
  }, [id, entries]);

  if (!trade) {
    return <div className="flex items-center justify-center min-h-screen text-white">Cargando...</div>;
  }

  const precioCierre = watch('precio_cierre');
  const isLong = trade.operacion === 'LONG';

  const calcularPL = () => {
    if (!precioCierre) return 0;
    const precio = parseFloat(precioCierre);
    if (isNaN(precio)) return 0;
    return isLong ? precio - trade.precio_entrada : trade.precio_entrada - precio;
  };

  const pl = calcularPL();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await closeTrade(trade.id, {
        precio_cierre: parseFloat(data.precio_cierre),
        resultado: data.resultado,
        razon_salida: data.razon_salida,
        lecciones: data.lecciones,
        ganancia_perdida_real: pl,
      });

      toast.success('✅ Trade cerrado exitosamente');
      await fetchEntries();
      await fetchStats();
      navigate('/journal');
    } catch (error) {
      toast.error('❌ Error al cerrar trade');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-900 border-b border-slate-700 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/journal/${id}`)}
              className="text-slate-400 hover:text-white p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            {isLong ? 
              <TrendingUp className="text-green-400" size={36} /> : 
              <TrendingDown className="text-red-400" size={36} />
            }
            <div>
              <h1 className="text-3xl font-bold text-white">Cerrar Trade</h1>
              <p className="text-slate-400 mt-1">
                {trade.activo.replace(' LONG', '').replace(' SHORT', '')} - {trade.operacion}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Info del Trade */}
        <div className="bg-slate-800 rounded-xl p-6 mb-6 border border-slate-700">
          <h2 className="text-white text-xl font-bold mb-4">Información del Trade</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="text-slate-400 text-sm block mb-1">Precio de Entrada</span>
              <span className="text-white font-mono text-xl font-bold">
                {formatCurrency(trade.precio_entrada)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-sm block mb-1">Stop Loss</span>
              <span className="text-red-400 font-mono text-xl font-bold">
                {formatCurrency(trade.stop_loss)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-sm block mb-1">Take Profit 1</span>
              <span className="text-green-400 font-mono text-xl font-bold">
                {formatCurrency(trade.take_profit_1)}
              </span>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="bg-slate-800 rounded-xl p-6 border border-slate-700 space-y-6">
          <h2 className="text-white text-xl font-bold">Datos de Cierre</h2>

          {/* Precio de Cierre */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Precio de Cierre *
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="Ej: 3550.00"
              {...register('precio_cierre', {
                required: 'Campo requerido',
                min: { value: 0.01, message: 'Debe ser mayor a 0' }
              })}
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-600"
            />
            {errors.precio_cierre && (
              <p className="text-red-400 text-sm mt-1">{errors.precio_cierre.message}</p>
            )}
          </div>

          {/* P&L Calculado */}
          {precioCierre && (
            <div className={`rounded-lg p-6 ${
              pl >= 0 ? 'bg-green-900/30 border-2 border-green-500' : 'bg-red-900/30 border-2 border-red-500'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-slate-300 text-sm block mb-1">P&L Calculado</span>
                  <span className={`text-4xl font-bold font-mono ${
                    pl >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {pl >= 0 ? '+' : ''}{formatCurrency(pl)}
                  </span>
                </div>
                <DollarSign className={pl >= 0 ? 'text-green-400' : 'text-red-400'} size={48} />
              </div>
            </div>
          )}

          {/* Resultado */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Resultado *
            </label>
            <select
              {...register('resultado', { required: 'Campo requerido' })}
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-600 cursor-pointer"
            >
              <option value="">Selecciona el resultado</option>
              <option value="Ganado">✅ Ganado</option>
              <option value="Perdido">❌ Perdido</option>
              <option value="Break-even">➖ Break-even</option>
            </select>
            {errors.resultado && (
              <p className="text-red-400 text-sm mt-1">{errors.resultado.message}</p>
            )}
          </div>

          {/* Razón de Salida */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Razón de Salida *
            </label>
            <textarea
              {...register('razon_salida', { required: 'Campo requerido' })}
              rows={4}
              placeholder="¿Por qué cerraste el trade? (Ej: Alcanzó TP1, Se activó SL, Cerré manualmente por volatilidad...)"
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-600"
            />
            {errors.razon_salida && (
              <p className="text-red-400 text-sm mt-1">{errors.razon_salida.message}</p>
            )}
          </div>

          {/* Lecciones Aprendidas */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Lecciones Aprendidas (Opcional)
            </label>
            <textarea
              {...register('lecciones')}
              rows={4}
              placeholder="¿Qué aprendiste? ¿Qué harías diferente? ¿Qué salió bien?"
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-600"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              variant="success"
              size="lg"
              className="flex-1"
              disabled={loading}
            >
              {loading ? 'Cerrando...' : '✅ Cerrar Trade'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => navigate(`/journal/${id}`)}
              disabled={loading}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
