import { useState } from 'react';
import { Plus, Target } from 'lucide-react';
import { Button, Input, Select } from '../shared';
import useLevelsStore from '../../store/levelsStore';

export default function LevelsInput({ symbol }) {
  const { createLevel } = useLevelsStore();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    level_type: 'FVG',
    direction: 'BULLISH',
    zone_high: '',
    zone_low: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!symbol) {
      toast.error('Selecciona un símbolo primero');
      return;
    }

    setLoading(true);
    try {
      await createLevel({
        symbol,
        level_type: formData.level_type,
        direction: formData.direction,
        zone_high: parseFloat(formData.zone_high),
        zone_low: formData.zone_low ? parseFloat(formData.zone_low) : null,
        notes: formData.notes || null
      });

      // Reset form
      setFormData({
        level_type: 'FVG',
        direction: 'BULLISH',
        zone_high: '',
        zone_low: '',
        notes: ''
      });
      setShowForm(false);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const needsZoneLow = formData.level_type === 'FVG';

  return (
    <div className="bg-slate-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-200 flex items-center gap-2">
          <Target size={20} className="text-blue-400" />
          Mis Niveles Clave
        </h3>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={16} className="mr-1" />
          {showForm ? 'Cancelar' : 'Agregar Nivel'}
        </Button>
      </div>

      {!symbol && (
        <p className="text-sm text-slate-400 text-center py-2">
          Selecciona un símbolo primero para agregar niveles
        </p>
      )}

      {showForm && symbol && (
        <form onSubmit={handleSubmit} className="space-y-3 mt-4 pt-4 border-t border-slate-600">
          <Select
            label="Tipo de Nivel"
            value={formData.level_type}
            onChange={(e) => setFormData({ ...formData, level_type: e.target.value })}
          >
            <option value="FVG">FVG (Fair Value Gap)</option>
            <option value="Order Block">Order Block</option>
            <option value="Soporte">Soporte</option>
            <option value="Resistencia">Resistencia</option>
          </Select>

          <Select
            label="Dirección"
            value={formData.direction}
            onChange={(e) => setFormData({ ...formData, direction: e.target.value })}
          >
            <option value="BULLISH">🟢 BULLISH (alcista)</option>
            <option value="BEARISH">🔴 BEARISH (bajista)</option>
          </Select>

          <Input
            label={needsZoneLow ? "Zona Alta" : "Precio"}
            type="number"
            step="0.01"
            value={formData.zone_high}
            onChange={(e) => setFormData({ ...formData, zone_high: e.target.value })}
            required
            placeholder="Ej: 40500"
          />

          {needsZoneLow && (
            <Input
              label="Zona Baja"
              type="number"
              step="0.01"
              value={formData.zone_low}
              onChange={(e) => setFormData({ ...formData, zone_low: e.target.value })}
              placeholder="Ej: 40000"
            />
          )}

          <Input
            label="Notas (opcional)"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Ej: FVG 4h sin llenar"
          />

          <Button type="submit" loading={loading} className="w-full">
            💾 Guardar Nivel
          </Button>
        </form>
      )}
    </div>
  );
}
