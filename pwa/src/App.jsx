import React, { useState, useEffect } from 'react';
import AuthView from './views/AuthView.jsx';
import LandingPage from './views/LandingPage.jsx';
import CoachDashboard from './views/CoachDashboard.jsx';
import StudentDashboard from './views/StudentDashboard.jsx';
import BlockedView from './views/BlockedView.jsx';
import SuperAdminPanel from './views/SuperAdminPanel.jsx';
import WeightGuardian from './components/WeightGuardian.jsx';
import { initOfflineSync } from './services/offlineSync.js';
import './index.css';

initOfflineSync();

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = () => {
    const token = localStorage.getItem("fitness_jwt");
    const userRaw = localStorage.getItem("fitness_user");
    if (token && userRaw) {
      setSession(JSON.parse(userRaw));
    } else {
      setSession(null);
    }
  };

  const path = window.location.pathname;

  if (path === '/blocked') {
    return <BlockedView />;
  }

  if (path === '/admin-secreto') {
    if (!session || session.rol !== 'superadmin') {
      return <AuthView onLoginSuccess={checkSession} />;
    }
    return <SuperAdminPanel />;
  }

  if (!session) {
    if (path === '/login') {
      return <AuthView onLoginSuccess={checkSession} />;
    }
    // Por defecto, visitantes no autenticados ven la Landing B2B
    return <LandingPage />;
  }

  // == Si hay sesión, ignoramos la Landing y resolvemos vistas ==
  if (path === '/' || path === '/login') {
    // Si entró a la raíz o al login con sesión activa, no hacemos nada extra,
    // el código de abajo renderizará el Dashboard correspondiente.
    // Opcionalmente se podría usar history.pushState, pero esto es más simple.
  }

  if (session.rol === 'superadmin') {
    return <SuperAdminPanel />;
  }

  // Si es entrenador, retornamos directamente
  if (session.rol === 'entrenador') {
    return <CoachDashboard />;
  }

  // Si es alumno, envolvemos en el Guardián de Peso
  if (session.rol === 'alumno') {
    return (
      <WeightGuardian user={session}>
        <StudentDashboard />
      </WeightGuardian>
    );
  }

  return <div>Rol desconocido</div>;
}
