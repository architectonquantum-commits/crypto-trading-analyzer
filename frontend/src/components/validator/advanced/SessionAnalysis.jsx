import Card from '../../shared/Card';
import { Clock, Calendar } from 'lucide-react';

export default function SessionAnalysis({ bestSession, worstSession, bestWeekday, worstWeekday }) {
  
  return (
    <Card>
      <h3 className="text-xl font-bold mb-6">Análisis por Sesiones y Días</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Sesiones */}
        <div className="bg-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="text-blue-500" />
            <h4 className="font-bold text-lg">Sesiones de Trading</h4>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="text-sm text-slate-400 mb-1">Mejor Sesión</div>
              <div className="text-2xl font-bold text-green-500">{bestSession}</div>
            </div>
            
            <div>
              <div className="text-sm text-slate-400 mb-1">Peor Sesión</div>
              <div className="text-2xl font-bold text-red-500">{worstSession}</div>
            </div>
          </div>

          <div className="mt-4 text-xs text-slate-400">
            <div>• Asia: 00:00-09:00 UTC</div>
            <div>• Londres: 08:00-17:00 UTC</div>
            <div>• Nueva York: 13:00-22:00 UTC</div>
          </div>
        </div>

        {/* Días de la Semana */}
        <div className="bg-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="text-purple-500" />
            <h4 className="font-bold text-lg">Días de la Semana</h4>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="text-sm text-slate-400 mb-1">Mejor Día</div>
              <div className="text-2xl font-bold text-green-500">{bestWeekday}</div>
            </div>
            
            <div>
              <div className="text-sm text-slate-400 mb-1">Peor Día</div>
              <div className="text-2xl font-bold text-red-500">{worstWeekday}</div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500 rounded text-sm">
            💡 Considera operar más en los días/sesiones con mejor performance
          </div>
        </div>
      </div>
    </Card>
  );
}
