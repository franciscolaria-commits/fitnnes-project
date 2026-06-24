import React, { useState, useEffect } from 'react';

// Animación Genérica (Barra subiendo y bajando)
const GenericAnimation = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full text-zinc-500" fill="none" stroke="currentColor" strokeWidth="4">
    <rect x="20" y="80" width="60" height="10" fill="currentColor" />
    <path d="M50 80 V20" strokeDasharray="5,5" className="opacity-50" />
    <circle cx="50" cy="50" r="15" fill="currentColor" className="animate-bounce" />
  </svg>
);

// Sentadilla (Squat) - Vista Lateral (Side Profile)
const SquatAnimation = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full text-emerald-500" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
    {/* Suelo */}
    <path d="M10 90 L90 90" strokeWidth="2" strokeDasharray="5,5" className="opacity-30" />
    
    <g className="animate-[squat_2.5s_ease-in-out_infinite]">
      {/* Disco y Barra en la espalda */}
      <circle cx="45" cy="30" r="12" fill="currentColor" className="opacity-20" stroke="none" />
      <path d="M45 28 L45 32" strokeWidth="6" />
      
      {/* Torso */}
      <circle cx="50" cy="20" r="6" />
      {/* La espalda se inclina un poco hacia adelante en la bajada */}
      <path d="M50 26 L45 50" className="animate-[squat-torso_2.5s_ease-in-out_infinite]" />
      
      {/* Brazos estabilizando la barra */}
      <path d="M50 26 L55 35 L45 30" strokeWidth="3" className="animate-[squat-arm_2.5s_ease-in-out_infinite]" />
    </g>

    {/* Piernas articuladas (Vista Lateral - No se trasladan con el torso) */}
    {/* Muslo (Cadera a Rodilla) */}
    <path d="M45 50 L55 70" className="animate-[squat-thigh_2.5s_ease-in-out_infinite]" />
    
    {/* Pantorrilla (Rodilla a Tobillo) */}
    <path d="M55 70 L50 88" className="animate-[squat-calf_2.5s_ease-in-out_infinite]" />
    
    {/* Pie apoyado (Fijo en el suelo) */}
    <path d="M45 88 L55 88" strokeWidth="5" />

    <style>{`
      @keyframes squat {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(35px); }
      }
      @keyframes squat-torso {
        0%, 100% { d: path("M50 26 L45 50"); }
        50% { d: path("M50 26 L35 50"); }
      }
      @keyframes squat-arm {
        0%, 100% { d: path("M50 26 L55 35 L45 30"); }
        50% { d: path("M50 26 L45 35 L45 30"); }
      }
      @keyframes squat-thigh {
        0%, 100% { d: path("M45 50 L55 70"); }
        50% { d: path("M35 85 L65 75"); }
      }
      @keyframes squat-calf {
        0%, 100% { d: path("M55 70 L50 88"); }
        50% { d: path("M65 75 L50 88"); }
      }
    `}</style>
  </svg>
);

// Press de Banca (Bench Press) - Vista Lateral
const BenchPressAnimation = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full text-blue-500" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
    {/* Banco */}
    <path d="M10 70 L80 70" strokeWidth="6" />
    <path d="M20 70 L20 90 M70 70 L70 90" />
    
    {/* Cuerpo recostado con arco lumbar */}
    <circle cx="20" cy="65" r="6" />
    <path d="M26 65 Q 45 55 60 68" /> {/* Torso con arco */}
    <path d="M60 68 L65 85 L75 85" /> {/* Piernas ancladas al suelo */}

    {/* Barra y Brazos */}
    <g className="animate-[bench_2.5s_ease-in-out_infinite]">
      {/* Disco */}
      <circle cx="45" cy="30" r="10" fill="currentColor" className="opacity-20" stroke="none" />
      <path d="M45 28 L45 32" strokeWidth="6" />
      
      {/* Brazos flexionando */}
      <path d="M35 60 L40 45 L45 30" className="animate-[bench-arm_2.5s_ease-in-out_infinite]" />
    </g>

    <style>{`
      @keyframes bench {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(30px); }
      }
      @keyframes bench-arm {
        0%, 100% { d: path("M35 60 L40 45 L45 30"); }
        50% { d: path("M35 60 L30 50 L45 30"); }
      }
    `}</style>
  </svg>
);

// Peso Muerto (Deadlift) - Vista Lateral
const DeadliftAnimation = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full text-amber-500" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
    {/* Suelo */}
    <path d="M10 90 L90 90" strokeWidth="2" strokeDasharray="5,5" className="opacity-30" />
    
    {/* Disco y Barra */}
    <g className="animate-[deadlift-bar_2.5s_ease-in-out_infinite]">
      <circle cx="60" cy="80" r="10" fill="currentColor" className="opacity-20" stroke="none" />
      <path d="M60 78 L60 82" strokeWidth="6" />
    </g>

    {/* Piernas articuladas (Vista Lateral) */}
    {/* Muslo */}
    <path d="M40 55 L50 70" className="animate-[deadlift-thigh_2.5s_ease-in-out_infinite]" />
    {/* Pantorrilla (casi vertical en DL) */}
    <path d="M50 70 L50 88" className="animate-[deadlift-calf_2.5s_ease-in-out_infinite]" />
    {/* Pie */}
    <path d="M45 88 L55 88" strokeWidth="5" />

    {/* Torso y Brazos */}
    <g className="animate-[deadlift-upper_2.5s_ease-in-out_infinite]">
      <circle cx="50" cy="20" r="6" className="animate-[deadlift-head_2.5s_ease-in-out_infinite]" />
      {/* Espalda recta */}
      <path d="M50 26 L40 55" className="animate-[deadlift-torso_2.5s_ease-in-out_infinite]" />
      {/* Brazos rectos colgados */}
      <path d="M45 35 L60 80" strokeWidth="3" className="animate-[deadlift-arm_2.5s_ease-in-out_infinite]" />
    </g>

    <style>{`
      @keyframes deadlift-bar {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-35px); }
      }
      @keyframes deadlift-thigh {
        0%, 100% { d: path("M30 65 L45 75"); }
        50% { d: path("M45 45 L50 70"); }
      }
      @keyframes deadlift-calf {
        0%, 100% { d: path("M45 75 L50 88"); }
        50% { d: path("M50 70 L50 88"); }
      }
      @keyframes deadlift-torso {
        0%, 100% { d: path("M55 40 L30 65"); }
        50% { d: path("M45 20 L45 45"); }
      }
      @keyframes deadlift-head {
        0%, 100% { cx: 60; cy: 35; }
        50% { cx: 45; cy: 12; }
      }
      @keyframes deadlift-arm {
        0%, 100% { d: path("M45 48 L60 80"); }
        50% { d: path("M45 25 L60 45"); }
      }
    `}</style>
  </svg>
);

// Dominadas (Pull-ups) - Mejoradas
const PullUpAnimation = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full text-indigo-500" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
    {/* Barra de dominadas */}
    <path d="M20 20 L80 20" strokeWidth="6" />
    <path d="M20 10 L20 20 M80 10 L80 20" strokeWidth="2" />
    
    {/* Cuerpo subiendo y bajando */}
    <g className="animate-[pullup_2.5s_ease-in-out_infinite]">
      <circle cx="50" cy="40" r="6" />
      <path d="M50 46 L50 75" /> {/* Torso */}
      <path d="M50 75 L45 90 L40 95 M50 75 L55 90 L60 95" /> {/* Piernas con leve cruce/flexión */}
      {/* Brazos tirando (codos viajan hacia abajo) */}
      <path d="M35 20 L40 35 L50 46 M65 20 L60 35 L50 46" className="animate-[pullup-arms_2.5s_ease-in-out_infinite]" />
    </g>
    <style>{`
      @keyframes pullup {
        0%, 100% { transform: translateY(20px); }
        50% { transform: translateY(-10px); }
      }
      @keyframes pullup-arms {
        0%, 100% { d: path("M35 0 L40 10 L50 26 M65 0 L60 10 L50 26"); }
        50% { d: path("M35 30 L30 45 L50 56 M65 30 L70 45 L50 56"); }
      }
    `}</style>
  </svg>
);

// Press Militar (Overhead Press)
const OverheadPressAnimation = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full text-orange-500" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round">
    <g className="animate-[ohp_2s_ease-in-out_infinite]">
      <path d="M25 25 L75 25" strokeWidth="6" />
      <rect x="20" y="15" width="8" height="20" fill="currentColor" />
      <rect x="72" y="15" width="8" height="20" fill="currentColor" />
    </g>
    {/* Cuerpo (de pie) */}
    <circle cx="50" cy="45" r="8" />
    <path d="M50 53 L50 80" />
    <path d="M50 80 L45 100 M50 80 L55 100" />
    {/* Brazos empujando */}
    <g className="animate-[ohp-arms_2s_ease-in-out_infinite]">
      <path d="M35 25 L50 50 L65 25" />
    </g>
    <style>{`
      @keyframes ohp {
        0%, 100% { transform: translateY(25px); }
        50% { transform: translateY(-10px); }
      }
      @keyframes ohp-arms {
        0%, 100% { transform: translateY(10px) scaleY(0.5); transform-origin: 50% 50px; }
        50% { transform: translateY(-10px) scaleY(1); transform-origin: 50% 50px; }
      }
    `}</style>
  </svg>
);

export default function ExerciseAnimations({ exerciseName }) {
  const nameLower = exerciseName?.toLowerCase() || "";

  if (nameLower.includes("sentadilla") || nameLower.includes("squat")) return <SquatAnimation />;
  if (nameLower.includes("banca") || nameLower.includes("bench")) return <BenchPressAnimation />;
  if (nameLower.includes("muerto") || nameLower.includes("deadlift")) return <DeadliftAnimation />;
  if (nameLower.includes("dominada") || nameLower.includes("pull-up") || nameLower.includes("pullup")) return <PullUpAnimation />;
  if (nameLower.includes("militar") || nameLower.includes("overhead")) return <OverheadPressAnimation />;

  return <GenericAnimation />;
}
