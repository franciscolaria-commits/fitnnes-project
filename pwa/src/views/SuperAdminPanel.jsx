import React, { useState, useEffect } from "react";
import { api, logout } from "../services/api";
import { LogOut, Users, Settings, Activity } from "lucide-react";

export default function SuperAdminPanel() {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoaches();
  }, []);

  const fetchCoaches = async () => {
    try {
      const data = await api.get("/api/v1/admin/coaches");
      setCoaches(data);
    } catch (err) {
      console.error(err);
      if (err.message.includes("Acceso denegado")) {
         alert("No eres SuperAdmin");
         window.location.href = "/";
      }
    } finally {
      setLoading(false);
    }
  };

  const updateCoach = async (coachId, updates) => {
    try {
      const updated = await api.put(`/api/v1/admin/coaches/${coachId}`, updates);
      setCoaches(coaches.map(c => c.id_usuario === coachId ? updated : c));
    } catch (err) {
      alert("Error al actualizar: " + err.message);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Cargando panel...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 pb-10">
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-emerald-500" />
            <h1 className="text-xl font-bold text-white">Panel SuperAdmin</h1>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-8">
        <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-lg font-medium text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-500" />
              Gestión de Entrenadores B2B
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-gray-900/50 text-xs uppercase text-gray-400">
                <tr>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4 text-center">Estado Financiero</th>
                  <th className="px-6 py-4 text-center">Límite Alumnos</th>
                  <th className="px-6 py-4 text-center">Alumnos Actuales</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {coaches.map(coach => (
                  <tr key={coach.id_usuario} className="hover:bg-gray-750">
                    <td className="px-6 py-4 font-medium text-white">
                      {coach.email}
                      <div className="text-xs text-gray-500 font-normal">{coach.nombre || "Sin nombre"}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <select
                        value={coach.estado_financiero}
                        onChange={(e) => updateCoach(coach.id_usuario, { estado_financiero: e.target.value })}
                        className={`bg-gray-900 border text-sm rounded-lg block w-full p-2.5 ${
                          coach.estado_financiero === 'activo' 
                            ? 'border-emerald-500/30 text-emerald-400' 
                            : 'border-red-500/30 text-red-400'
                        }`}
                      >
                        <option value="activo">Activo</option>
                        <option value="suspendido">Suspendido</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <input
                        type="number"
                        min="1"
                        value={coach.limite_alumnos}
                        onChange={(e) => setCoaches(coaches.map(c => c.id_usuario === coach.id_usuario ? { ...c, limite_alumnos: parseInt(e.target.value) || 1 } : c))}
                        onBlur={(e) => updateCoach(coach.id_usuario, { limite_alumnos: parseInt(e.target.value) || 1 })}
                        className="bg-gray-900 border border-gray-600 text-gray-300 text-sm rounded-lg block w-full p-2.5 text-center focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Activity className="w-4 h-4 text-gray-400" />
                        <span className={`font-medium ${coach.total_alumnos >= coach.limite_alumnos ? 'text-orange-400' : 'text-emerald-400'}`}>
                          {coach.total_alumnos}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
                {coaches.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                      No hay entrenadores registrados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
