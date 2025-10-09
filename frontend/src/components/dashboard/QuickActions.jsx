import { useNavigate } from 'react-router-dom';
import { FileText, Search, BookOpen, Plus } from 'lucide-react';

export default function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      icon: FileText,
      title: 'Validar Señal',
      description: 'Analizar nueva oportunidad',
      color: 'cyan',
      onClick: () => navigate('/validator'),
    },
    {
      icon: Search,
      title: 'Escanear Mercado',
      description: '23 criptomonedas',
      color: 'purple',
      onClick: () => navigate('/scanner'),
    },
    {
      icon: BookOpen,
      title: 'Ver Bitácora',
      description: 'Todas las operaciones',
      color: 'green',
      onClick: () => navigate('/journal'),
    },
    {
      icon: Plus,
      title: 'Entrada Manual',
      description: 'Registrar trade manual',
      color: 'yellow',
      onClick: () => navigate('/journal'),
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      cyan: 'bg-[#22D3EE]/10 hover:bg-[#22D3EE]/20 text-[#22D3EE]',
      purple: 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-400',
      green: 'bg-green-500/10 hover:bg-green-500/20 text-green-400',
      yellow: 'bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400',
    };
    return colors[color] || colors.cyan;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action) => (
        <button
          key={action.title}
          onClick={action.onClick}
          className={`${getColorClasses(action.color)} rounded-xl p-5 text-left transition-all duration-200 hover:scale-105 active:scale-95 border border-slate-800`}
        >
          <action.icon size={32} strokeWidth={2} className="mb-3" />
          <h4 className="font-bold text-white mb-1">{action.title}</h4>
          <p className="text-xs text-slate-400">{action.description}</p>
        </button>
      ))}
    </div>
  );
}
