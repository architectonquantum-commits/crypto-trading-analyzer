import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, Calendar, Target } from 'lucide-react';
import { Button, Badge, LoadingSpinner } from '../shared';
import { formatCurrency, formatDate } from '../../utils/formatters';
import useJournalStore from '../../store/journalStore';

export default function TradeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { entries } = useJournalStore();
  const [trade, setTrade] = useState(null);

  useEffect(() => {
    const foundTrade = entries.find(e => e.id === id);
    setTrade(foundTrade);
  }, [id, entries]);

  if (!trade) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const isLong = trade.operacion === 'LONG';
  const isTradeOpen = trade.estatus === 'Abierto';

  return (
    <div className="min-h-screen bg-slate-900 pb-20">
      {/* Header Fixed */}
      <div className="sticky top-0 z-10 bg-slate-900 border-b border-slate-700 px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/journal')}
                className="text-slate-400 hover:text-white p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              {isLong ? 
                <TrendingUp className="text-green-400" size={36} /> : 
                <TrendingDown className="text-red-400" size={36} />
              }
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {trade.activo.replace(' LONG', '').replace(' SHORT', '')}
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <Badge type={isLong ? 'success' : 'error'}>{trade.operacion}</Badge>
                  <Badge type={isTradeOpen ? 'warning' : 'neutral'}>{trade.estatus}</Badge>
                </div>
              </div>
            </div>

            {isTradeOpen && (
              <Button
                variant="success"
                size="lg"
                onClick={() => navigate(`/journal/${id}/close`)}
              >
                Cerrar Trade
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Info General */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-3">
              <Calendar className="text-blue-400" size={24} />
              <span className="text-slate-300 font-medium">Fecha de Operación</span>
            </div>
            <p className="text-white text-2xl font-bold">
              {formatDate(trade.fecha_operacion)}
            </p>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-3">
              <Target className="text-purple-400" size={24} />
              <span className="text-slate-300 font-medium">Confluencias</span>
            </div>
            <div className="flex items-baseline gap-3">
              <p className="text-white text-4xl font-bold">{trade.confluencia_porcentaje}%</p>
              <p className="text-slate-400 text-lg">Score: {trade.score_total}/25</p>
            </div>
          </div>
        </div>

        {/* Precios */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h2 className="text-white text-2xl font-bold mb-6">💰 Niveles de Precio</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-slate-900 rounded-lg p-5 border-l-4 border-blue-500">
              <span className="text-slate-400 text-sm block mb-2">Precio de Entrada</span>
              <span className="text-white font-mono text-2xl font-bold">
                {formatCurrency(trade.precio_entrada)}
              </span>
            </div>

            <div className="bg-slate-900 rounded-lg p-5 border-l-4 border-red-500">
              <span className="text-slate-400 text-sm block mb-2">Stop Loss</span>
              <span className="text-red-400 font-mono text-2xl font-bold">
                {formatCurrency(trade.stop_loss)}
              </span>
            </div>

            <div className="bg-slate-900 rounded-lg p-5 border-l-4 border-green-500">
              <span className="text-slate-400 text-sm block mb-2">Take Profit 1</span>
              <span className="text-green-400 font-mono text-2xl font-bold">
                {formatCurrency(trade.take_profit_1)}
              </span>
            </div>

            {trade.take_profit_2 && (
              <div className="bg-slate-900 rounded-lg p-5 border-l-4 border-green-500">
                <span className="text-slate-400 text-sm block mb-2">Take Profit 2</span>
                <span className="text-green-400 font-mono text-2xl font-bold">
                  {formatCurrency(trade.take_profit_2)}
                </span>
              </div>
            )}

            {trade.take_profit_3 && (
              <div className="bg-slate-900 rounded-lg p-5 border-l-4 border-green-500">
                <span className="text-slate-400 text-sm block mb-2">Take Profit 3</span>
                <span className="text-green-400 font-mono text-2xl font-bold">
                  {formatCurrency(trade.take_profit_3)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Contexto Pre-Trade */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h2 className="text-white text-2xl font-bold mb-6">🧠 Contexto Pre-Trade</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900 rounded-lg p-4">
              <span className="text-slate-400 text-sm block mb-2">Estado Emocional</span>
              <p className="text-white text-lg font-semibold">{trade.estado_emocional}</p>
            </div>

            <div className="bg-slate-900 rounded-lg p-4">
              <span className="text-slate-400 text-sm block mb-2">Sesión de Trading</span>
              <p className="text-white text-lg font-semibold">{trade.sesion}</p>
            </div>

            <div className="md:col-span-2 bg-slate-900 rounded-lg p-4">
              <span className="text-slate-400 text-sm block mb-2">Razón del Estado</span>
              <p className="text-white text-lg">{trade.razon_estado}</p>
            </div>

            <div className="bg-slate-900 rounded-lg p-4">
              <span className="text-slate-400 text-sm block mb-2">Riesgo Diario Permitido</span>
              <p className="text-white text-lg font-semibold">{trade.riesgo_diario_permitido}%</p>
            </div>

            <div className="bg-slate-900 rounded-lg p-4">
              <span className="text-slate-400 text-sm block mb-2">Recomendación del Sistema</span>
              <Badge type={trade.confluencia_porcentaje >= 70 ? 'success' : 'warning'} className="text-base">
                {trade.recomendacion}
              </Badge>
            </div>
          </div>
        </div>

        {/* Resultado */}
        {!isTradeOpen && (
          <div className={`rounded-xl p-6 ${
            trade.resultado === 'Ganado' ? 'bg-green-900/30 border-2 border-green-500' :
            trade.resultado === 'Perdido' ? 'bg-red-900/30 border-2 border-red-500' :
            'bg-gray-900/30 border-2 border-gray-500'
          }`}>
            <h2 className="text-white text-2xl font-bold mb-6">📊 Resultado Final</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <span className="text-slate-400 text-sm block mb-2">Estado</span>
                <Badge type={trade.resultado === 'Ganado' ? 'success' : 'error'} className="text-lg">
                  {trade.resultado}
                </Badge>
              </div>

              {trade.ganancia_perdida_real !== null && (
                <div>
                  <span className="text-slate-400 text-sm block mb-2">Profit & Loss</span>
                  <span className={`font-mono text-4xl font-bold ${
                    trade.ganancia_perdida_real >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {trade.ganancia_perdida_real >= 0 ? '+' : ''}
                    {formatCurrency(trade.ganancia_perdida_real)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
