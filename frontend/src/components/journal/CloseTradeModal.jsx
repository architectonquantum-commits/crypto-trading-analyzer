import { useState } from 'react';
import { X, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Button, Input, Select, Modal } from '../shared';
import useJournalStore from '../../store/journalStore';
import { formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function CloseTradeModal({ isOpen, onClose, trade }) {
  const { closeTrade } = useJournalStore();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm({
    defaultValues: {
      precio_cierre: '',
      resultado: '',
      razon_salida: '',
      lecciones: '',
    }
  });

  if (!trade) return null;

  const precioCierre = watch('precio_cierre');
  const isLong = trade.operacion === 'LONG';

  // Calcular P&L automáticamente
  const calcularPL = () => {
    if (!precioCierre) return 0;
    const precio = parseFloat(precioCierre);
    if (isNaN(precio)) return 0;

    if (isLong) {
      return precio - trade.precio_entrada;
    } else {
      return trade.precio_entrada - precio;
    }
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

      toast.success('Trade cerrado exitosamente');
      reset();
      onClose();
    } catch (error) {
      toast.error('Error al cerrar trade');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {isLong ? 
            <TrendingUp className="text-green-400" size={32} /> : 
            <TrendingDown className="text-red-400" size={32} />
          }
          <div>
            <h2 className="text-2xl font-bold text-white">Cerrar Trade</h2>
            <p className="text-slate-400 text-sm">
              {trade.activo.replace(' LONG', '').replace(' SHORT', '')} - {trade.operacion}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      {/* Info del Trade */}
      <div className="bg-slate-700 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-slate-400 text-sm">Precio de Entrada</p>
            <p className="text-white font-mono font-bold">
              {formatCurrency(trade.precio_entrada)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-sm">Stop Loss / Take Profit</p>
            <p className="text-sm">
              <span className="text-red-400 font-mono">{formatCurrency(trade.stop_loss)}</span>
              {' / '}
              <span className="text-green-400 font-mono">{formatCurrency(trade.take_profit_1)}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Precio de Cierre */}
        <Input
          label="Precio de Cierre"
          type="number"
          step="0.01"
          placeholder="Ej: 3550.00"
          {...register('precio_cierre', {
            required: 'Campo requerido',
            min: { value: 0.01, message: 'Debe ser mayor a 0' }
          })}
          error={errors.precio_cierre?.message}
        />

        {/* P&L Calculado */}
        {precioCierre && (
          <div className={`rounded-lg p-4 ${
            pl >= 0 ? 'bg-green-900/30 border border-green-600' : 'bg-red-900/30 border border-red-600'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">P&L Calculado:</span>
              <span className={`text-2xl font-bold font-mono ${
                pl >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {pl >= 0 ? '+' : ''}{formatCurrency(pl)}
              </span>
            </div>
          </div>
        )}

        {/* Resultado */}
        <Select
          label="Resultado"
          {...register('resultado', { required: 'Campo requerido' })}
          error={errors.resultado?.message}
        >
          <option value="">Selecciona el resultado</option>
          <option value="Ganado">Ganado</option>
          <option value="Perdido">Perdido</option>
          <option value="Break-even">Break-even</option>
        </Select>

        {/* Razón de Salida */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Razón de Salida
          </label>
          <textarea
            {...register('razon_salida', { required: 'Campo requerido' })}
            rows={3}
            placeholder="¿Por qué cerraste el trade?"
            className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.razon_salida && (
            <p className="text-red-400 text-sm mt-1">{errors.razon_salida.message}</p>
          )}
        </div>

        {/* Lecciones Aprendidas */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Lecciones Aprendidas
          </label>
          <textarea
            {...register('lecciones')}
            rows={3}
            placeholder="¿Qué aprendiste de este trade?"
            className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            variant="success"
            className="flex-1"
            loading={loading}
            disabled={loading}
          >
            Cerrar Trade
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
