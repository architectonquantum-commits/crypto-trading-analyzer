import { useState, useEffect } from 'react'
import api from '../services/api'

function Bitacora() {
  const [operaciones, setOperaciones] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    symbol: 'BTC/USDT',
    timeframe: '1h',
    tipo: 'LONG',
    precio_entrada: '',
    stop_loss: '',
    take_profit: '',
    notas: ''
  })

  useEffect(() => {
    loadOperaciones()
  }, [])

  const loadOperaciones = async () => {
    try {
      const response = await api.get('/bitacora')
      setOperaciones(response.data)
    } catch (error) {
      console.error('Error cargando bitácora:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/bitacora', {
        ...formData,
        precio_entrada: parseFloat(formData.precio_entrada),
        stop_loss: parseFloat(formData.stop_loss),
        take_profit: parseFloat(formData.take_profit),
      })

      setShowForm(false)
      setFormData({
        symbol: 'BTC/USDT',
        timeframe: '1h',
        tipo: 'LONG',
        precio_entrada: '',
        stop_loss: '',
        take_profit: '',
        notas: ''
      })
      loadOperaciones()
    } catch (error) {
      console.error('Error guardando operación:', error)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta operación?')) return

    try {
      await api.delete(`/bitacora/${id}`)
      loadOperaciones()
    } catch (error) {
      console.error('Error eliminando operación:', error)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Bitácora de Operaciones</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold"
        >
          {showForm ? 'Cancelar' : '+ Nueva Operación'}
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-slate-800 p-6 rounded-lg">
          <h3 className="text-lg font-bold mb-4">Nueva Operación</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Símbolo</label>
                <input
                  type="text"
                  value={formData.symbol}
                  onChange={(e) => setFormData({...formData, symbol: e.target.value})}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Timeframe</label>
                <select
                  value={formData.timeframe}
                  onChange={(e) => setFormData({...formData, timeframe: e.target.value})}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2"
                >
                  <option value="1m">1 minuto</option>
                  <option value="5m">5 minutos</option>
                  <option value="15m">15 minutos</option>
                  <option value="1h">1 hora</option>
                  <option value="4h">4 horas</option>
                  <option value="1d">1 día</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tipo</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2"
                >
                  <option value="LONG">LONG</option>
                  <option value="SHORT">SHORT</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Precio Entrada</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.precio_entrada}
                  onChange={(e) => setFormData({...formData, precio_entrada: e.target.value})}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Stop Loss</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.stop_loss}
                  onChange={(e) => setFormData({...formData, stop_loss: e.target.value})}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Take Profit</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.take_profit}
                  onChange={(e) => setFormData({...formData, take_profit: e.target.value})}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Notas</label>
              <textarea
                value={formData.notas}
                onChange={(e) => setFormData({...formData, notas: e.target.value})}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2"
                rows="3"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 py-2 rounded font-semibold"
            >
              Guardar Operación
            </button>
          </form>
        </div>
      )}

      {/* Lista de operaciones */}
      <div className="bg-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
                <th className="px-4 py-3 text-left">Símbolo</th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-left">Entrada</th>
                <th className="px-4 py-3 text-left">SL</th>
                <th className="px-4 py-3 text-left">TP</th>
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {operaciones.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-slate-400">
                    No hay operaciones registradas
                  </td>
                </tr>
              ) : (
                operaciones.map((op) => (
                  <tr key={op.id} className="border-t border-slate-700 hover:bg-slate-700/50">
                    <td className="px-4 py-3 font-semibold">{op.symbol}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        op.tipo === 'LONG' ? 'bg-green-600' : 'bg-red-600'
                      }`}>
                        {op.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-3">${op.precio_entrada}</td>
                    <td className="px-4 py-3 text-red-400">${op.stop_loss}</td>
                    <td className="px-4 py-3 text-green-400">${op.take_profit}</td>
                    <td className="px-4 py-3 text-sm text-slate-400">
                      {new Date(op.fecha_entrada).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(op.id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Bitacora