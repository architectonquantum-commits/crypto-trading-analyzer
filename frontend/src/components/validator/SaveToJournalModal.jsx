import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { journalApi } from '../../services/journalApi';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import { toast } from 'react-hot-toast';

export default function SaveToJournalModal({ isOpen, onClose, validationResult }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    estado_emocional: 'Normal',
    sesion: 'Londres',
    razon_estado: '',
    riesgo_diario_permitido: 2.0
  });

  if (!isOpen || !validationResult) return null;

  const journalData = validationResult.journal_entry_data || {};
  const confluenceScore = validationResult.scores?.percentage || 0;

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
      onClose();
      navigate('/journal');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="💾 Guardar en Bitácora">
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div className="bg-green-900/30 border border-green-600 p-3 rounded-lg">
          <p className="text-sm font-semibold text-green-400">
            {journalData.activo} • {journalData.direccion?.toUpperCase()} • {confluenceScore}%
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            ¿Cómo te sientes?
          </label>
          <select
            value={formData.estado_emocional}
            onChange={(e) => setFormData({...formData, estado_emocional: e.target.value})}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
            required
          >
            <option value="Excelente">😄 Excelente</option>
            <option value="Bien">🙂 Bien</option>
            <option value="Normal">😐 Normal</option>
            <option value="Cansado">😴 Cansado</option>
            <option value="Estresado">😰 Estresado</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Sesión de Trading
          </label>
          <select
            value={formData.sesion}
            onChange={(e) => setFormData({...formData, sesion: e.target.value})}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
            required
          >
            <option value="Asia">🌏 Asia</option>
            <option value="Londres">🇬🇧 Londres</option>
            <option value="Nueva York">🇺🇸 Nueva York</option>
            <option value="Overlap">🔄 Overlap</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            ¿Por qué entras? (mín. 10 caracteres)
          </label>
          <textarea
            value={formData.razon_estado}
            onChange={(e) => setFormData({...formData, razon_estado: e.target.value})}
            rows={3}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white resize-none"
            placeholder="Ejemplo: CHoCH + FVG en soporte clave"
            required
          />
          <p className="text-xs text-slate-400 mt-1">
            {formData.razon_estado.length} caracteres
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Riesgo Diario (%)
          </label>
          <input
            type="number"
            step="0.1"
            min="0.5"
            max="5"
            value={formData.riesgo_diario_permitido}
            onChange={(e) => setFormData({...formData, riesgo_diario_permitido: e.target.value})}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
            required
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
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
            loading={loading}
          >
            💾 Guardar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
