import React from 'react';
import { AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';

const RealityCheckCard = ({ data }) => {
  if (!data) return null;

  const { grade, confidence_score, is_realistic, red_flags, warnings, suggestions } = data;

  // Determinar color según grade
  const getGradeColor = () => {
    if (grade === 'A' || grade === 'B') return {
      bg: 'bg-green-900/20',
      border: 'border-green-600',
      text: 'text-green-400',
      icon: <CheckCircle className="text-green-400" size={48} />
    };
    if (grade === 'C') return {
      bg: 'bg-yellow-900/20',
      border: 'border-yellow-600',
      text: 'text-yellow-400',
      icon: <AlertTriangle className="text-yellow-400" size={48} />
    };
    return {
      bg: 'bg-red-900/20',
      border: 'border-red-600',
      text: 'text-red-400',
      icon: <XCircle className="text-red-400" size={48} />
    };
  };

  const gradeColors = getGradeColor();

  return (
    <div className="mt-6">
      {/* Header */}
      <div className={`${gradeColors.bg} border-2 ${gradeColors.border} rounded-lg p-6`}>
        <div className="flex items-center gap-4 mb-4">
          {gradeColors.icon}
          <div>
            <h2 className="text-2xl font-bold text-white">Reality Check</h2>
            <p className="text-gray-300">Análisis de Overfitting y Viabilidad</p>
          </div>
        </div>

        {/* Grade y Confidence */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <p className="text-gray-400 text-sm mb-2">Grade</p>
            <p className={`text-5xl font-bold ${gradeColors.text}`}>{grade}</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <p className="text-gray-400 text-sm mb-2">Confianza</p>
            <p className="text-3xl font-bold text-white">{confidence_score.toFixed(1)}%</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <p className="text-gray-400 text-sm mb-2">Realista</p>
            <p className={`text-2xl font-bold ${is_realistic ? 'text-green-400' : 'text-red-400'}`}>
              {is_realistic ? '✓ SÍ' : '✗ NO'}
            </p>
          </div>
        </div>
      </div>

      {/* Red Flags */}
      {red_flags && red_flags.length > 0 && (
        <div className="mt-4 bg-red-900/20 border-2 border-red-600 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <XCircle className="text-red-400" size={24} />
            <h3 className="text-xl font-bold text-red-400">
              🚨 Red Flags Detectados ({red_flags.length})
            </h3>
          </div>
          <div className="space-y-3">
            {red_flags.map((flag, idx) => (
              <div key={idx} className="bg-gray-800 rounded-lg p-4">
                <p className="text-gray-200 leading-relaxed">{flag}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {warnings && warnings.length > 0 && (
        <div className="mt-4 bg-yellow-900/20 border-2 border-yellow-600 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="text-yellow-400" size={24} />
            <h3 className="text-xl font-bold text-yellow-400">
              ⚠️ Advertencias ({warnings.length})
            </h3>
          </div>
          <div className="space-y-3">
            {warnings.map((warning, idx) => (
              <div key={idx} className="bg-gray-800 rounded-lg p-4">
                <p className="text-gray-200 leading-relaxed">{warning}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {suggestions && suggestions.length > 0 && (
        <div className="mt-4 bg-blue-900/20 border-2 border-blue-600 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Info className="text-blue-400" size={24} />
            <h3 className="text-xl font-bold text-blue-400">
              💡 Sugerencias ({suggestions.length})
            </h3>
          </div>
          <div className="space-y-2">
            {suggestions.map((suggestion, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <p className="text-gray-200 leading-relaxed">{suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RealityCheckCard;
