import { NavLink } from 'react-router-dom';
import { Home, FileText, Search, BookOpen } from 'lucide-react';
import clsx from 'clsx';

const links = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/validator', icon: FileText, label: 'Validar' },
  { to: '/scanner', icon: Search, label: 'Scanner' },
  { to: '/journal', icon: BookOpen, label: 'Bitácora' },
];

export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 z-30 safe-area-inset-bottom">
      <div className="flex justify-around">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => clsx(
              'flex flex-col items-center gap-1 py-3 px-4 transition-colors min-w-[70px]',
              isActive ? 'text-blue-400' : 'text-slate-300 hover:text-white'
            )}
          >
            <Icon size={24} strokeWidth={2} />
            <span className="text-xs font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
