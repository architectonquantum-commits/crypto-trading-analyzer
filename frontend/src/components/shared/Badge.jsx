import clsx from 'clsx';

export default function Badge({ type = 'info', children, className = '' }) {
  const types = {
    success: 'bg-green-600 text-white',
    warning: 'bg-yellow-600 text-white',
    error: 'bg-red-600 text-white',
    info: 'bg-blue-600 text-white',
    neutral: 'bg-slate-600 text-white',
  };
  
  return (
    <span className={clsx('px-2 py-1 rounded text-xs font-bold', types[type], className)}>
      {children}
    </span>
  );
}
