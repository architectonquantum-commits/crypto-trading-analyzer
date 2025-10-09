import { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart
} from 'recharts';
import { Card } from '../shared';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import axios from 'axios';

export default function EquityCurveChart() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('ALL');
  const [showDrawdown, setShowDrawdown] = useState(true);
  const [showBTC, setShowBTC] = useState(true);

  useEffect(() => {
    fetchEquityCurve();
  }, []);

  const fetchEquityCurve = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/validator/backtest/equity-curve?num_trades=1000');
      setData(response.data.data);
    } catch (error) {
      console.error('Error fetching equity curve:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-slate-700 rounded"></div>
        </div>
      </Card>
    );
  }

  if (!data) return null;

  const getFilteredData = () => {
    if (timeRange === 'ALL') return data.equity_curve;
    
    const ranges = { '1M': 30, '3M': 90, '6M': 180, '1Y': 365 };
    const days = ranges[timeRange];
    const cutoffIndex = Math.max(0, data.equity_curve.length - Math.floor(days * data.equity_curve.length / 365));
    return data.equity_curve.slice(cutoffIndex);
  };

  const filteredData = getFilteredData();

  const chartData = filteredData.map((point, index) => {
    const originalIndex = data.equity_curve.indexOf(point);
    return {
      ...point,
      btc_value: data.btc_benchmark[originalIndex]?.btc_value || 0
    };
  });

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    const pointData = payload[0].payload;
    
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 shadow-xl">
        <p className="text-sm text-slate-400 mb-2">{pointData.date}</p>
        <p className="text-sm font-semibold mb-1">Trade #{pointData.trade_number}</p>
        <p className="text-lg font-bold text-green-500 mb-2">
          ${pointData.equity.toLocaleString()}
        </p>
        <div className="space-y-1 text-sm">
          <p className={pointData.pnl >= 0 ? 'text-green-400' : 'text-red-400'}>
            P&L: {pointData.pnl >= 0 ? '+' : ''}{pointData.pnl_pct}%
          </p>
          {showDrawdown && pointData.drawdown > 0 && (
            <p className="text-red-400">
              Drawdown: -{pointData.drawdown_pct.toFixed(2)}%
            </p>
          )}
          {showBTC && (
            <p className="text-slate-400">
              BTC: ${pointData.btc_value?.toLocaleString()}
            </p>
          )}
        </div>
      </div>
    );
  };

  const stats = [
    {
      label: 'Capital Inicial',
      value: `$${data.summary.initial_capital.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-slate-400'
    },
    {
      label: 'Capital Final',
      value: `$${data.summary.final_capital.toLocaleString()}`,
      icon: TrendingUp,
      color: data.summary.total_return >= 0 ? 'text-green-500' : 'text-red-500'
    },
    {
      label: 'Retorno Total',
      value: `${data.summary.total_return >= 0 ? '+' : ''}${data.summary.total_return}%`,
      icon: Activity,
      color: data.summary.total_return >= 0 ? 'text-green-500' : 'text-red-500'
    },
    {
      label: 'Max Drawdown',
      value: `-${data.summary.max_drawdown_pct}%`,
      icon: TrendingDown,
      color: 'text-red-500'
    }
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            📈 Equity Curve
            <span className="text-sm text-slate-400 font-normal">
              ({data.summary.total_trades} operaciones)
            </span>
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Evolución del capital durante 1 año de trading
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-slate-900 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={`${stat.color} w-5 h-5`} />
            </div>
            <p className="text-sm text-slate-400 mb-1">{stat.label}</p>
            <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex gap-2">
          {['1M', '3M', '6M', '1Y', 'ALL'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {range}
            </button>
          ))}
        </div>

        <div className="flex gap-3 ml-auto">
          <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={showDrawdown}
              onChange={(e) => setShowDrawdown(e.target.checked)}
              className="rounded"
            />
            Drawdown
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={showBTC}
              onChange={(e) => setShowBTC(e.target.checked)}
              className="rounded"
            />
            BTC Benchmark
          </label>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis 
            dataKey="date" 
            stroke="#64748b"
            tick={{ fill: '#64748b', fontSize: 12 }}
            tickFormatter={(value) => {
              const date = new Date(value);
              return `${date.getMonth() + 1}/${date.getDate()}`;
            }}
          />
          <YAxis 
            stroke="#64748b"
            tick={{ fill: '#64748b', fontSize: 12 }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />

          {/* Drawdown Area */}
          {showDrawdown && (
            <Area
              type="monotone"
              dataKey="drawdown"
              name="Drawdown"
              stroke="#ef4444"
              fill="#ef4444"
              fillOpacity={0.2}
              strokeWidth={0}
            />
          )}

          {/* BTC Benchmark Line */}
          {showBTC && (
            <Line
              type="monotone"
              dataKey="btc_value"
              name="BTC Buy & Hold"
              stroke="#cbd5e1"
              strokeDasharray="5 5"
              strokeWidth={2}
              dot={false}
            />
          )}

          {/* Equity Line */}
          <Line
            type="monotone"
            dataKey="equity"
            name="Equity"
            stroke="#10b981"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6 }}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Additional Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-700">
        <div>
          <p className="text-sm text-slate-400">Sharpe Ratio</p>
          <p className="text-lg font-bold text-blue-400">{data.summary.sharpe_ratio}</p>
        </div>
        <div>
          <p className="text-sm text-slate-400">Expectancy</p>
          <p className="text-lg font-bold text-purple-400">{data.summary.expectancy}%</p>
        </div>
        <div>
          <p className="text-sm text-slate-400">Recovery Factor</p>
          <p className="text-lg font-bold text-yellow-400">{data.summary.recovery_factor}</p>
        </div>
        <div>
          <p className="text-sm text-slate-400">Profit Factor</p>
          <p className="text-lg font-bold text-green-400">{data.summary.profit_factor}</p>
        </div>
      </div>
    </Card>
  );
}
