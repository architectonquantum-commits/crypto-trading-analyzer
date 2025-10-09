import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import StatsCards from './StatsCards';
import EquityCurve from './EquityCurve';
import RecentTrades from './RecentTrades';
import ActiveOpportunities from './ActiveOpportunities';
import QuickActions from './QuickActions';
import { TRADING_QUOTES } from '../../utils/constants';

export default function Dashboard() {
  const [quote, setQuote] = useState('');

  useEffect(() => {
    const randomQuote = TRADING_QUOTES[Math.floor(Math.random() * TRADING_QUOTES.length)];
    setQuote(randomQuote);
  }, []);

  return (
    <div className="w-full min-h-screen bg-[#0F172A] overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <Sparkles className="text-[#22D3EE]" size={28} />
          </div>
          
          {quote && (
            <div className="bg-gradient-to-r from-[#22D3EE]/10 to-transparent border-l-4 border-[#22D3EE] rounded-r-lg p-4">
              <p className="text-slate-300 italic text-sm">"{quote}"</p>
            </div>
          )}
        </div>

        <section>
          <h2 className="text-xl font-semibold text-white mb-4">Acciones Rápidas</h2>
          <QuickActions />
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-4">Resumen General</h2>
          <StatsCards />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <EquityCurve />
          </div>
          <div>
            <ActiveOpportunities />
          </div>
        </section>

        <section>
          <RecentTrades />
        </section>

        <div className="text-center py-6 border-t border-slate-800">
          <p className="text-xs text-slate-500">
            Crypto Analyzer v1.0 • Datos actualizados en tiempo real
          </p>
        </div>
      </div>
    </div>
  );
}
