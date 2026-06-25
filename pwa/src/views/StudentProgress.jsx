import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api.js';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

// Helper para obtener estilo visual según el nivel
const getTierStyle = (tier) => {
  switch (tier?.toLowerCase()) {
    case 'cobre': return { border: 'border-orange-900', bg: 'bg-orange-950/30', text: 'text-orange-700', shield: 'text-orange-900' };
    case 'bronce': return { border: 'border-amber-700', bg: 'bg-amber-950/40', text: 'text-amber-600', shield: 'text-amber-700' };
    case 'plata': return { border: 'border-slate-400', bg: 'bg-slate-900/50', text: 'text-slate-300', shield: 'text-slate-400' };
    case 'oro': return { border: 'border-yellow-400', bg: 'bg-yellow-950/50', text: 'text-yellow-400', shield: 'text-yellow-400' };
    case 'platino': return { border: 'border-cyan-400', bg: 'bg-cyan-950/50', text: 'text-cyan-400', shield: 'text-cyan-400' };
    case 'diamante': return { border: 'border-blue-500', bg: 'bg-blue-950/50', text: 'text-blue-400', shield: 'text-blue-500' };
    default: return { border: 'border-zinc-800', bg: 'bg-zinc-950', text: 'text-zinc-500', shield: 'text-zinc-800' };
  }
};

const ShieldIcon = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 100 L10 75 V25 L50 0 L90 25 V75 Z" opacity="0.3" />
    <path d="M50 90 L20 70 V30 L50 10 L80 30 V70 Z" opacity="0.6" />
    <path d="M50 80 L30 65 V35 L50 20 L70 35 V65 Z" />
    <path d="M50 20 L50 80 L70 65 V35 Z" fill="white" opacity="0.15" />
  </svg>
);

export default function StudentProgress({ studentId }) {
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['studentStats', studentId || 'me'],
    queryFn: () => api.get(studentId ? `/api/v1/coaches/students/${studentId}/stats` : '/api/v1/students/me/stats')
  });

  const { data: leagues, isLoading: loadingLeagues } = useQuery({
    queryKey: ['studentLeagues', studentId || 'me'],
    queryFn: () => api.get(studentId ? `/api/v1/coaches/students/${studentId}/league` : '/api/v1/students/me/league')
  });

  if (loadingStats) {
    return <div className="p-12 text-center text-zinc-500 font-mono uppercase tracking-widest">CARGANDO DATOS...</div>;
  }

  if (!stats) return null;

  const winRate = stats.win_rate_percentage || 0;
  const pieData = [
    { name: 'Victorias (PRs)', value: winRate },
    { name: 'Mantenimiento', value: 100 - winRate }
  ];
  const COLORS = ['#10b981', '#18181b'];

  const repMaxes = stats.rep_maxes || {};
  const exercises = Object.keys(repMaxes);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 auto-rows-min">
      
      {/* LIGAS HERO (Fase 4.5) */}
      <div className="lg:col-span-12 border border-zinc-800 bg-zinc-900 p-6 md:p-10">
        <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter mb-8 border-b border-zinc-800 pb-4">FUERZA RELATIVA / MI LIGA</h2>
        
        {loadingLeagues ? (
          <p className="text-zinc-700 font-black text-5xl uppercase tracking-tighter">CARGANDO...</p>
        ) : !leagues || leagues.length === 0 ? (
          <p className="text-zinc-700 font-black text-5xl uppercase tracking-tighter">SIN DATOS DE LIGA.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {leagues.map((league) => {
              const tierStyle = getTierStyle(league.nivel_actual);
              
              return (
              <div key={league.ejercicio_nombre} className={`border p-6 md:p-8 flex flex-col relative overflow-hidden transition-colors ${league.is_pending_audit ? 'border-amber-500 bg-zinc-950' : `${tierStyle.border} ${tierStyle.bg}`}`}>
                
                {league.is_pending_audit && (
                  <div className="absolute inset-0 bg-amber-500/10 backdrop-blur-md z-10 flex flex-col items-center justify-center p-6 text-center border-4 border-amber-500">
                    <span className="text-6xl mb-4">⏳</span>
                    <p className="text-amber-500 font-black uppercase tracking-widest text-lg bg-zinc-950 px-4 py-2 border border-amber-500/50">EN REVISIÓN</p>
                  </div>
                )}
                
                <div className="flex flex-col mb-6 lg:mb-8 border-b border-zinc-800/50 pb-4 relative">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-white uppercase tracking-tighter pr-2 leading-tight">{league.ejercicio_nombre}</h3>
                    <ShieldIcon className={`w-10 h-10 shrink-0 ${tierStyle.shield} drop-shadow-lg`} />
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-auto">
                    <span className={`block text-2xl sm:text-3xl font-black leading-none uppercase ${tierStyle.text}`}>{league.nivel_actual}</span>
                    {league.nivel_actual !== "Sin Nivel" && (
                      <span className="block text-white font-bold uppercase tracking-widest text-[10px] bg-zinc-950 px-2 py-0.5 border border-zinc-800">NIVEL {league.subnivel_actual}</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-6 lg:mb-8 flex-grow">
                  <div className="border-r border-zinc-800 pr-2 lg:pr-4">
                    <span className="block text-[9px] sm:text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1 truncate">e1RM ACTUAL</span>
                    <span className="block text-xl sm:text-2xl lg:text-3xl font-black text-white">{Math.round(league.e1rm_actual)}<span className="text-xs lg:text-sm text-zinc-600">KG</span></span>
                  </div>
                  <div className="pl-1 sm:pl-2">
                    <span className="block text-[9px] sm:text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1 truncate">MULTIPLICADOR</span>
                    <span className="block text-xl sm:text-2xl lg:text-3xl font-black text-indigo-400">{league.multiplicador_actual.toFixed(2)}x</span>
                  </div>
                </div>
                
                {league.proximo_nivel ? (
                  <div className="mt-auto bg-zinc-900 border border-zinc-800 p-5">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-3">
                      <span className="text-zinc-500">PRÓX: <span className="text-zinc-300">{league.proximo_nivel} {league.proximo_subnivel}</span></span>
                      <span className="text-amber-500 font-black">FALTAN {Math.round(league.peso_faltante_proximo_nivel)}KG</span>
                    </div>
                    <div className="w-full bg-zinc-950 h-3 border border-zinc-800">
                      <div className="bg-amber-500 h-full transition-all duration-1000 ease-out" style={{ width: '50%' }}></div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-auto bg-emerald-500/10 border border-emerald-500/50 p-5 text-center">
                    <span className="text-emerald-500 font-black uppercase tracking-widest text-sm">RANGO MÁXIMO ALCANZADO</span>
                  </div>
                )}
              </div>
              );
            })}
          </div>
        )}
      </div>

      {/* WIN RATE & RECORDS GRID */}
      <div className="lg:col-span-4 border border-zinc-800 bg-zinc-900 p-8 flex flex-col min-h-[300px]">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6">TASA DE VICTORIA (WIN RATE)</h3>
        <div className="relative w-full flex-grow flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%" minHeight={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={80} outerRadius={110} stroke="none" dataKey="value">
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-6xl font-black text-white tracking-tighter">{Math.round(winRate)}%</span>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">PRs LOGRADOS</span>
          </div>
        </div>
      </div>

      <div className="lg:col-span-8 border border-zinc-800 bg-zinc-900 p-6 md:p-10">
        <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-8 border-b border-zinc-800 pb-4">PRs ABSOLUTOS HISTÓRICOS</h3>
        {exercises.length === 0 ? (
          <p className="text-zinc-700 font-black text-5xl uppercase tracking-tighter">SIGUE ENTRENANDO.</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {exercises.map((ejercicio) => (
              <div key={ejercicio} className="border border-zinc-800 bg-zinc-950 p-6">
                <h4 className="text-lg font-black text-zinc-300 uppercase tracking-tighter mb-6 truncate">{ejercicio}</h4>
                <div className="grid grid-cols-4 gap-3">
                  {['1RM', '5RM', '8RM', '10RM'].map(rango => {
                    const peso = repMaxes[ejercicio][rango];
                    return (
                      <div key={rango} className={`flex flex-col items-center justify-center p-3 border ${peso ? 'border-amber-500/50 bg-amber-500/10 text-amber-500' : 'border-zinc-800 bg-zinc-900 text-zinc-600'}`}>
                        <span className="text-[10px] font-bold uppercase tracking-widest mb-2">{rango}</span>
                        <span className="text-lg md:text-xl font-black">{peso ? peso : '-'}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
