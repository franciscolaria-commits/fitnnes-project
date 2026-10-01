import React, { useState } from 'react';
import { api } from '../services/api.js';
import { useQueryClient } from '@tanstack/react-query';

export default function MembershipModal({ gymInfo, onComplete }) {
  const [selectedMembresia, setSelectedMembresia] = useState('');
  const [clasesCompradas, setClasesCompradas] = useState('');
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMembresia) return;
    if (selectedMembresia === 'por_clases' && (!clasesCompradas || parseInt(clasesCompradas) <= 0)) {
      alert("Por favor ingresa la cantidad de clases.");
      return;
    }

    setLoading(true);
    try {
      await api.patch('/api/v1/students/me/membership', {
        tipo_membresia: selectedMembresia,
        clases_compradas: selectedMembresia === 'por_clases' ? parseInt(clasesCompradas) : null
      });
      await queryClient.invalidateQueries(['studentProfile', 'v2']);
      if (onComplete) onComplete();
    } catch (error) {
      alert("Error al actualizar la membresía.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4">
      <div className="glass-card w-full max-w-md p-6 sm:p-8 flex flex-col gap-6 animate-fade-in border border-emerald-500/30">
        <div className="flex flex-col gap-2 text-center">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tighter text-white">
            Configuración de Membresía
          </h2>
          <p className="text-zinc-400 text-sm">
            Tu cuenta en <strong>{gymInfo?.nombre || 'el gimnasio'}</strong> requiere que selecciones cómo vas a entrenar.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div>
            <label className="text-xs text-zinc-400 font-bold uppercase tracking-widest block mb-2">
              ¿Cómo vas a entrenar?
            </label>
            <select
              value={selectedMembresia}
              onChange={(e) => setSelectedMembresia(e.target.value)}
              required
              className="w-full bg-zinc-900 border border-zinc-700 text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="" disabled>Selecciona una opción</option>
              <option value="pase_libre">Pase Libre (Mensualidad)</option>
              <option value="por_clases">Por Clases (Paquete de Sesiones)</option>
            </select>
          </div>

          {selectedMembresia === 'por_clases' && (
            <div className="animate-fade-in mt-2">
              <label className="text-xs text-zinc-400 font-bold uppercase tracking-widest block mb-2">
                ¿Cuántas clases incluye tu paquete?
              </label>
              <input
                type="number"
                min="1"
                required
                value={clasesCompradas}
                onChange={(e) => setClasesCompradas(e.target.value)}
                placeholder="Ej: 8, 12, etc."
                className="w-full bg-zinc-900 border border-zinc-700 text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={!selectedMembresia || loading}
            className="w-full mt-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest text-sm py-4 rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Confirmar Membresía'}
          </button>
        </form>
      </div>
    </div>
  );
}
