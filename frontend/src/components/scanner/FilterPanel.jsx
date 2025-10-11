import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import useScannerStore from '../../store/scannerStore';

export default function FilterPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const filters = useScannerStore((state) => state.filters);
  const setFilters = useScannerStore((state) => state.setFilters);
  const clearFilters = useScannerStore((state) => state.clearFilters);

  const handleDirectionChange = (direction) => {
    const newFilter = direction === 'AMBOS' ? null : direction;
    setFilters({
      direction_filter: newFilter
    });
  };

  const handleExchangeChange = (exchange) => {
    const currentExchanges = filters.exchange_filter || [];
    let newExchanges;
    
    if (currentExchanges.includes(exchange)) {
      newExchanges = currentExchanges.filter(e => e !== exchange);
    } else {
      newExchanges = [...currentExchanges, exchange];
    }
    
    setFilters({
      exchange_filter: newExchanges.length === 0 ? null : newExchanges
    });
  };

  const handleConfluenceChange = (e) => {
    setFilters({
      min_confluence: parseFloat(e.target.value)
    });
  };

  const handleTimeframeChange = (tf) => {
    setFilters({
      timeframe: tf
    });
  };

  const hasActiveFilters = 
    filters.direction_filter || 
    (filters.exchange_filter && filters.exchange_filter.length > 0);

  // 🎨 PRE-CALCULAR CLASSNAMES FUERA DEL JSX
  const ambosClass = !filters.direction_filter
    ? 'flex-1 py-2 px-4 rounded-lg font-bold transition-all bg-blue-600 text-white shadow-lg ring-2 ring-blue-400'
    : 'flex-1 py-2 px-4 rounded-lg font-bold transition-all bg-slate-700 text-slate-300 hover:bg-slate-600';
  
  const longClass = filters.direction_filter === 'LONG'
    ? 'flex-1 py-2 px-4 rounded-lg font-bold transition-all bg-green-600 text-white shadow-lg ring-2 ring-green-400'
    : 'flex-1 py-2 px-4 rounded-lg font-bold transition-all bg-slate-700 text-slate-300 hover:bg-slate-600';
  
  const shortClass = filters.direction_filter === 'SHORT'
    ? 'flex-1 py-2 px-4 rounded-lg font-bold transition-all bg-red-600 text-white shadow-lg ring-2 ring-red-400'
    : 'flex-1 py-2 px-4 rounded-lg font-bold transition-all bg-slate-700 text-slate-300 hover:bg-slate-600';

  return (
    <div className="bg-slate-800 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-lg font-semibold hover:text-blue-400 transition-colors"
        >
          <Filter size={20} />
          <span>Filtros Avanzados</span>
          {hasActiveFilters && (
            <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
              Activo
            </span>
          )}
        </button>
        
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-sm text-slate-400 hover:text-red-400 transition-colors"
          >
            <X size={16} />
            Limpiar filtros
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="space-y-6 pt-4 border-t border-slate-700">
          {/* Timeframe */}
          <div>
            <label className="block text-sm font-medium mb-2">
              ⏱️ Timeframe
            </label>
            <div className="flex gap-2">
              {['1h', '4h', '1d'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => handleTimeframeChange(tf)}
                  className="flex-1 py-2 px-4 rounded-lg font-medium transition-all bg-slate-700 text-slate-300 hover:bg-slate-600"
                >
                  {filters.timeframe === tf ? '✓ ' : ''}{tf}
                </button>
              ))}
            </div>
          </div>

          {/* Confluence Slider */}
          <div>
            <label className="block text-sm font-medium mb-2">
              🎯 Confluencia Mínima: <span className="text-blue-400 font-bold">{filters.min_confluence}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={filters.min_confluence}
              onChange={handleConfluenceChange}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${filters.min_confluence}%, #334155 ${filters.min_confluence}%, #334155 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Direction Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">
              📊 Dirección (actual: {filters.direction_filter || 'AMBOS'})
            </label>
            <div className="flex gap-2">
              <button onClick={() => handleDirectionChange('AMBOS')} className="flex-1 py-2 px-4 rounded-lg font-bold transition-all bg-slate-700 text-slate-300 hover:bg-slate-600">
                {!filters.direction_filter ? '✓ ' : ''}↕️ Ambos
              </button>
              <button onClick={() => handleDirectionChange('LONG')} className="flex-1 py-2 px-4 rounded-lg font-bold transition-all bg-slate-700 text-slate-300 hover:bg-slate-600">
                {filters.direction_filter === 'LONG' ? '✓ ' : ''}🟢 Long
              </button>
              <button onClick={() => handleDirectionChange('SHORT')} className="flex-1 py-2 px-4 rounded-lg font-bold transition-all bg-slate-700 text-slate-300 hover:bg-slate-600">
                {filters.direction_filter === 'SHORT' ? '✓ ' : ''}🔴 Short
              </button>
            </div>
          </div>

          {/* Exchange Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">
              🏦 Exchange
            </label>
            <div className="flex gap-2">
              {[
                { value: 'kraken', label: 'Kraken' },
                { value: 'binance', label: 'Binance' }
              ].map((exchange) => {
                const isSelected = filters.exchange_filter?.includes(exchange.value);
                return (
                  <button
                    key={exchange.value}
                    onClick={() => handleExchangeChange(exchange.value)}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                      isSelected
                        ? 'bg-green-600 text-white ring-2 ring-green-400'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {isSelected ? '✓ ' : ''}{exchange.label}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Puedes seleccionar uno o ambos exchanges
            </p>
          </div>
        </div>
      )}

      {!isExpanded && hasActiveFilters && (
        <div className="text-sm text-slate-400 mt-2">
          Filtros activos: {filters.direction_filter || 'Ambos'} • 
          {filters.exchange_filter?.join(', ') || 'Todos'}
        </div>
      )}
    </div>
  );
}
