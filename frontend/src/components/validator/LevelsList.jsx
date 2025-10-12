import React, { useEffect } from 'react';
import { Eye, EyeOff, Trash2 } from 'lucide-react';
import useLevelsStore from '../../store/levelsStore';

export default function LevelsList({ symbol }) {
  const { levels, loading, toggleLevel, deleteLevel, fetchLevelsBySymbol } = useLevelsStore();

  // Cargar niveles cuando cambia el símbolo
  useEffect(() => {
    if (symbol) {
      fetchLevelsBySymbol(symbol);
    }
  }, [symbol, fetchLevelsBySymbol]);

  if (loading) {
    return (
      <div className="bg-slate-700 rounded-lg p-4">
        <p className="text-slate-400 text-center">Cargando niveles...</p>
      </div>
    );
  }

  if (!symbol) {
    return null;
  }

  if (levels.length === 0) {
    return (
      <div className="bg-slate-700 rounded-lg p-4">
        <p className="text-slate-400 text-center text-sm">
          No hay niveles guardados para {symbol}
        </p>
      </div>
    );
  }

  const getDirectionBadge = (direction) => {
    return direction === 'BULLISH' 
      ? <span className="text-green-400">🟢 BULLISH</span>
      : <span className="text-red-400">🔴 BEARISH</span>;
  };

  const formatZone = (level) => {
    if (level.zone_low) {
      return `$${level.zone_low.toLocaleString()} - $${level.zone_high.toLocaleString()}`;
    }
    return `$${level.zone_high.toLocaleString()}`;
  };

  return (
    <div className="bg-slate-700 rounded-lg p-4 space-y-2">
      <h4 className="font-semibold text-slate-300 mb-3">
        Niveles de {symbol} ({levels.length})
      </h4>
      
      {levels.map((level) => (
        <div
          key={level.id}
          className={`p-3 rounded-lg border transition-all ${
            level.active
              ? 'bg-slate-600 border-slate-500'
              : 'bg-slate-800 border-slate-700 opacity-50'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-white">{level.level_type}</span>
                {getDirectionBadge(level.direction)}
              </div>
              <p className="text-sm text-slate-300">{formatZone(level)}</p>
              {level.notes && (
                <p className="text-xs text-slate-400 mt-1 italic">
                  💬 {level.notes}
                </p>
              )}
            </div>

            <div className="flex gap-2 ml-3">
              <button
                onClick={() => toggleLevel(level.id)}
                className="p-2 hover:bg-slate-500 rounded transition-colors"
                title={level.active ? 'Desactivar' : 'Activar'}
              >
                {level.active ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
              <button
                onClick={() => {
                  if (window.confirm('¿Eliminar este nivel?')) {
                    deleteLevel(level.id);
                  }
                }}
                className="p-2 hover:bg-red-900/50 rounded transition-colors"
                title="Eliminar"
              >
                <Trash2 size={16} className="text-red-400" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
