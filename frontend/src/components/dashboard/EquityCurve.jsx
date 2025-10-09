import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '../shared';
import useJournalStore from '../../store/journalStore';
import { formatCurrency, formatDateShort } from '../../utils/formatters';

export default function EquityCurve() {
  const { entries, fetchEntries } = useJournalStore();
  const [equityData, setEquityData] = useState([]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  useEffect(() => {
    const closedTrades = entries
      .filter(entry => entry.estatus === 'CERRADO')
      .sort((a, b) => new Date(a.fecha_apertura) - new Date(b.fecha_apertura));

    let runningPnL = 0;
    const data = closedTrades.map((entry) => {
      runningPnL += entry.pnl_real || 0;
      return {
        date: formatDateShort(entry.fecha_cierre || entry.fecha_apertura),
        equity: runningPnL,
        trade: `${entry.activo} - ${entry.resultado}`,
      };
    });

    if (data.length > 0) {
      data.unshift({ date: 'Inicio', equity: 0, trade: 'Inicio' });
    }

    setEquityData(data);
  }, [entries]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-lg">
          <p className="text-slate-300 text-sm mb-1">{data.trade}</p>
          <p className="text-white font-bold">{formatCurrency(data.equity)}</p>
        </div>
      );
    }
    return null;
  };

  if (equityData.length === 0) {
    return (
      <Card>
        <h3 className="text-lg font-semibold text-white mb-4">Curva de Equity</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <p className="text-slate-400 mb-2">Sin datos de equity aún</p>
            <p className="text-sm text-slate-500">Cierra tu primer trade para ver la curva</p>
          </div>
        </div>
      </Card>
    );
  }

  const lastEquity = equityData[equityData.length - 1]?.equity || 0;
  const isPositive = lastEquity >= 0;

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Curva de Equity</h3>
        <div className="text-right">
          <p className="text-xs text-slate-400">P&L Acumulado</p>
          <p className={`text-xl font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {formatCurrency(lastEquity)}
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={equityData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis 
            dataKey="date" 
            stroke="#64748b"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#64748b"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `$${value.toFixed(0)}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="equity" 
            stroke={isPositive ? "#10b981" : "#ef4444"}
            strokeWidth={3}
            dot={{ fill: isPositive ? "#10b981" : "#ef4444", r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey={() => 0} 
            stroke="#64748b"
            strokeWidth={1}
            strokeDasharray="5 5"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 text-center">
        <p className="text-xs text-slate-500">
          {equityData.length - 1} trades cerrados • Actualizado en tiempo real
        </p>
      </div>
    </Card>
  );
}
