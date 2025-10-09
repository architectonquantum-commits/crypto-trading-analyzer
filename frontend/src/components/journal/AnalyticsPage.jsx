import { useEffect, useState } from 'react';
import { TrendingUp, DollarSign, PieChart as PieChartIcon, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, LoadingSpinner, Button } from '../shared';
import useJournalStore from '../../store/journalStore';
import { formatCurrency } from '../../utils/formatters';

const COLORS = {
  ganado: '#22c55e',
  perdido: '#ef4444',
  breakeven: '#94a3b8'
};

export default function AnalyticsPage() {
  const navigate = useNavigate();
  const { entries, loading, fetchEntries } = useJournalStore();
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  useEffect(() => {
    if (entries.length > 0) {
      calculateAnalytics();
    }
  }, [entries]);

  const calculateAnalytics = () => {
    const closedTrades = entries.filter(e => e.estatus === 'Cerrado');
    
    // 1. Win Rate Over Time
    const winRateData = closedTrades.map((trade, index) => {
      const previousTrades = closedTrades.slice(0, index + 1);
      const wins = previousTrades.filter(t => t.resultado === 'Ganado').length;
      const total = previousTrades.length;
      const winRate = total > 0 ? (wins / total) * 100 : 0;

      return {
        trade: `#${index + 1}`,
        winRate: parseFloat(winRate.toFixed(2)),
        fecha: new Date(trade.fecha_operacion).toLocaleDateString()
      };
    });

    // 2. P&L Acumulado
    let acumulado = 0;
    const plData = closedTrades.map((trade, index) => {
      acumulado += trade.ganancia_perdida_real || 0;
      return {
        trade: `#${index + 1}`,
        pl: parseFloat(acumulado.toFixed(2)),
        fecha: new Date(trade.fecha_operacion).toLocaleDateString()
      };
    });

    // 3. Distribución de Resultados
    const ganados = closedTrades.filter(t => t.resultado === 'Ganado').length;
    const perdidos = closedTrades.filter(t => t.resultado === 'Perdido').length;
    const breakeven = closedTrades.filter(t => t.resultado === 'Break-even').length;

    const distributionData = [
      { name: 'Ganados', value: ganados, color: COLORS.ganado },
      { name: 'Perdidos', value: perdidos, color: COLORS.perdido },
      { name: 'Break-even', value: breakeven, color: COLORS.breakeven }
    ].filter(item => item.value > 0);

    setAnalytics({
      winRateData,
      plData,
      distributionData,
      totalClosed: closedTrades.length
    });
  };

  if (loading || !analytics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
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
              <PieChartIcon className="text-purple-500" size={32} />
              Analytics del Journal
            </h1>
            <p className="text-slate-400 mt-2">
              Análisis detallado de tu rendimiento ({analytics.totalClosed} trades cerrados)
            </p>
          </div>
        </div>
      </div>

      {/* Win Rate Over Time */}
      <Card>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="text-blue-500" size={24} />
            <h2 className="text-xl font-bold text-white">Win Rate Over Time</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.winRateData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="trade" 
                stroke="#94a3b8"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#94a3b8"
                style={{ fontSize: '12px' }}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value) => [`${value}%`, 'Win Rate']}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="winRate" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
                name="Win Rate (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* P&L Acumulado */}
      <Card>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="text-green-500" size={24} />
            <h2 className="text-xl font-bold text-white">P&L Acumulado</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analytics.plData}>
              <defs>
                <linearGradient id="colorPL" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="trade" 
                stroke="#94a3b8"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#94a3b8"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value) => [formatCurrency(value), 'P&L']}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="pl" 
                stroke="#22c55e" 
                fillOpacity={1} 
                fill="url(#colorPL)"
                strokeWidth={2}
                name="P&L Acumulado"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Distribución de Resultados */}
      <Card>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <PieChartIcon className="text-purple-500" size={24} />
            <h2 className="text-xl font-bold text-white">Distribución de Resultados</h2>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {analytics.distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Leyenda Mejorada */}
            <div className="space-y-3">
              {analytics.distributionData.map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: item.color }}
                  />
                  <div>
                    <p className="text-white font-semibold">{item.name}</p>
                    <p className="text-slate-400 text-sm">
                      {item.value} trades ({((item.value / analytics.totalClosed) * 100).toFixed(1)}%)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
