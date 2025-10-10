import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '../../shared/Card';
import { TrendingUp, AlertTriangle } from 'lucide-react';

export default function MonteCarloChart({ data }) {
  
  // Preparar datos para el histograma
  const chartData = [
    { label: 'P5', value: data.percentile_5, color: '#ef4444' },
    { label: 'P25', value: data.percentile_25, color: '#f59e0b' },
    { label: 'P50', value: data.percentile_50, color: '#10b981' },
    { label: 'P75', value: data.percentile_75, color: '#3b82f6' },
    { label: 'P95', value: data.percentile_95, color: '#8b5cf6' },
  ];

  return (
    <Card>
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <TrendingUp className="text-blue-500" />
        Monte Carlo Simulation ({data.num_simulations.toLocaleString()} iteraciones)
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-700 p-4 rounded">
          <div className="text-sm text-slate-400">Probabilidad de Ganancia</div>
          <div className="text-2xl font-bold text-green-500">
            {data.probability_of_profit.toFixed(1)}%
          </div>
        </div>
        
        <div className="bg-slate-700 p-4 rounded">
          <div className="text-sm text-slate-400">Probabilidad de Ruina</div>
          <div className="text-2xl font-bold text-red-500">
            {data.probability_of_ruin.toFixed(1)}%
          </div>
        </div>
        
        <div className="bg-slate-700 p-4 rounded">
          <div className="text-sm text-slate-400">Media Final</div>
          <div className="text-2xl font-bold">
            ${data.mean_final_equity.toFixed(0)}
          </div>
        </div>
        
        <div className="bg-slate-700 p-4 rounded">
          <div className="text-sm text-slate-400">Desv. Estándar</div>
          <div className="text-2xl font-bold text-slate-300">
            ${data.std_final_equity.toFixed(0)}
          </div>
        </div>
      </div>

      {/* Gráfica de Percentiles */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="label" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
            formatter={(value) => `$${value.toFixed(0)}`}
          />
          <Bar dataKey="value" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>

      {data.probability_of_ruin > 10 && (
        <div className="mt-4 bg-red-900/20 border border-red-500 rounded p-4 flex items-start gap-2">
          <AlertTriangle className="text-red-500 flex-shrink-0 mt-1" size={20} />
          <div>
            <div className="font-bold text-red-500">Alta Probabilidad de Ruina</div>
            <div className="text-sm text-slate-300">
              Considera reducir el riesgo por trade o mejorar la estrategia
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
