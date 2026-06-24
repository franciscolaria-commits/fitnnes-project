import React, { useState, useEffect } from 'react';
import AuthView from './views/AuthView.jsx';
import CoachDashboard from './views/CoachDashboard.jsx';
import StudentDashboard from './views/StudentDashboard.jsx';
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

  if (!session) {
    return <AuthView onLoginSuccess={checkSession} />;
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
