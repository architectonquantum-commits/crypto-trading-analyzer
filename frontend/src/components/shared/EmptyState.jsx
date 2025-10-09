export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {Icon && (
        <div className="mb-4 text-slate-500">
          <Icon size={64} />
        </div>
      )}
      <h3 className="text-xl font-semibold text-slate-300 mb-2">{title}</h3>
      {description && <p className="text-slate-400 mb-6 max-w-md">{description}</p>}
      {action}
    </div>
  );
}
