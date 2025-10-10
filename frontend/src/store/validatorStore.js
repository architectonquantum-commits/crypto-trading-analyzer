import { create } from 'zustand';
import { validateSignalManual } from '../services/validatorApi';
import toast from 'react-hot-toast';

const useValidatorStore = create((set) => ({
  validationResult: null,
  loading: false,
  error: null,

  validateSignal: async (signalData) => {
    set({ loading: true, error: null, validationResult: null });
    try {
      const result = await validateSignalManual(signalData);
      set({ validationResult: result, loading: false });
      toast.success('Señal validada correctamente');
      return result;
    } catch (error) {
      set({ error: error.message, loading: false });
      toast.error('Error al validar señal');
      throw error;
    }
  },

  clearResult: () => set({ validationResult: null, error: null }),
}));

export default useValidatorStore;
