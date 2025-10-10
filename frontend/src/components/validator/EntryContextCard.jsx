import React from 'react';

const EntryContextCard = ({ context, loading }) => {
  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-1/2"></div>
      </div>
    );
  }

  if (!context) return null;

  // Determinar color según confianza
  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'bg-green-500/10 border-green-500';
    if (confidence >= 65) return 'bg-yellow-500/10 border-yellow-500';
    return 'bg-orange-500/10 border-orange-500';
  };

  const getConfidenceText = (confidence) => {
    if (confidence >= 80) return 'text-green-400';
    if (confidence >= 65) return 'text-yellow-400';
    return 'text-orange-400';
  };

  return (
    <div className={`rounded-lg p-4 border-2 ${getConfidenceColor(context.confidence)}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{context.icon}</span>
          <div>
            <h3 className="text-lg font-semibold text-white">
              Contexto de Entrada
            </h3>
            <p className={`text-sm ${getConfidenceText(context.confidence)}`}>
              Confianza: {context.confidence}%
            </p>
          </div>
        </div>
      </div>

      <p className="text-white mb-2 font-medium">
        {context.description}
      </p>

      {context.details && (
        <p className="text-gray-400 text-sm">
          {context.details}
        </p>
      )}

      {/* Indicador visual de confianza */}
      <div className="mt-3">
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              context.confidence >= 80
                ? 'bg-green-500'
                : context.confidence >= 65
                ? 'bg-yellow-500'
                : 'bg-orange-500'
            }`}
            style={{ width: `${context.confidence}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default EntryContextCard;
