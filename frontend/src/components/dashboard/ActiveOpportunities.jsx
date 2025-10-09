import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, AlertCircle, ArrowRight } from 'lucide-react';
import { Card, Badge, Button } from '../shared';
import useScannerStore from '../../store/scannerStore';

export default function ActiveOpportunities() {
  const navigate = useNavigate();
  const { scanResults, getStatus, loading } = useScannerStore();

  useEffect(() => {
    getStatus();
  }, [getStatus]);

  // FIX: Asegurar que scanResults sea un array
  const results = Array.isArray(scanResults) ? scanResults : [];

  const opportunities = results
    .filter(result => 
      result.recomendacion === 'OPERAR' || 
      (result.recomendacion === 'CONSIDERAR' && result.confluencias >= 70)
    )
    .sort((a, b) => b.confluencias - a.confluencias)
    .slice(0, 5);

  const getRecommendationBadge = (recommendation, confluences) => {
    if (recommendation === 'OPERAR') {
      return { type: 'success', label: `✓ OPERAR (${confluences}%)` };
    }
    return { type: 'warning', label: `! CONSIDERAR (${confluences}%)` };
  };

  if (loading) {
    return (
      <Card>
        <h3 className="text-lg font-semibold text-white mb-4">Oportunidades Activas</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse h-20 bg-slate-700 rounded"></div>
          ))}
        </div>
      </Card>
    );
  }

  if (opportunities.length === 0) {
    return (
      <Card>
        <h3 className="text-lg font-semibold text-white mb-4">Oportunidades Activas</h3>
        <div className="text-center py-8">
          <AlertCircle className="mx-auto mb-3 text-slate-500" size={48} />
          <p className="text-slate-400 mb-3">Sin oportunidades detectadas</p>
          <p className="text-sm text-slate-500 mb-4">
            Ejecuta el scanner para encontrar oportunidades
          </p>
          <Button 
            variant="primary" 
            size="sm"
            onClick={() => navigate('/scanner')}
          >
            Ir al Scanner
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Oportunidades Activas</h3>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate('/scanner')}
          className="text-[#22D3EE] hover:text-[#06B6D4]"
        >
          Ver todas <ArrowRight size={16} className="ml-1" />
        </Button>
      </div>

      <div className="space-y-3">
        {opportunities.map((opp, index) => {
          const badge = getRecommendationBadge(opp.recomendacion, opp.confluencias);
          
          return (
            <div
              key={`${opp.symbol}-${index}`}
              onClick={() => navigate('/scanner')}
              className="bg-slate-900/50 rounded-lg p-4 hover:bg-slate-900 transition-colors cursor-pointer border border-slate-800"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <TrendingUp className="text-[#22D3EE]" size={20} />
                  <span className="font-bold text-white text-lg">{opp.symbol}</span>
                  <Badge type={badge.type}>{badge.label}</Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400">Precio</p>
                  <p className="font-bold text-white">
                    ${opp.precio_actual?.toFixed(4) || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="mb-2">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>Confluencias</span>
                  <span className="font-bold">{opp.confluencias}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      opp.confluencias >= 85 ? 'bg-green-500' :
                      opp.confluencias >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${opp.confluencias}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-slate-500">Técnico</p>
                  <p className="text-white font-medium">{opp.scores?.tecnico || 0}/25</p>
                </div>
                <div>
                  <p className="text-slate-500">Riesgo</p>
                  <p className="text-white font-medium">{opp.scores?.riesgo || 0}/25</p>
                </div>
                <div>
                  <p className="text-slate-500">Structure</p>
                  <p className="text-white font-medium">{opp.scores?.estructura || 0}/25</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs text-slate-500">
          {opportunities.length} oportunidades de alta calidad
        </p>
      </div>
    </Card>
  );
}
