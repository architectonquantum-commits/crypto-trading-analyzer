#!/bin/bash
echo "🚀 INICIANDO FASE 2: ROUTING Y ESTADO..."
echo ""
echo "📝 1/9 Creando App.jsx con React Router..."
cat > src/App.jsx << 'APPEOF'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './components/dashboard/Dashboard';
import ValidatorPage from './components/validator/ValidatorPage';
import ScannerPage from './components/scanner/ScannerPage';
import JournalPage from './components/journal/JournalPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="validator" element={<ValidatorPage />} />
          <Route path="scanner" element={<ScannerPage />} />
          <Route path="journal" element={<JournalPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
APPEOF

echo "📝 2/9 Creando Layout.jsx..."
cat > src/components/layout/Layout.jsx << 'LAYOUTEOF'
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <h1 className="text-2xl font-bold">🤖 Crypto Analyzer</h1>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>

      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #334155',
          },
        }}
      />
    </div>
  );
}
LAYOUTEOF

echo "📝 3/9 Creando páginas placeholder..."
cat > src/components/dashboard/Dashboard.jsx << 'DASHEOF'
export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <span className="text-sm text-slate-400">FASE 2 Completada ✅</span>
      </div>
      
      <div className="bg-slate-800 rounded-lg p-6">
        <p className="text-slate-300">
          Página principal - Se implementará en FASE 3
        </p>
      </div>
    </div>
  );
}
DASHEOF

cat > src/components/validator/ValidatorPage.jsx << 'VALEOF'
export default function ValidatorPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Validador de Señales</h1>
      
      <div className="bg-slate-800 rounded-lg p-6">
        <p className="text-slate-300">
          Validador - Se implementará en FASE 3
        </p>
      </div>
    </div>
  );
}
VALEOF

cat > src/components/scanner/ScannerPage.jsx << 'SCANEOF'
export default function ScannerPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Scanner de 23 Criptos</h1>
      
      <div className="bg-slate-800 rounded-lg p-6">
        <p className="text-slate-300">
          Scanner - Se implementará en FASE 3
        </p>
      </div>
    </div>
  );
}
SCANEOF

cat > src/components/journal/JournalPage.jsx << 'JOUREOF'
export default function JournalPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">📓 Bitácora de Trading</h1>
      
      <div className="bg-slate-800 rounded-lg p-6">
        <p className="text-slate-300">
          Bitácora - Se implementará en FASE 3
        </p>
      </div>
    </div>
  );
}
JOUREOF

echo "Continuando con servicios y stores..."
