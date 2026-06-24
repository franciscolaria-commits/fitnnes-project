import React from "react";
import { LogOut, AlertTriangle } from "lucide-react";
import { logout } from "../services/api";

export default function BlockedView() {
  const reason = sessionStorage.getItem("fitness_blocked_reason") || "El servicio está temporalmente suspendido.";

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-8 text-center border border-red-900/50">
        <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-4">Acceso Bloqueado</h1>
        
        <p className="text-gray-300 mb-8 text-lg">
          {reason.includes("Pago requerido") 
            ? "Tu suscripción está vencida. Contacta a soporte para reactivar tu cuenta y recuperar el acceso de tus alumnos."
            : "El servicio está temporalmente en mantenimiento o suspendido. Por favor, contacta a tu entrenador."}
        </p>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
