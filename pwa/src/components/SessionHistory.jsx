import React, { useState } from 'react';

export default function SessionHistory({ sessions }) {
  const [expandedId, setExpandedId] = useState(null);
  
  if (!sessions || sessions.length === 0) {
    return (
      <div className="p-8 border-2 border-dashed border-zinc-800 rounded-2xl text-center">
        <p className="text-zinc-500 font-bold uppercase">No hay sesiones completadas aún.</p>
      </div>
    );
  }

  // Agrupar sets por ejercicio para una sesión dada
  const groupSetsByExercise = (sets) => {
    const groups = {};
    sets.forEach(s => {
      const exName = s.rutina_ejercicio?.ejercicio?.nombre || 'Ejercicio Eliminado';
      if (!groups[exName]) groups[exName] = [];
      groups[exName].push(s);
    });
    return groups;
  };

  // Encontrar la sesión anterior que comparta el 50% de los ejercicios (misma rutina/día)
  const getPreviousSession = (currentSession, index) => {
    const currentExercises = Object.keys(groupSetsByExercise(currentSession.sets));
    if (currentExercises.length === 0) return null;

    for (let i = index + 1; i < sessions.length; i++) {
      const prevSession = sessions[i];
      if (prevSession.id_rutina !== currentSession.id_rutina) continue;
      
      const prevExercises = Object.keys(groupSetsByExercise(prevSession.sets));
      const shared = currentExercises.filter(ex => prevExercises.includes(ex));
      
      if (shared.length >= currentExercises.length * 0.5) {
        return prevSession;
      }
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-4">
      {sessions.map((session, index) => {
        const isExpanded = expandedId === session.id_sesion;
        const dateStr = new Date(session.fecha_inicio).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
        const timeStr = new Date(session.fecha_inicio).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        
        const currentGroups = groupSetsByExercise(session.sets);
        const prevSession = isExpanded ? getPreviousSession(session, index) : null;
        const prevGroups = prevSession ? groupSetsByExercise(prevSession.sets) : {};

        return (
          <div key={session.id_sesion} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden transition-all">
            {/* Header / Trigger */}
            <button 
              onClick={() => setExpandedId(isExpanded ? null : session.id_sesion)}
              className="w-full p-4 flex items-center justify-between hover:bg-zinc-800/50 transition-colors text-left"
            >
              <div>
                <p className="text-sm font-bold text-zinc-100 capitalize">{dateStr}</p>
                <p className="text-xs text-zinc-500 mt-1">{timeStr} • {session.sets.length} series totales</p>
              </div>
              <div className="flex items-center gap-4">
                {session.nuevos_prs?.length > 0 && (
                  <span className="bg-amber-500/10 text-amber-500 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest border border-amber-500/20">
                    PR Rompido
                  </span>
                )}
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-zinc-500 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </button>

            {/* Contenido Expandido */}
            {isExpanded && (
              <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex flex-col gap-6">
                
                {prevSession && (
                  <div className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-lg text-xs text-indigo-300 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                    <strong>Comparativa activa:</strong> Mostrando el progreso respecto a la sesión del {new Date(prevSession.fecha_inicio).toLocaleDateString()}
                  </div>
                )}

                {Object.keys(currentGroups).map(exName => (
                  <div key={exName} className="flex flex-col md:flex-row gap-4 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50">
                    <div className="md:w-1/3">
                      <h4 className="font-bold text-sm text-indigo-400">{exName}</h4>
                      {prevGroups[exName] && (
                        <p className="text-[10px] text-zinc-500 uppercase mt-1 tracking-widest">
                          Anterior: {Math.max(...prevGroups[exName].map(s => s.peso_usado))}kg max
                        </p>
                      )}
                    </div>
                    <div className="md:w-2/3">
                      <div className="grid grid-cols-4 gap-2 text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-2 border-b border-zinc-800 pb-2">
                        <div>Serie</div>
                        <div>Reps</div>
                        <div>Peso</div>
                        <div>vs Anterior</div>
                      </div>
                      <div className="flex flex-col gap-1">
                        {currentGroups[exName].map((set, sIdx) => {
                          const prevSet = prevGroups[exName]?.[sIdx];
                          const pesoDiff = prevSet ? set.peso_usado - prevSet.peso_usado : 0;
                          
                          let diffColor = "text-zinc-600";
                          let diffText = "-";
                          if (pesoDiff > 0) { diffColor = "text-emerald-500"; diffText = `+${pesoDiff}kg`; }
                          else if (pesoDiff < 0) { diffColor = "text-red-500"; diffText = `${pesoDiff}kg`; }
                          else if (prevSet) { diffColor = "text-zinc-400"; diffText = "="; }

                          return (
                            <div key={set.id_set} className="grid grid-cols-4 gap-2 text-sm items-center py-1">
                              <div className="text-zinc-400 font-mono">{sIdx + 1}</div>
                              <div className="text-zinc-200 font-bold">{set.reps_logradas}</div>
                              <div className="text-white font-bold">{set.peso_usado}kg</div>
                              <div className={`text-xs font-bold ${diffColor}`}>{diffText}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}

              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
