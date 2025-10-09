import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, Badge, Button } from '../shared';
import useJournalStore from '../../store/journalStore';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function RecentTrades() {
  const navigate = useNavigate();
  const { entries, fetchEntries, loading } = useJournalStore();

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // Asegurar que entries sea un array
  const allEntries = Array.isArray(entries) ? entries : [];
  
  const recentEntries = allEntries
    .sort((a, b) => new Date(b.fecha_apertura) - new Date(a.fecha_apertura))
    .slice(0, 5);

  const getStatusBadge = (estatus) => {
    const badges = {
      ABIERTO: { type: 'info', label: 'Abierto' },
      CERRADO: { type: 'neutral', label: 'Cerrado' },
    };
    return badges[estatus] || { type: 'neutral', label: estatus };
  };

  const getResultBadge = (resultado) => {
    if (!resultado) return null;
    const badges = {
      GANADOR: { type: 'success', label: '✓ Ganador' },
      PERDEDOR: { type: 'error', label: '✗ Perdedor' },
      BREAKEVEN: { type: 'warning', label: '= Break Even' },
    };
    return badges[resultado];
  };

  if (loading) {
    return (
      <Card>
        <h3 className="text-lg font-semibold text-white mb-4">Operaciones Recientes</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse h-16 bg-slate-700 rounded"></div>
          ))}
        </div>
      </Card>
    );
  }

  if (recentEntries.length === 0) {
    return (
      <Card>
        <h3 className="text-lg font-semibold text-white mb-4">Operaciones Recientes</h3>
        <div className="text-center py-8">
          <p className="text-slate-400 mb-3">No hay operaciones registradas</p>
          <Button 
            variant="primary" 
            size="sm"
            onClick={() => navigate('/validator')}
          >
            Validar Primera Señal
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Operaciones Recientes</h3>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate('/journal')}
          className="text-[#22D3EE] hover:text-[#06B6D4]"
        >
          Ver todas <ArrowRight size={16} className="ml-1" />
        </Button>
      </div>

      <div className="space-y-3">
        {recentEntries.map((entry) => {
          const isPositive = (entry.pnl_real || 0) >= 0;
          const statusBadge = getStatusBadge(entry.estatus);
          const resultBadge = entry.resultado ? getResultBadge(entry.resultado) : null;

          return (
            <div
              key={entry.id}
              onClick={() => navigate('/journal')}
              className="bg-slate-900/50 rounded-lg p-4 hover:bg-slate-900 transition-colors cursor-pointer border border-slate-800"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {entry.direccion === 'LONG' ? (
                      <TrendingUp className="text-green-500" size={18} />
                    ) : (
                      <TrendingDown className="text-red-500" size={18} />
                    )}
                    <span className="font-bold text-white">{entry.activo || 'N/A'}</span>
                  </div>
                  <Badge type={statusBadge.type}>{statusBadge.label}</Badge>
                  {resultBadge && (
                    <Badge type={resultBadge.type}>{resultBadge.label}</Badge>
                  )}
                </div>
                <div className="text-right">
                  {entry.pnl_real !== null && entry.pnl_real !== undefined && (
                    <p className={`font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                      {formatCurrency(entry.pnl_real)}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Entrada: {formatCurrency(entry.precio_entrada || 0)}</span>
                <span>{formatDate(entry.fecha_apertura)}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs text-slate-500">
          Mostrando últimas {recentEntries.length} operaciones
        </p>
      </div>
    </Card>
  );
}
