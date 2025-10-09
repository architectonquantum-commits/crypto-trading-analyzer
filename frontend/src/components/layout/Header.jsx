import { Menu } from 'lucide-react';

export default function Header({ onMenuToggle }) {
  return (
    <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={onMenuToggle}
            className="md:hidden text-slate-100 hover:text-white transition-colors"
            aria-label="Abrir menú"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-2xl font-bold text-white">🤖 Crypto Analyzer</h1>
        </div>
        
        <div className="hidden md:flex items-center gap-3">
          <span className="text-sm text-slate-300">Backend conectado</span>
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
        </div>
      </div>
    </header>
  );
}
