import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { journalApi } from '../../services/journalApi';
import Card from '../shared/Card';
import Button from '../shared/Button';
import { toast } from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

export default function NewEntryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const signalData = location.state?.validationResult;
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    estado_emocional: 'Normal',
    sesion: 'Londres',
    razon_estado: '',
    riesgo_diario_permitido: 2.0
  });

  if (!signalData) {
    navigate('/validator');
    return null;
  }

  const journalData = signalData.journal_entry_data || {};
  const confluenceScore = signalData.scores?.percentage || 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.razon_estado.length < 10) {
      toast.error('La razón debe tener al menos 10 caracteres');
      return;
    }

    setLoading(true);
    try {
      await journalApi.createFromSignal(journalData, {
        estado_emocional: formData.estado_emocional,
        sesion: formData.sesion,
        razon_estado: formData.razon_estado,
        riesgo_diario_permitido: parseFloat(formData.riesgo_diario_permitido)
      });
      
      toast.success('✅ Entrada guardada en bitácora');
      navigate('/journal');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2" size={20} />
            Volver
          </Button>
          <h1 className="text-3xl font-bold text-white">
            💾 Nueva Entrada en Bitácora
          </h1>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Info de la señal */}
            <div className="bg-green-900/30 border border-green-600 p-4 rounded-lg">
              <p className="text-lg font-semibold text-green-400">
                {journalData.activo} • {journalData.direccion?.toUpperCase()}
              </p>
              <p className="text-sm text-slate-300 mt-1">
                {confluenceScore}% de confluencias • {journalData.timeframe}
              </p>
              <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                <div>
                  <p className="text-slate-400">Entrada</p>
                  <p className="text-white font-medium">${journalData.precio_entrada}</p>
                </div>
                <div>
                  <p className="text-slate-400">Stop Loss</p>
                  <p className="text-red-400 font-medium">${journalData.stop_loss}</p>
                </div>
                <div>
                  <p className="text-slate-400">Take Profit</p>
                  <p className="text-green-400 font-medium">${journalData.take_profit_1}</p>
                </div>
              </div>
            </div>

            {/* Estado Emocional */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                ¿Cómo te sientes?
              </label>
              <select
                value={formData.estado_emocional}
                onChange={(e) => setFormData({...formData, estado_emocional: e.target.value})}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white"
                required
              >
                <option value="Excelente">😄 Excelente</option>
                <option value="Bien">🙂 Bien</option>
                <option value="Normal">😐 Normal</option>
                <option value="Cansado">😴 Cansado</option>
                <option value="Estresado">😰 Estresado</option>
              </select>
            </div>

            {/* Sesión */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Sesión de Trading
              </label>
              <select
                value={formData.sesion}
                onChange={(e) => setFormData({...formData, sesion: e.target.value})}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white"
                required
              >
                <option value="Asia">🌏 Asia</option>
                <option value="Londres">🇬🇧 Londres</option>
                <option value="Nueva York">🇺🇸 Nueva York</option>
                <option value="Overlap">🔄 Overlap</option>
              </select>
            </div>

            {/* Razón */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                ¿Por qué entras en este trade? (mín. 10 caracteres)
              </label>
              <textarea
                value={formData.razon_estado}
                onChange={(e) => setFormData({...formData, razon_estado: e.target.value})}
                rows={4}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white resize-none"
                placeholder="Ejemplo: CHoCH confirmado con FVG en zona de soporte clave. RSI sobreventa + volumen alto."
                required
              />
              <p className="text-xs text-slate-400 mt-1">
                {formData.razon_estado.length} caracteres
              </p>
            </div>

            {/* Riesgo */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Riesgo Diario Permitido (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="5"
                value={formData.riesgo_diario_permitido}
                onChange={(e) => setFormData({...formData, riesgo_diario_permitido: e.target.value})}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white"
                required
              />
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(-1)}
                className="flex-1"
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="success"
                className="flex-1"
                disabled={loading}
              >
                {loading ? 'Guardando...' : '💾 Guardar en Bitácora'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
