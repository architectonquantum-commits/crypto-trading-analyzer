import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import useJournalStore from '../../store/journalStore';

export default function SaveToJournalModalNew({ isOpen, onClose, signalData }) {
  const navigate = useNavigate();
  const { createFromSignal } = useJournalStore();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    estado_emocional: 'Normal',
    sesion: 'Londres',
    razon_estado: '',
    riesgo_diario_permitido: 2.0
  });

  if (!isOpen || !signalData) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Usar journal_entry_data que ya viene con los campos correctos del backend
      const journalData = signalData.journal_entry_data;
      
      await createFromSignal(journalData, {
        estado_emocional: formData.estado_emocional,
        sesion: formData.sesion,
        razon_estado: formData.razon_estado,
        riesgo_diario_permitido: formData.riesgo_diario_permitido,
      });
      
      onClose();
      navigate('/journal');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar: ' + error.message);
      setLoading(false);
    }
  };

  const journalData = signalData.journal_entry_data || {};
  const confluenceScore = signalData.scores?.percentage || 0;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: '#1e293b',
          borderRadius: '8px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #334155',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>
            Guardar en Bitácora
          </h2>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          <div style={{
            backgroundColor: 'rgba(51, 65, 85, 0.5)',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '24px',
            border: '1px solid #475569'
          }}>
            <h4 style={{ fontWeight: '600', marginBottom: '8px', color: 'white' }}>
              Señal a Guardar:
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px' }}>
              <div>
                <span style={{ color: '#94a3b8' }}>Activo: </span>
                <span style={{ fontWeight: 'bold', color: 'white' }}>{journalData.activo}</span>
              </div>
              <div>
                <span style={{ color: '#94a3b8' }}>Tipo: </span>
                <span style={{ 
                  fontWeight: 'bold', 
                  color: journalData.operacion === 'LONG' ? '#4ade80' : '#f87171' 
                }}>
                  {journalData.operacion}
                </span>
              </div>
              <div>
                <span style={{ color: '#94a3b8' }}>Entrada: </span>
                <span style={{ fontWeight: 'bold', color: 'white' }}>${journalData.precio_entrada}</span>
              </div>
              <div>
                <span style={{ color: '#94a3b8' }}>Confluencias: </span>
                <span style={{ fontWeight: 'bold', color: '#4ade80' }}>{confluenceScore}%</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#e2e8f0', marginBottom: '8px' }}>
                ¿Cómo te sientes?
              </label>
              <select
                value={formData.estado_emocional}
                onChange={(e) => setFormData({...formData, estado_emocional: e.target.value})}
                required
                style={{
                  width: '100%',
                  padding: '8px 16px',
                  backgroundColor: '#334155',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px'
                }}
              >
                <option value="Excelente">Excelente</option>
                <option value="Bien">Bien</option>
                <option value="Normal">Normal</option>
                <option value="Cansado">Cansado</option>
                <option value="Estresado">Estresado</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#e2e8f0', marginBottom: '8px' }}>
                Sesión de Trading
              </label>
              <select
                value={formData.sesion}
                onChange={(e) => setFormData({...formData, sesion: e.target.value})}
                style={{
                  width: '100%',
                  padding: '8px 16px',
                  backgroundColor: '#334155',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px'
                }}
              >
                <option value="Asia">Asia</option>
                <option value="Londres">Londres</option>
                <option value="Nueva York">Nueva York</option>
                <option value="Overlap">Overlap</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#e2e8f0', marginBottom: '8px' }}>
                ¿Por qué entras a esta operación? *
              </label>
              <textarea
                value={formData.razon_estado}
                onChange={(e) => setFormData({...formData, razon_estado: e.target.value})}
                required
                minLength={10}
                rows={3}
                placeholder="Ej: Vi confluencia de CHoCH + FVG..."
                style={{
                  width: '100%',
                  padding: '8px 16px',
                  backgroundColor: '#334155',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: '1px solid #334155'
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                color: '#94a3b8',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '8px 24px',
                backgroundColor: '#16a34a',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                opacity: loading ? 0.5 : 1
              }}
            >
              {loading ? 'Guardando...' : 'Guardar Trade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
