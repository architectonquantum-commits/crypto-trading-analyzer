import { useNavigate } from 'react-router-dom';
import { BookOpen, TrendingUp, TrendingDown, Clock, CheckCircle } from 'lucide-react';
import { Card, Badge, EmptyState } from '../shared';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function JournalTable({ entries, loading }) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <Card>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-slate-700 rounded"></div>
          ))}
        </div>
      </Card>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Sin entradas aún"
        description="Valida una señal y guárdala en la bitácora para empezar"
      />
    );
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Fecha</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Activo</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Dirección</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Entrada</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">SL/TP</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Confluencias</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Estatus</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">P&L</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {entries.map((entry) => {
              const isLong = entry.operacion === 'LONG';
              const isOpen = entry.estatus === 'Abierto';

              return (
                <tr 
                  key={entry.id} 
                  className="hover:bg-slate-700 transition-colors cursor-pointer"
                  onClick={() => navigate(`/journal/${entry.id}`)}
                >
                  <td className="px-4 py-3 text-slate-300">
                    {formatDate(entry.fecha_operacion)}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {isLong ? 
                        <TrendingUp className="text-green-400" size={20} /> : 
                        <TrendingDown className="text-red-400" size={20} />
                      }
                      <span className="font-semibold text-white">
                        {entry.activo.replace(' LONG', '').replace(' SHORT', '')}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <Badge type={isLong ? 'success' : 'error'}>
                      {entry.operacion}
                    </Badge>
                  </td>

                  <td className="px-4 py-3 text-white font-mono">
                    {formatCurrency(entry.precio_entrada)}
                  </td>

                  <td className="px-4 py-3 text-sm">
                    <div className="text-red-400">
                      SL: {formatCurrency(entry.stop_loss)}
                    </div>
                    <div className="text-green-400">
                      TP: {formatCurrency(entry.take_profit_1)}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold">
                        {entry.confluencia_porcentaje}%
                      </span>
                      <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            entry.confluencia_porcentaje >= 70 ? 'bg-green-500' : 
                            entry.confluencia_porcentaje >= 55 ? 'bg-yellow-500' : 
                            'bg-red-500'
                          }`}
                          style={{ width: `${entry.confluencia_porcentaje}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {isOpen ? 
                        <Clock className="text-yellow-400" size={16} /> : 
                        <CheckCircle className="text-green-400" size={16} />
                      }
                      <Badge type={isOpen ? 'warning' : 'neutral'}>
                        {entry.estatus}
                      </Badge>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    {entry.ganancia_perdida_real !== null ? (
                      <span className={`font-bold font-mono ${
                        entry.ganancia_perdida_real >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {entry.ganancia_perdida_real >= 0 ? '+' : ''}
                        {formatCurrency(entry.ganancia_perdida_real)}
                      </span>
                    ) : (
                      <span className="text-slate-500">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
