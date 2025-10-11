import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import FilterPanel from './FilterPanel';
import { Button, LoadingSpinner, Badge } from '../shared';
import useScannerStore from '../../store/scannerStore';
import { formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function ScannerPage() {
  const navigate = useNavigate();
  const { scanResults, loading, progress, filters, runScanner, setFilters, clearFilters } = useScannerStore();
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('confluence');
  const [customSymbols, setCustomSymbols] = useState('');

  const handleRunScanner = async () => {
    try {
      await runScanner();
      toast.success('¡Scanner completado!');
    } catch (error) {
      toast.error('Error al ejecutar scanner');
    }
  };

  const handleScanCustom = async () => {
    if (!customSymbols.trim()) {
      toast.error('Ingresa al menos 1 símbolo');
      return;
    }
    
    // Parsear símbolos: split por coma, trim, uppercase, agregar /USDT
    const symbolsList = customSymbols
      .split(',')
      .map(s => s.trim().toUpperCase())
      .filter(s => s.length > 0)
      .map(s => s.includes('/') ? s : `${s}/USDT`);
    
    // Validar máximo 5
    if (symbolsList.length > 5) {
      toast.error('Máximo 5 monedas permitidas');
      return;
    }
    
    try {
      await runScanner(symbolsList);
      toast.success(`¡Scanner completado! ${symbolsList.length} moneda(s) analizadas`);
    } catch (error) {
      toast.error('Error al ejecutar scanner personalizado');
    }
  };

  const mapRecommendation = (rec) => {
    const map = {
      'BUY': 'OPERAR',
      'STRONG BUY': 'OPERAR',
      'HOLD': 'CONSIDERAR',
      'SELL': 'EVITAR',
      'STRONG SELL': 'EVITAR'
    };
    return map[rec] || rec;
  };

  const validResults = scanResults?.top_opportunities?.filter(
    opp => opp.recommendation !== 'ERROR'
  ) || [];

  const filteredResults = validResults.filter(opp => {
    if (filter === 'all') return true;
    return mapRecommendation(opp.recommendation) === filter;
  });

  const sortedResults = [...filteredResults].sort((a, b) => {
    if (sortBy === 'confluence') {
      return b.confluence_percentage - a.confluence_percentage;
    } else if (sortBy === 'score') {
      return b.total_score - a.total_score;
    }
    return 0;
  });

  const counts = {
    all: validResults.length,
    OPERAR: validResults.filter(o => mapRecommendation(o.recommendation) === 'OPERAR').length,
    CONSIDERAR: validResults.filter(o => mapRecommendation(o.recommendation) === 'CONSIDERAR').length,
  };

  const handleRowClick = (opportunity) => {
    navigate('/validator', {
      state: {
        fromScanner: true,
        prefilledData: {
          activo: opportunity.symbol,
          direccion: opportunity.direction || 'LONG',
          precio_entrada: opportunity.current_price,
          stop_loss: opportunity.suggested_stop_loss || '',
          take_profit: opportunity.suggested_take_profit || '',
        }
      }
    });
    
    toast.success(`📊 Datos del scanner cargados`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        {/* Progress Circle */}
        <div className="relative w-32 h-32">
          <svg className="transform -rotate-90 w-32 h-32">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-slate-700"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 56}
              strokeDashoffset={2 * Math.PI * 56 * (1 - progress / 100)}
              className="text-blue-500 transition-all duration-500"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold text-white">{Math.round(progress)}%</span>
          </div>
        </div>
        <div className="mt-6 text-center">
          <p className="text-lg font-semibold text-white">Analizando criptomonedas...</p>
          <p className="text-sm text-slate-400 mt-2">Esto puede tomar 10-90 segundos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Search className="text-blue-500" size={32} />
            Scanner de 23 Criptos
          </h1>
          <p className="text-slate-400 mt-2">
            Escanea el mercado y encuentra las mejores oportunidades
          </p>
        </div>
        <div className="text-right">
          {scanResults?.timestamp && (
            <p className="text-sm text-slate-400">
              Última actualización:<br />
              <span className="text-white">{new Date(scanResults.timestamp).toLocaleString()}</span>
            </p>
          )}
        </div>
      </div>

      {/* Filtros Avanzados */}
      <FilterPanel />

      {/* Scanner Personalizado */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-3">🎯 Escaneo Personalizado</h3>
        <p className="text-sm text-slate-400 mb-4">
          Analiza hasta 5 monedas específicas (ej: BTC, ETH, XRP, ADA, SOL)
        </p>
        <div className="flex gap-3">
          <input
            type="text"
            value={customSymbols}
            onChange={(e) => setCustomSymbols(e.target.value)}
            placeholder="BTC, ETH, XRP, ADA, SOL"
            className="flex-1 bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
            disabled={loading}
          />
          <Button
            variant="secondary"
            onClick={handleScanCustom}
            disabled={loading || !customSymbols.trim()}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <Search size={20} />
            Escanear Seleccionadas
          </Button>
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 h-px bg-slate-700"></div>
        <span className="text-slate-500 text-sm">o escanea todas</span>
        <div className="flex-1 h-px bg-slate-700"></div>
      </div>

      <div className="flex justify-center">
        <Button
          variant="primary"
          size="lg"
          onClick={handleRunScanner}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw size={20} />
          Ejecutar Scanner
        </Button>
      </div>

      {scanResults && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800 rounded-lg p-4">
            <p className="text-slate-400 text-sm">Total Escaneadas</p>
            <p className="text-2xl font-bold text-white">{scanResults.total_scanned}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4">
            <p className="text-slate-400 text-sm">Oportunidades</p>
            <p className="text-2xl font-bold text-green-400">{counts.OPERAR}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4">
            <p className="text-slate-400 text-sm">Timeframe</p>
            <p className="text-2xl font-bold text-white">{scanResults.timeframe}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4">
            <p className="text-slate-400 text-sm">Filtro Mínimo</p>
            <p className="text-2xl font-bold text-white">{scanResults.min_confluence_filter}%</p>
          </div>
        </div>
      )}

      {validResults.length > 0 && (
        <div className="flex flex-wrap items-center gap-4 bg-slate-800 rounded-lg p-4">
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              Todas ({counts.all})
            </Button>
            <Button
              variant={filter === 'OPERAR' ? 'success' : 'ghost'}
              size="sm"
              onClick={() => setFilter('OPERAR')}
            >
              OPERAR ({counts.OPERAR})
            </Button>
            <Button
              variant={filter === 'CONSIDERAR' ? 'ghost' : 'ghost'}
              size="sm"
              onClick={() => setFilter('CONSIDERAR')}
            >
              CONSIDERAR ({counts.CONSIDERAR})
            </Button>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-slate-400">Ordenar por:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-700 text-white rounded px-3 py-1 text-sm"
            >
              <option value="confluence">Confluencias</option>
              <option value="score">Score</option>
            </select>
          </div>
        </div>
      )}

      {sortedResults.length > 0 ? (
        <div className="bg-slate-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">#</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Criptomoneda</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Precio</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Confluencias</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Score</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Recomendación</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Exchange</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {sortedResults.map((opp, index) => {
                  const recommendation = mapRecommendation(opp.recommendation);
                  const isOperar = recommendation === 'OPERAR';
                  const confluenceColor = opp.confluence_percentage >= 70 ? 'bg-green-500' : 
                                         opp.confluence_percentage >= 55 ? 'bg-yellow-500' : 
                                         'bg-red-500';

                  return (
                    <tr 
                      key={opp.symbol} 
                      className="hover:bg-slate-700 transition-colors cursor-pointer"
                      onClick={() => handleRowClick(opp)}
                      title="Click para validar señal con SL/TP automático"
                    >
                      <td className="px-4 py-3 text-slate-400">{index + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {isOperar ? 
                            <TrendingUp className="text-green-400" size={20} /> : 
                            <TrendingDown className="text-yellow-400" size={20} />
                          }
                          <span className="font-semibold text-white">{opp.symbol}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white font-mono">
                        {formatCurrency(opp.current_price)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-semibold">{opp.confluence_percentage}%</span>
                          </div>
                          <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${confluenceColor} transition-all`}
                              style={{ width: `${opp.confluence_percentage}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white">{opp.total_score}/25</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          opp.direction === 'LONG' ? 'bg-green-600 text-white' : 
                          opp.direction === 'SHORT' ? 'bg-red-600 text-white' : 
                          'bg-gray-600 text-white'
                        }`}>
                          {opp.direction === 'LONG' ? '🟢 LONG' : 
                           opp.direction === 'SHORT' ? '🔴 SHORT' : 
                           '⚪ N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge type={isOperar ? 'success' : 'warning'}>
                          {recommendation}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-400 capitalize">{opp.exchange}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : scanResults ? (
        <div className="text-center py-12 bg-slate-800 rounded-lg">
          <p className="text-slate-400">No se encontraron oportunidades</p>
        </div>
      ) : (
        <div className="text-center py-12 bg-slate-800 rounded-lg">
          <Search className="mx-auto text-slate-600 mb-4" size={48} />
          <p className="text-slate-400">Haz clic en "Ejecutar Scanner" para comenzar</p>
        </div>
      )}
    </div>
  );
}
