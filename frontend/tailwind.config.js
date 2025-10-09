/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
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
