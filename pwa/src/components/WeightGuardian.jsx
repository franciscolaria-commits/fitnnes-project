import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useModal } from './ModalProvider.jsx';

export default function WeightGuardian({ user, children }) {
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const queryClient = useQueryClient();
  const modal = useModal();

  const { data: profile } = useQuery({
    queryKey: ['studentProfileGuardian'],
    queryFn: () => api.get("/api/v1/students/profile"),
    enabled: !!user && user.rol === 'alumno',
    retry: false
  });

  useEffect(() => {
    const lastWeightDate = user?.alumno?.fecha_ultimo_peso || profile?.fecha_ultimo_peso;
    
    if (lastWeightDate) {
      const lastDate = new Date(lastWeightDate);
      const now = new Date();
      const diffTime = Math.abs(now - lastDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 90) {
        setNeedsUpdate(true);
      }
    } else if (profile) {
      // Si el profile ya cargó y no tiene fecha, lo necesitamos
      setNeedsUpdate(true);
    }
  }, [profile, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newWeight || isNaN(newWeight) || newWeight <= 0) {
      await modal.alert("Por favor ingresa un peso válido.");
      return;
    }

    setIsUpdating(true);
    try {
      const response = await api.put('/api/v1/students/me/weight', { peso_corporal_actual: parseFloat(newWeight) });
      
      // Actualizar la sesión en localStorage para reflejar la nueva fecha
      const userRaw = localStorage.getItem("fitness_user");
      if (userRaw) {
        const sessionData = JSON.parse(userRaw);
        sessionData.alumno = response; // o simplemente forzamos la fecha
        sessionData.alumno.fecha_ultimo_peso = new Date().toISOString();
        localStorage.setItem("fitness_user", JSON.stringify(sessionData));
      }
      
      setNeedsUpdate(false);
      window.location.reload(); // Recargar para aplicar los cambios del usuario global
    } catch (error) {
      console.error("Error al actualizar el peso:", error);
      await modal.alert("Hubo un error al actualizar tu peso.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (needsUpdate) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
        <div className="bg-zinc-900 border border-amber-500/50 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center">
          <div className="text-5xl mb-4">⚖️</div>
          <h2 className="text-2xl font-black text-amber-400 mb-2 uppercase tracking-wide">Actualización Requerida</h2>
          <p className="text-zinc-300 font-medium mb-6 text-sm">
            Han pasado más de 90 días desde tu última actualización de peso. Para calcular tu <span className="text-amber-500 font-bold">Fuerza Relativa</span> y mantener la integridad de las Ligas, necesitamos tu peso actual.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="30"
                max="300"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                placeholder="Ej. 75.5"
                className="w-full bg-zinc-800 text-white border-2 border-zinc-700 focus:border-amber-500 rounded-xl px-4 py-3 outline-none text-center text-xl font-bold transition-all"
                required
              />
              <span className="absolute right-4 top-3 text-zinc-500 font-bold text-xl">kg</span>
            </div>
            <button
              type="submit"
              disabled={isUpdating}
              className="w-full bg-amber-600 hover:bg-amber-500 text-white font-black py-4 rounded-xl shadow-lg transition-all text-lg uppercase tracking-wider disabled:opacity-50"
            >
              {isUpdating ? 'Actualizando...' : 'Guardar y Continuar'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
