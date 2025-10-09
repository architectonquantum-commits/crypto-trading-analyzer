import { NavLink } from 'react-router-dom';
import { Home, FileText, Search, BookOpen, X } from 'lucide-react';

const links = [
  { to: '/', icon: Home, label: 'Dashboard' },
  { to: '/validator', icon: FileText, label: 'Validador' },
  { to: '/scanner', icon: Search, label: 'Scanner' },
  { to: '/journal', icon: BookOpen, label: 'Bitácora' },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      <aside style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        width: '288px',
        backgroundColor: '#1e293b',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s',
      }}
      className="md:sticky md:translate-x-0"
      >
        <div className="md:hidden flex items-center justify-between px-6 py-5 border-b border-slate-700">
          <h2 style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: 'bold' }}>MENÚ</h2>
          <button onClick={onClose} style={{ color: '#FFFFFF' }}>
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px 20px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                color: '#FFFFFF',
                backgroundColor: isActive ? '#22d3ee' : 'transparent',
                textDecoration: 'none',
              })}
              className="hover:bg-slate-700"
            >
              <Icon size={22} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-6 py-5 border-t border-slate-700">
          <p style={{ color: '#FFFFFF', fontSize: '12px', fontWeight: '500' }}>Crypto Analyzer</p>
          <p style={{ color: '#9ca3af', fontSize: '12px', marginTop: '4px' }}>v1.0.0</p>
        </div>
      </aside>
    </>
  );
}
