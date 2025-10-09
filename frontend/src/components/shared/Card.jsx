import clsx from 'clsx';

export default function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div 
      className={clsx(
        'bg-slate-800 rounded-lg p-6 shadow-lg',
        hover && 'hover:bg-slate-700 transition-colors cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
