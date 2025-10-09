import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle, TrendingUp, TrendingDown, Save } from 'lucide-react';
import { Card, Button, Badge } from '../shared';
import { formatPercent, formatCurrency } from '../../utils/formatters';
import SaveToJournalModal from './SaveToJournalModal';

export default function ValidationResult({ result, onSaveToJournal }) {
  const recommendation = result.validation?.recommendation || 'SIN RECOMENDACIÓN';
  const confluenceScore = result.scores?.percentage || 0;
  const detailedAnalysis = result.detailed_analysis || {};
  const signalInput = result.signal_input || {};

  const getRecommendationConfig = () => {
    if (recommendation.includes('OPERAR')) {
      return {
        icon: CheckCircle,
        color: 'text-green-400',
        bgColor: 'bg-green-900/30',
        borderColor: 'border-green-600',
        label: '✅ ' + recommendation,
      };
    }
    if (recommendation.includes('CONSIDERAR')) {
      return {
        icon: AlertTriangle,
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-900/30',
        borderColor: 'border-yellow-600',
        label: '⚠️ ' + recommendation,
      };
    }
    if (recommendation.includes('EVITAR')) {
      return {
        icon: XCircle,
        color: 'text-red-400',
        bgColor: 'bg-red-900/30',
        borderColor: 'border-red-600',
        label: '🚫 ' + recommendation,
      };
    }
    return {
      icon: AlertTriangle,
      color: 'text-slate-400',
      bgColor: 'bg-slate-800',
      borderColor: 'border-slate-600',
      label: recommendation,
    };
  };

  const config = getRecommendationConfig();
  const Icon = config.icon;

  const getTakeProfit = () => {
    const riskAnalysis = detailedAnalysis.risk || detailedAnalysis.riesgo;
    if (riskAnalysis?.risk_reward?.take_profits && riskAnalysis.risk_reward.take_profits.length > 0) {
      const bestTp = riskAnalysis.risk_reward.take_profits[riskAnalysis.risk_reward.take_profits.length - 1];
      return bestTp.price;
    }
    return signalInput.take_profit_1 || signalInput.take_profit_2 || signalInput.take_profit_3 || null;
  };

  const calculateRealRR = () => {
    const riskAnalysis = detailedAnalysis.risk || detailedAnalysis.riesgo;
    if (riskAnalysis?.risk_reward?.best_rr_ratio) {
      return riskAnalysis.risk_reward.best_rr_ratio;
    }
    
    const entry = signalInput.entry_price;
    const sl = signalInput.stop_loss;
    const tp = getTakeProfit();
    
    if (!entry || !sl || !tp) return null;
    
    const risk = Math.abs(entry - sl);
    const reward = Math.abs(tp - entry);
    
    if (risk === 0) return null;
    
    return (reward / risk).toFixed(2);
  };

  const takeProfit = getTakeProfit();
  const rrRatio = calculateRealRR();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Card className={`${config.bgColor} border-2 ${config.borderColor}`}>
        <div className="text-center py-8">
          <Icon className={`${config.color} w-20 h-20 mx-auto mb-4`} />
          <h2 className={`text-4xl font-bold ${config.color} mb-2`}>
            {config.label}
          </h2>
          <p className="text-slate-300 text-lg mb-4">
            Score de Confluencias: <span className="font-bold">{formatPercent(confluenceScore, 0)}</span>
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Badge type={signalInput.direction === 'LONG' ? 'success' : 'error'} className="text-lg px-4 py-2">
              {signalInput.direction === 'LONG' ? (
                <span className="flex items-center gap-2">
                  <TrendingUp size={20} /> LONG
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <TrendingDown size={20} /> SHORT
                </span>
              )}
            </Badge>
            <Badge type="info" className="text-lg px-4 py-2">
              {signalInput.symbol}
            </Badge>
            <Badge type="neutral" className="text-lg px-4 py-2">
              {signalInput.timeframe}
            </Badge>
          </div>
        </div>
      </Card>

      {(result.validation?.reasons || result.validation?.warnings) && (
        <Card>
          <div className="space-y-4">
            {result.validation.reasons && result.validation.reasons.length > 0 && (
              <div>
                <h4 className="font-bold text-green-400 mb-2">✅ Razones a Favor:</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  {result.validation.reasons.map((reason, idx) => (
                    <li key={idx}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}
            {result.validation.warnings && result.validation.warnings.length > 0 && (
              <div>
                <h4 className="font-bold text-yellow-400 mb-2">⚠️ Advertencias:</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  {result.validation.warnings.map((warning, idx) => (
                    <li key={idx}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      )}

      <Card>
        <h3 className="text-xl font-bold mb-4">📊 Análisis por Módulos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(detailedAnalysis).map(([moduleName, moduleData]) => (
            <ModuleCard key={moduleName} name={moduleName} data={moduleData} score={result.scores?.[moduleName] || 0} />
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="text-xl font-bold mb-4">📝 Detalles de la Señal</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-slate-400 text-sm">Precio Entrada</p>
            <p className="text-xl font-bold">{formatCurrency(signalInput.entry_price)}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Stop Loss</p>
            <p className="text-xl font-bold text-red-400">{formatCurrency(signalInput.stop_loss)}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Take Profit</p>
            <p className="text-xl font-bold text-green-400">
              {takeProfit ? formatCurrency(takeProfit) : '--'}
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">RR Ratio</p>
            <p className={`text-xl font-bold ${
              rrRatio && parseFloat(rrRatio) >= 2 ? 'text-green-400' : 
              rrRatio && parseFloat(rrRatio) >= 1.5 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {rrRatio ? `1:${rrRatio}` : '--'}
            </p>
          </div>
        </div>
      </Card>

      {result.validation?.should_trade && (
        <div className="flex justify-center">
          <Button
            variant="success"
            size="lg"
            onClick={onSaveToJournal}
            className="text-lg px-8"
          >
            <Save className="mr-2" size={24} />
            Guardar en Bitácora
          </Button>
        </div>
      )}
    </motion.div>
  );
}

function ModuleCard({ name, data, score }) {
  const getModuleIcon = (name) => {
    const icons = {
      technical: '📈',
      tecnico: '📈',
      risk: '🎯',
      riesgo: '🎯',
      structure: '🏗️',
      estructura: '🏗️',
      macro: '⚡',
      sentiment: '😊',
      sentimiento: '😊',
    };
    return icons[name] || '📊';
  };

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-green-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const percentage = data.confidence_percentage || (score / 5) * 100;

  return (
    <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getModuleIcon(name)}</span>
          <h4 className="font-semibold capitalize">{name}</h4>
        </div>
        <span className={`text-2xl font-bold ${getScoreColor(percentage)}`}>
          {Math.round(percentage)}%
        </span>
      </div>
      
      <div className="w-full bg-slate-600 rounded-full h-2 mb-3">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${
            percentage >= 70 ? 'bg-green-500' :
            percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="text-sm text-slate-300 mb-2">
        {data.summary}
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-400">Puntuación:</span>
        <Badge type={percentage >= 70 ? 'success' : percentage >= 50 ? 'warning' : 'error'}>
          {score}/5
        </Badge>
      </div>
    </div>
  );
}
