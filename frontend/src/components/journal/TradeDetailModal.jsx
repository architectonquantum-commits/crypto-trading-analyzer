import { X, TrendingUp, TrendingDown, Calendar, Target } from 'lucide-react';
import { Button, Badge, Modal } from '../shared';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function TradeDetailModal({ isOpen, onClose, trade, onOpenCloseModal }) {
  if (!trade) return null;

  const isLong = trade.operacion === 'LONG';
  const isTradeOpen = trade.estatus === 'Abierto';

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="flex flex-col" style={{ maxHeight: '85vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            {isLong ? 
              <TrendingUp className="text-green-400" size={32} /> : 
              <TrendingDown className="text-red-400" size={32} />
            }
            <div>
              <h2 className="text-2xl font-bold text-white">
                {trade.activo.replace(' LONG', '').replace(' SHORT', '')}
              </h2>
              <Badge type={isLong ? 'success' : 'error'} className="mt-1">
                {trade.operacion}
              </Badge>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 pr-2 space-y-4">
          {/* Info General */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-700 rounded p-3">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="text-blue-400" size={18} />
                <span className="text-slate-400 text-xs">Fecha</span>
              </div>
              <p className="text-white font-bold">{formatDate(trade.fecha_operacion)}</p>
            </div>

            <div className="bg-slate-700 rounded p-3">
              <div className="flex items-center gap-2 mb-1">
                <Target className="text-purple-400" size={18} />
                <span className="text-slate-400 text-xs">Confluencias</span>
              </div>
              <p className="text-white font-bold">{trade.confluencia_porcentaje}%</p>
              <p className="text-slate-400 text-xs">Score: {trade.score_total}/25</p>
            </div>
          </div>

          {/* Precios */}
          <div className="bg-slate-700 rounded p-4">
            <h3 className="text-white font-bold mb-3">Niveles de Precio</h3>
            <div className="space-y-2">
              <div className="flex justify-between bg-slate-800 rounded p-2">
                <span className="text-slate-400 text-sm">Entrada</span>
                <span className="text-white font-mono font-bold">{formatCurrency(trade.precio_entrada)}</span>
              </div>
              <div className="flex justify-between bg-slate-800 rounded p-2">
                <span className="text-slate-400 text-sm">Stop Loss</span>
                <span className="text-red-400 font-mono font-bold">{formatCurrency(trade.stop_loss)}</span>
              </div>
              <div className="flex justify-between bg-slate-800 rounded p-2">
                <span className="text-slate-400 text-sm">Take Profit 1</span>
                <span className="text-green-400 font-mono font-bold">{formatCurrency(trade.take_profit_1)}</span>
              </div>
              {trade.take_profit_2 && (
                <div className="flex justify-between bg-slate-800 rounded p-2">
                  <span className="text-slate-400 text-sm">Take Profit 2</span>
                  <span className="text-green-400 font-mono font-bold">{formatCurrency(trade.take_profit_2)}</span>
                </div>
              )}
              {trade.take_profit_3 && (
                <div className="flex justify-between bg-slate-800 rounded p-2">
                  <span className="text-slate-400 text-sm">Take Profit 3</span>
                  <span className="text-green-400 font-mono font-bold">{formatCurrency(trade.take_profit_3)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Contexto Pre-Trade */}
          <div className="bg-slate-700 rounded p-4">
            <h3 className="text-white font-bold mb-3">Contexto Pre-Trade</h3>
            <div className="space-y-2">
              <div className="bg-slate-800 rounded p-2">
                <span className="text-slate-400 text-xs block">Estado Emocional</span>
                <p className="text-white">{trade.estado_emocional}</p>
              </div>
              <div className="bg-slate-800 rounded p-2">
                <span className="text-slate-400 text-xs block">Razón del Estado</span>
                <p className="text-white">{trade.razon_estado}</p>
              </div>
              <div className="bg-slate-800 rounded p-2">
                <span className="text-slate-400 text-xs block">Sesión</span>
                <p className="text-white">{trade.sesion}</p>
              </div>
              <div className="bg-slate-800 rounded p-2">
                <span className="text-slate-400 text-xs block">Riesgo Diario</span>
                <p className="text-white">{trade.riesgo_diario_permitido}%</p>
              </div>
              <div className="bg-slate-800 rounded p-2">
                <span className="text-slate-400 text-xs block">Recomendación</span>
                <Badge type={trade.confluencia_porcentaje >= 70 ? 'success' : 'warning'}>
                  {trade.recomendacion}
                </Badge>
              </div>
            </div>
          </div>

          {/* Resultado */}
          {!isTradeOpen && (
            <div className={`rounded p-4 ${
              trade.resultado === 'Ganado' ? 'bg-green-900/30 border-2 border-green-500' :
              trade.resultado === 'Perdido' ? 'bg-red-900/30 border-2 border-red-500' :
              'bg-gray-900/30 border-2 border-gray-500'
            }`}>
              <h3 className="text-white font-bold mb-3">Resultado</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 text-xs block">Estado</span>
                  <Badge type={trade.resultado === 'Ganado' ? 'success' : 'error'}>
                    {trade.resultado}
                  </Badge>
                </div>
                {trade.ganancia_perdida_real !== null && (
                  <div>
                    <span className="text-slate-400 text-xs block">P&L</span>
                    <span className={`font-mono text-xl font-bold ${
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

        {/* Footer */}
        <div className="flex gap-3 mt-4 pt-4 border-t border-slate-700 flex-shrink-0">
          {isTradeOpen ? (
            <>
              <Button
                variant="success"
                className="flex-1"
                onClick={() => {
                  onClose();
                  onOpenCloseModal(trade);
                }}
              >
                Cerrar Trade
              </Button>
              <Button variant="outline" onClick={onClose}>Cancelar</Button>
            </>
          ) : (
            <Button variant="outline" className="flex-1" onClick={onClose}>Cerrar</Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
