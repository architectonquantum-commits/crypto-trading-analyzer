import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Button, Card } from '../shared';
import useJournalStore from '../../store/journalStore';

export default function JournalFilters() {
  const { filters, setFilters, clearFilters, fetchEntries } = useJournalStore();
  
  const [localFilters, setLocalFilters] = useState({
    activo: filters.activo || '',
    estatus: filters.estatus || '',
    resultado: filters.resultado || '',
    fecha_desde: filters.fecha_desde || '',
    fecha_hasta: filters.fecha_hasta || '',
    confluencias: filters.confluencias || '',
  });

  const handleFilterChange = (key, value) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setFilters(localFilters);
    fetchEntries();
  };

  const handleClearFilters = () => {
    const emptyFilters = {
      activo: '',
      estatus: '',
      resultado: '',
      fecha_desde: '',
      fecha_hasta: '',
      confluencias: '',
    };
    setLocalFilters(emptyFilters);
    clearFilters();
  };

  // Obtener lista única de activos
  const { entries } = useJournalStore();
  const uniqueActivos = [...new Set(entries.map(e => 
    e.activo.replace(' LONG', '').replace(' SHORT', '')
  ))];

  return (
    <Card>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Search size={20} />
            Filtros Avanzados
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="flex items-center gap-2"
          >
            <X size={16} />
            Limpiar
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Activo */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Activo
            </label>
            <select
              value={localFilters.activo}
              onChange={(e) => handleFilterChange('activo', e.target.value)}
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-600"
            >
              <option value="">Todos los activos</option>
              {uniqueActivos.map(activo => (
                <option key={activo} value={activo}>{activo}</option>
              ))}
            </select>
          </div>

          {/* Estatus */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Estatus
            </label>
            <select
              value={localFilters.estatus}
              onChange={(e) => handleFilterChange('estatus', e.target.value)}
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-600"
            >
              <option value="">Todos</option>
              <option value="Abierto">🟡 Abierto</option>
              <option value="Cerrado">✅ Cerrado</option>
            </select>
          </div>

          {/* Resultado */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Resultado
            </label>
            <select
              value={localFilters.resultado}
              onChange={(e) => handleFilterChange('resultado', e.target.value)}
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-600"
            >
              <option value="">Todos</option>
              <option value="Ganado">✅ Ganado</option>
              <option value="Perdido">❌ Perdido</option>
              <option value="Break-even">➖ Break-even</option>
            </select>
          </div>

          {/* Fecha Desde */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Desde
            </label>
            <input
              type="date"
              value={localFilters.fecha_desde}
              onChange={(e) => handleFilterChange('fecha_desde', e.target.value)}
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-600"
            />
          </div>

          {/* Fecha Hasta */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Hasta
            </label>
            <input
              type="date"
              value={localFilters.fecha_hasta}
              onChange={(e) => handleFilterChange('fecha_hasta', e.target.value)}
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-600"
            />
          </div>

          {/* Confluencias */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Confluencias
            </label>
            <select
              value={localFilters.confluencias}
              onChange={(e) => handleFilterChange('confluencias', e.target.value)}
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-600"
            >
              <option value="">Todas</option>
              <option value="alta">🟢 Alta (&gt;70%)</option>
              <option value="media">🟡 Media (55-70%)</option>
              <option value="baja">🔴 Baja (&lt;55%)</option>
            </select>
          </div>
        </div>

        {/* Botón Aplicar */}
        <div className="flex justify-end">
          <Button
            variant="primary"
            onClick={applyFilters}
            className="flex items-center gap-2"
          >
            <Search size={18} />
            Aplicar Filtros
          </Button>
        </div>

        {/* Indicador de Filtros Activos */}
        {Object.values(localFilters).some(v => v !== '') && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-700">
            <span className="text-slate-400 text-sm">Filtros activos:</span>
            {localFilters.activo && (
              <span className="bg-blue-900/30 text-blue-400 px-3 py-1 rounded-full text-sm">
                Activo: {localFilters.activo}
              </span>
            )}
            {localFilters.estatus && (
              <span className="bg-yellow-900/30 text-yellow-400 px-3 py-1 rounded-full text-sm">
                Estatus: {localFilters.estatus}
              </span>
            )}
            {localFilters.resultado && (
              <span className="bg-green-900/30 text-green-400 px-3 py-1 rounded-full text-sm">
                Resultado: {localFilters.resultado}
              </span>
            )}
            {localFilters.fecha_desde && (
              <span className="bg-purple-900/30 text-purple-400 px-3 py-1 rounded-full text-sm">
                Desde: {localFilters.fecha_desde}
              </span>
            )}
            {localFilters.fecha_hasta && (
              <span className="bg-purple-900/30 text-purple-400 px-3 py-1 rounded-full text-sm">
                Hasta: {localFilters.fecha_hasta}
              </span>
            )}
            {localFilters.confluencias && (
              <span className="bg-pink-900/30 text-pink-400 px-3 py-1 rounded-full text-sm">
                Confluencias: {localFilters.confluencias === 'alta' ? 'Alta' : localFilters.confluencias === 'media' ? 'Media' : 'Baja'}
              </span>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
