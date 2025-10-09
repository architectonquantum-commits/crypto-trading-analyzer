import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Clock, Brain, Target, DollarSign, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Card, LoadingSpinner, Badge } from '../shared';
import useJournalStore from '../../store/journalStore';
import { formatCurrency } from '../../utils/formatters';

const COLORS = ['#22c55e', '#3b82f6', '#a855f7', '#f59e0b', '#ef4444'];

export default function PatternAnalysisPage() {
  const navigate = useNavigate();
  const { entries, loading, fetchEntries } = useJournalStore();
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  useEffect(() => {
    if (entries.length > 0) {
      analyzePatterns();
    }
  }, [entries]);

  const analyzePatterns = () => {
    try {
      const closedTrades = entries.filter(e => e.estatus === 'Cerrado');
      const winningTrades = closedTrades.filter(t => t.resultado === 'Ganado');

      // 1. Análisis por Activo
      const activoStats = {};
      closedTrades.forEach(trade => {
        const activo = trade.activo.replace(' LONG', '').replace(' SHORT', '');
        
        if (!activoStats[activo]) {
          activoStats[activo] = {
            total: 0,
            ganados: 0,
            perdidos: 0,
            totalPL: 0,
            trades: []
          };
        }
        
        activoStats[activo].total++;
        activoStats[activo].totalPL += trade.ganancia_perdida_real || 0;
        activoStats[activo].trades.push(trade);
        
        if (trade.resultado === 'Ganado') {
          activoStats[activo].ganados++;
        } else if (trade.resultado === 'Perdido') {
          activoStats[activo].perdidos++;
        }
      });

      const activoData = Object.keys(activoStats).map(activo => {
        const stats = activoStats[activo];
        const winRate = stats.total > 0 ? (stats.ganados / stats.total) * 100 : 0;
        
        return {
          activo,
          total: stats.total,
          ganados: stats.ganados,
          perdidos: stats.perdidos,
          winRate: parseFloat(winRate.toFixed(1)),
          pl: parseFloat(stats.totalPL.toFixed(2)),
          avgPL: stats.total > 0 ? parseFloat((stats.totalPL / stats.total).toFixed(2)) : 0
        };
      }).sort((a, b) => b.pl - a.pl);

      // 2. Análisis por Sesión
      const sesionStats = {};
      closedTrades.forEach(trade => {
        const sesion = trade.sesion || 'Desconocido';
        
        if (!sesionStats[sesion]) {
          sesionStats[sesion] = { total: 0, ganados: 0, totalPL: 0 };
        }
        
        sesionStats[sesion].total++;
        sesionStats[sesion].totalPL += trade.ganancia_perdida_real || 0;
        
        if (trade.resultado === 'Ganado') {
          sesionStats[sesion].ganados++;
        }
      });

      const sesionData = Object.keys(sesionStats).map(sesion => ({
        sesion,
        total: sesionStats[sesion].total,
        ganados: sesionStats[sesion].ganados,
        winRate: sesionStats[sesion].total > 0 
          ? parseFloat(((sesionStats[sesion].ganados / sesionStats[sesion].total) * 100).toFixed(1))
          : 0,
        pl: parseFloat(sesionStats[sesion].totalPL.toFixed(2))
      })).sort((a, b) => b.winRate - a.winRate);

      // 3. Análisis por Estado Emocional
      const estadoStats = {};
      winningTrades.forEach(trade => {
        const estado = trade.estado_emocional;
        estadoStats[estado] = (estadoStats[estado] || 0) + 1;
      });

      const estadoData = Object.keys(estadoStats).map(estado => ({
        estado,
        count: estadoStats[estado],
        percentage: winningTrades.length > 0 
          ? parseFloat(((estadoStats[estado] / winningTrades.length) * 100).toFixed(1))
          : 0
      })).sort((a, b) => b.count - a.count);

      // 4. Análisis por Confluencias
      const confluenciaRanges = {
        'Alta (>70%)': { min: 70, max: 100, total: 0, ganados: 0, pl: 0 },
        'Media (55-70%)': { min: 55, max: 70, total: 0, ganados: 0, pl: 0 },
        'Baja (<55%)': { min: 0, max: 55, total: 0, ganados: 0, pl: 0 }
      };

      closedTrades.forEach(trade => {
        const conf = trade.confluencia_porcentaje;
        let range = null;
        
        if (conf > 70) range = 'Alta (>70%)';
        else if (conf >= 55) range = 'Media (55-70%)';
        else range = 'Baja (<55%)';

        confluenciaRanges[range].total++;
        confluenciaRanges[range].pl += trade.ganancia_perdida_real || 0;
        
        if (trade.resultado === 'Ganado') {
          confluenciaRanges[range].ganados++;
        }
      });

      const confluenciaData = Object.keys(confluenciaRanges).map(range => ({
        range,
        total: confluenciaRanges[range].total,
        ganados: confluenciaRanges[range].ganados,
        winRate: confluenciaRanges[range].total > 0
          ? parseFloat(((confluenciaRanges[range].ganados / confluenciaRanges[range].total) * 100).toFixed(1))
          : 0,
        pl: parseFloat(confluenciaRanges[range].pl.toFixed(2))
      }));

      setAnalysis({
        activoData,
        sesionData,
        estadoData,
        confluenciaData,
        bestActivo: activoData[0] || null,
        bestSesion: sesionData[0] || null,
        bestEstado: estadoData[0] || null
      });
      
    } catch (error) {
      console.error('❌ Error analyzing patterns:', error);
    }
  };

  if (loading || !analysis) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-slate-400">Analizando patrones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/journal')}
            className="text-slate-400 hover:text-white p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Target className="text-purple-500" size={32} />
              Análisis de Patrones Ganadores
            </h1>
            <p className="text-slate-400 mt-2">
              Descubre qué funciona mejor en tu trading
            </p>
          </div>
        </div>
      </div>

      {/* Mejores Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Mejor Activo */}
        {analysis.bestActivo && (
          <Card className="bg-gradient-to-br from-green-900/30 to-green-800/20 border-2 border-green-500">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="text-green-400" size={24} />
                <h3 className="text-lg font-semibold text-white">Mejor Activo</h3>
              </div>
              <p className="text-3xl font-bold text-white mb-2">{analysis.bestActivo.activo}</p>
              <div className="space-y-1 text-sm">
                <p className="text-green-300">Win Rate: {analysis.bestActivo.winRate}%</p>
                <p className="text-green-300">P&L: {formatCurrency(analysis.bestActivo.pl)}</p>
                <p className="text-slate-400">{analysis.bestActivo.total} trades</p>
              </div>
            </div>
          </Card>
        )}

        {/* Mejor Sesión */}
        {analysis.bestSesion && (
          <Card className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border-2 border-blue-500">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="text-blue-400" size={24} />
                <h3 className="text-lg font-semibold text-white">Mejor Sesión</h3>
              </div>
              <p className="text-3xl font-bold text-white mb-2">{analysis.bestSesion.sesion}</p>
              <div className="space-y-1 text-sm">
                <p className="text-blue-300">Win Rate: {analysis.bestSesion.winRate}%</p>
                <p className="text-blue-300">P&L: {formatCurrency(analysis.bestSesion.pl)}</p>
                <p className="text-slate-400">{analysis.bestSesion.total} trades</p>
              </div>
            </div>
          </Card>
        )}

        {/* Mejor Estado Emocional */}
        {analysis.bestEstado && (
          <Card className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border-2 border-purple-500">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Brain className="text-purple-400" size={24} />
                <h3 className="text-lg font-semibold text-white">Mejor Estado</h3>
              </div>
              <p className="text-3xl font-bold text-white mb-2">{analysis.bestEstado.estado}</p>
              <div className="space-y-1 text-sm">
                <p className="text-purple-300">{analysis.bestEstado.percentage}% de wins</p>
                <p className="text-slate-400">{analysis.bestEstado.count} trades ganados</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* 1. Análisis por Activo */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <DollarSign className="text-green-500" size={24} />
            Performance por Activo
          </h2>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analysis.activoData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="activo" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Legend />
              <Bar dataKey="pl" name="P&L Total" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-300">Activo</th>
                  <th className="text-center py-3 px-4 text-slate-300">Trades</th>
                  <th className="text-center py-3 px-4 text-slate-300">Win Rate</th>
                  <th className="text-right py-3 px-4 text-slate-300">P&L Total</th>
                  <th className="text-right py-3 px-4 text-slate-300">P&L Promedio</th>
                </tr>
              </thead>
              <tbody>
                {analysis.activoData.map((item, idx) => (
                  <tr key={item.activo} className="border-b border-slate-800 hover:bg-slate-800/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold">{item.activo}</span>
                        {idx === 0 && <Badge type="success">🏆 Top 1</Badge>}
                      </div>
                    </td>
                    <td className="text-center py-3 px-4 text-slate-300">{item.total}</td>
                    <td className="text-center py-3 px-4">
                      <Badge type={item.winRate >= 60 ? 'success' : item.winRate >= 40 ? 'warning' : 'error'}>
                        {item.winRate}%
                      </Badge>
                    </td>
                    <td className={`text-right py-3 px-4 font-bold ${
                      item.pl >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {item.pl >= 0 ? '+' : ''}{formatCurrency(item.pl)}
                    </td>
                    <td className={`text-right py-3 px-4 ${
                      item.avgPL >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {item.avgPL >= 0 ? '+' : ''}{formatCurrency(item.avgPL)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* 2. Análisis por Sesión de Trading */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <Clock className="text-blue-500" size={24} />
            Performance por Sesión de Trading
          </h2>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analysis.sesionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="sesion" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Legend />
              <Bar dataKey="winRate" name="Win Rate %" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-300">Sesión</th>
                  <th className="text-center py-3 px-4 text-slate-300">Trades</th>
                  <th className="text-center py-3 px-4 text-slate-300">Win Rate</th>
                  <th className="text-right py-3 px-4 text-slate-300">P&L Total</th>
                </tr>
              </thead>
              <tbody>
                {analysis.sesionData.map((item, idx) => (
                  <tr key={item.sesion} className="border-b border-slate-800 hover:bg-slate-800/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold">{item.sesion}</span>
                        {idx === 0 && <Badge type="success">🏆 Mejor</Badge>}
                      </div>
                    </td>
                    <td className="text-center py-3 px-4 text-slate-300">{item.total}</td>
                    <td className="text-center py-3 px-4">
                      <Badge type={item.winRate >= 60 ? 'success' : item.winRate >= 40 ? 'warning' : 'error'}>
                        {item.winRate}%
                      </Badge>
                    </td>
                    <td className={`text-right py-3 px-4 font-bold ${
                      item.pl >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {item.pl >= 0 ? '+' : ''}{formatCurrency(item.pl)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* 3. Análisis por Confluencias */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <Activity className="text-purple-500" size={24} />
            Performance por Nivel de Confluencias
          </h2>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analysis.confluenciaData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="range" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Legend />
              <Bar dataKey="winRate" name="Win Rate %">
                {analysis.confluenciaData.map((entry, index) => {
                  let color = '#94a3b8';
                  if (entry.range.includes('>70')) color = '#22c55e';
                  else if (entry.range.includes('55-70')) color = '#f59e0b';
                  else color = '#ef4444';
                  
                  return <Cell key={`cell-${index}`} fill={color} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-300">Rango</th>
                  <th className="text-center py-3 px-4 text-slate-300">Trades</th>
                  <th className="text-center py-3 px-4 text-slate-300">Win Rate</th>
                  <th className="text-right py-3 px-4 text-slate-300">P&L Total</th>
                </tr>
              </thead>
              <tbody>
                {analysis.confluenciaData.map((item) => (
                  <tr key={item.range} className="border-b border-slate-800 hover:bg-slate-800/50">
                    <td className="py-3 px-4">
                      <span className="text-white font-semibold">{item.range}</span>
                    </td>
                    <td className="text-center py-3 px-4 text-slate-300">{item.total}</td>
                    <td className="text-center py-3 px-4">
                      <Badge type={item.winRate >= 60 ? 'success' : item.winRate >= 40 ? 'warning' : 'error'}>
                        {item.winRate}%
                      </Badge>
                    </td>
                    <td className={`text-right py-3 px-4 font-bold ${
                      item.pl >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {item.pl >= 0 ? '+' : ''}{formatCurrency(item.pl)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* 4. Estados Emocionales en Trades Ganadores */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <Brain className="text-pink-500" size={24} />
            Estados Emocionales más Exitosos
          </h2>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analysis.estadoData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="estado" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Legend />
              <Bar dataKey="count" name="Trades Ganados">
                {analysis.estadoData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analysis.estadoData.map((item, idx) => (
              <Card key={item.estado} className="bg-slate-700/50">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-semibold">{item.estado}</span>
                    {idx === 0 && <Badge type="success">🏆</Badge>}
                  </div>
                  <p className="text-2xl font-bold text-green-400">{item.count} wins</p>
                  <p className="text-sm text-slate-400">{item.percentage}% del total</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
