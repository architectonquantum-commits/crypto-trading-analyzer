import { useForm } from 'react-hook-form';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Button, Input, Select } from '../shared';
import useValidatorStore from '../../store/validatorStore';
import { CRYPTO_SYMBOLS } from '../../utils/constants';

const TIMEFRAMES = [
  { value: '1m', label: '1 Minuto' },
  { value: '5m', label: '5 Minutos' },
  { value: '15m', label: '15 Minutos' },
  { value: '30m', label: '30 Minutos' },
  { value: '1h', label: '1 Hora' },
  { value: '4h', label: '4 Horas' },
  { value: '1d', label: '1 Día' },
];

export default function SignalForm() {
  const { validateSignal, loading } = useValidatorStore();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      activo: 'BTC/USDT',
      tipo: 'LONG',
      precio_entrada: '',
      stop_loss: '',
      take_profit: '',
      timeframe: '1h',
    }
  });

  const tipo = watch('tipo');

  const onSubmit = async (data) => {
    const tp = parseFloat(data.take_profit);
    
    const payload = {
      symbol: data.activo,
      direction: data.tipo,
      entry_price: parseFloat(data.precio_entrada),
      stop_loss: parseFloat(data.stop_loss),
      take_profit_1: tp,
      take_profit_2: tp * 1.5,
      take_profit_3: tp * 2,
      timeframe: data.timeframe,
      capital: 10000,
      risk_percentage: 2,
    };

    await validateSignal(payload);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Criptomoneda"
          {...register('activo', { required: true })}
          options={CRYPTO_SYMBOLS.map(s => ({ value: s, label: s }))}
        />

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Tipo</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setValue('tipo', 'LONG')}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold ${
                tipo === 'LONG' ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300'
              }`}
            >
              <TrendingUp size={20} /> LONG
            </button>
            <button
              type="button"
              onClick={() => setValue('tipo', 'SHORT')}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold ${
                tipo === 'SHORT' ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-300'
              }`}
            >
              <TrendingDown size={20} /> SHORT
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input label="Entrada" type="number" step="0.01" {...register('precio_entrada', { required: true })} />
        <Input label="Stop Loss" type="number" step="0.01" {...register('stop_loss', { required: true })} />
        <Input label="Take Profit" type="number" step="0.01" {...register('take_profit', { required: true })} />
      </div>

      <Select
        label="Timeframe"
        {...register('timeframe', { required: true })}
        options={TIMEFRAMES}
      />

      <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
        {loading ? 'Validando...' : 'Validar Señal'}
      </Button>
    </form>
  );
}
