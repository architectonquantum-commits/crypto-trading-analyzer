/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // Colores de fondo
    'bg-green-600',
    'bg-red-600',
    'bg-blue-600',
    'bg-slate-900',
    'bg-slate-700',
    'bg-slate-600',
    
    // Rings
    'ring-2',
    'ring-green-400',
    'ring-red-400',
    'ring-blue-400',
    
    // Borders
    'border-2',
    'border-blue-500',
    'border-transparent',
    
    // Text
    'text-white',
    'text-slate-300',
    
    // Shadow
    'shadow-lg',
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0f172a',
        'bg-secondary': '#1e293b',
        'bg-tertiary': '#334155',
        'text-primary': '#f1f5f9',
        'text-secondary': '#cbd5e1',
        'text-muted': '#64748b',
        'accent-green': '#10b981',
        'accent-yellow': '#f59e0b',
        'accent-red': '#ef4444',
        'accent-blue': '#3b82f6',
      }
    },
  },
  plugins: [],
}
