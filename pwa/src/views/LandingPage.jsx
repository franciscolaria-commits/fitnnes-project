import React from "react";
import { CheckCircle2, Dumbbell, Star, ChevronRight, WifiOff, TrendingUp } from "lucide-react";

export default function LandingPage() {
  const WHATSAPP_LINK = "https://wa.me/5492644517903?text=Hola,%20quiero%20activar%20el%20periodo%20de%20prueba%20para%20mi%20gimnasio/entrenamiento.";

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-emerald-500/30 overflow-x-hidden">
      
      {/* Efectos de Fondo Avanzados */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Fondo base oscuro */}
        <div className="absolute inset-0 bg-[#050505]"></div>
        
        {/* Luces/Blobs difuminados */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-900/40 rounded-full blur-[120px] opacity-70 animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-blue-900/30 rounded-full blur-[150px] opacity-60"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[800px] h-[800px] bg-emerald-800/20 rounded-full blur-[180px] opacity-50"></div>
        
        {/* Textura de ruido sutil para darle un toque "premium/matte" */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}></div>
      </div>

      {/* Navbar Minimalista */}
      <nav className="relative z-50 pt-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center bg-gray-900/90 backdrop-blur-xl border border-emerald-500/20 shadow-lg shadow-emerald-900/10 rounded-full px-6 py-3">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Syncro Logo" className="w-12 h-12 object-contain mix-blend-screen" />
              <span className="text-3xl font-extrabold tracking-tight text-white/90">
                <span className="text-emerald-500">Syn</span>cro
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
              <a href="#" className="hover:text-white transition-colors cursor-pointer">Inicio</a>
              <a href="#features" className="hover:text-white transition-colors cursor-pointer">Funciones</a>
              <a href="#pricing" className="hover:text-white transition-colors cursor-pointer">Precios</a>
            </div>

            <div className="flex items-center gap-6">
              <button 
                onClick={() => window.location.href = '/login'}
                className="text-sm font-medium text-white/70 hover:text-emerald-400 transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                Ya soy alumno/entrenador
              </button>
              <button 
                onClick={() => window.location.href = WHATSAPP_LINK}
                className="bg-emerald-500 hover:bg-emerald-400 text-gray-900 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:-translate-y-0.5 cursor-pointer"
              >
                Demo gratis
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section Centrado */}
      <section className="relative z-10 pt-24 pb-16 px-4 text-center flex flex-col items-center">
        
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1.5 mb-8">
          <span className="bg-emerald-500 text-black text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">New</span>
          <span className="text-xs font-medium text-emerald-300/80 tracking-wide">La Revolución en el Control de tus Clientes</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 max-w-4xl leading-[1.1]">
          Tus rutinas en Excel te están costando clientes.
        </h1>
        
        <p className="text-lg md:text-xl text-white/50 max-w-2xl mb-10 font-light">
          Moderniza la experiencia de tu gimnasio. Ofrece una app nativa, controla el progreso offline y automatiza tu negocio en una sola plataforma.
        </p>

        <button 
          onClick={() => window.location.href = WHATSAPP_LINK}
          className="bg-white hover:bg-gray-200 text-black px-8 py-4 rounded-xl text-base font-semibold transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.2)] cursor-pointer"
        >
          Prueba gratis por 30 días
        </button>

        {/* Social Proof */}
        <div className="mt-12 flex items-center gap-4 text-sm text-white/40">
          <div className="flex -space-x-3">
            <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Entrenador" className="w-10 h-10 rounded-full border-2 border-[#050505] object-cover" />
            <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Entrenador" className="w-10 h-10 rounded-full border-2 border-[#050505] object-cover" />
            <img src="https://randomuser.me/api/portraits/men/68.jpg" alt="Entrenador" className="w-10 h-10 rounded-full border-2 border-[#050505] object-cover" />
            <img src="https://randomuser.me/api/portraits/women/68.jpg" alt="Entrenador" className="w-10 h-10 rounded-full border-2 border-[#050505] object-cover" />
          </div>
          <div className="flex flex-col items-start">
            <div className="flex text-emerald-400 gap-0.5">
              <Star className="w-3 h-3 fill-current" />
              <Star className="w-3 h-3 fill-current" />
              <Star className="w-3 h-3 fill-current" />
              <Star className="w-3 h-3 fill-current" />
              <Star className="w-3 h-3 fill-current" />
            </div>
            <span>Usado por cientos de entrenadores</span>
          </div>
        </div>
      </section>

      {/* App Mockup Flotante */}
      <section className="relative z-10 px-4 pb-24 flex justify-center perspective-1000">
        <div className="relative w-full max-w-5xl rounded-2xl md:rounded-[2rem] border border-white/10 bg-[#0a0a0a] shadow-2xl shadow-emerald-900/20 overflow-hidden transform-gpu">
          {/* Header del mockup simulado */}
          <div className="h-12 border-b border-white/5 flex items-center px-4 gap-2 bg-[#111]">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
          </div>
          {/* Imagen generada por IA */}
          <img 
            src="/app_mockup.png" 
            alt="Dashboard de Entrenamiento" 
            className="w-full h-auto object-cover opacity-90 mix-blend-screen"
          />
          {/* Sutil gradiente oscuro en la parte inferior de la imagen para fundirse */}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none"></div>
        </div>
      </section>

      {/* Propuesta de Valor (5 Puntos B2B) */}
      <section id="features" className="relative z-10 py-24 border-t border-white/5 bg-[#080808]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Tecnología diseñada para escalar</h2>
            <p className="text-lg text-white/50 max-w-3xl mx-auto">No es solo una app bonita. Es el motor operativo que automatiza tu retención de clientes y destruye tus horas administrativas.</p>
          </div>

          {/* Grilla bento-style para las 5 características */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* 1. Offline */}
            <div className="bg-[#111111] p-8 rounded-3xl border border-white/5 hover:border-emerald-500/30 transition-all hover:-translate-y-1 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all"></div>
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10 group-hover:border-emerald-500/50">
                <WifiOff className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Motor Offline-First Nativo</h3>
              <p className="text-white/60 text-sm mb-4 leading-relaxed">
                El alumno registra pesos, repeticiones y RPE sin internet. Los datos se encolan localmente y se sincronizan al detectar red.
              </p>
              <div className="mt-auto pt-4 border-t border-white/5">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-500">Valor Comercial:</span>
                <p className="text-white/40 text-sm mt-1">Cero fricción por mala señal en el gimnasio. El alumno nunca pierde un registro y tu tasa de abandono cae a cero.</p>
              </div>
            </div>

            {/* 2. Backoffice (antes en lugar 5) */}
            <div className="bg-[#111111] p-8 rounded-3xl border border-white/5 hover:border-yellow-500/30 transition-all hover:-translate-y-1 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl group-hover:bg-yellow-500/20 transition-all"></div>
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10 group-hover:border-yellow-500/50">
                <CheckCircle2 className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Backoffice Masivo</h3>
              <p className="text-white/60 text-sm mb-4 leading-relaxed">
                Constructor jerárquico de plantillas con almacenamiento de recursos visuales independientes vía Cloudflare R2.
              </p>
              <div className="mt-auto pt-4 border-t border-white/5">
                <span className="text-xs font-semibold uppercase tracking-wider text-yellow-500">Valor Comercial:</span>
                <p className="text-white/40 text-sm mt-1">Destruye el tiempo operativo de armar rutinas por WhatsApp. Creás una matriz una sola vez y la asignás a 50 alumnos simultáneamente con un clic.</p>
              </div>
            </div>

            {/* 3. Gamificación (Ocupa 2 filas en lg) */}
            <div className="bg-gradient-to-br from-[#111111] to-[#1a1515] p-8 rounded-3xl border border-white/5 hover:border-red-500/30 transition-all hover:-translate-y-1 group relative overflow-hidden lg:row-span-2 flex flex-col">
              <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/10 rounded-full blur-3xl group-hover:bg-red-500/20 transition-all"></div>
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10 group-hover:border-red-500/50">
                <TrendingUp className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Gamificación Antifraude (e1RM)</h3>
              <p className="text-white/60 text-base mb-6 leading-relaxed">
                Calcula el 1RM estimado en tiempo real (Fórmula de Epley) y clasifica al alumno en ligas de fuerza normalizadas por su peso corporal.
              </p>
              <div className="bg-black/50 p-4 rounded-xl border border-white/5 mb-6 relative overflow-hidden">
                 {/* Decoración simulando el nivel */}
                 <div className="absolute right-[-20px] top-[-20px] text-8xl opacity-10">💎</div>
                 <div className="flex justify-between items-center mb-2">
                   <span className="text-white text-sm font-bold">Liga Diamante</span>
                   <span className="text-emerald-400 text-xs font-mono">+12.5% PR</span>
                 </div>
                 <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                   <div className="w-3/4 bg-emerald-500 h-full"></div>
                 </div>
              </div>
              <div className="mt-auto pt-4 border-t border-white/5">
                <span className="text-xs font-semibold uppercase tracking-wider text-red-500">Valor Comercial:</span>
                <p className="text-white/40 text-sm mt-2">Genera lock-in psicológico. Aprobación automática de progreso normal, pero con alertas de auditoría (Red Flags) ante saltos imposibles para mantener tu legitimidad.</p>
              </div>
            </div>

            {/* 4. Retención */}
            <div className="bg-[#111111] p-8 rounded-3xl border border-white/5 hover:border-purple-500/30 transition-all hover:-translate-y-1 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all"></div>
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10 group-hover:border-purple-500/50">
                <Star className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Dashboard de Retención</h3>
              <p className="text-white/60 text-sm mb-4 leading-relaxed">
                Métricas accionables: Tasa de Sobrecarga, Matriz de Récords y Consistencia Móvil (30 días).
              </p>
              <div className="mt-auto pt-4 border-t border-white/5">
                <span className="text-xs font-semibold uppercase tracking-wider text-purple-500">Valor Comercial:</span>
                <p className="text-white/40 text-sm mt-1">Detecta el churn antes de que ocurra. Envía mensajes de reactivación semanas antes de que el alumno decida no pagar el mes siguiente.</p>
              </div>
            </div>

            {/* 5. Inmutables (antes en lugar 2) */}
            <div className="bg-[#111111] p-8 rounded-3xl border border-white/5 hover:border-blue-500/30 transition-all hover:-translate-y-1 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all"></div>
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10 group-hover:border-blue-500/50">
                <Dumbbell className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Arquitectura Inmutable</h3>
              <p className="text-white/60 text-sm mb-4 leading-relaxed">
                Versionado estricto a cada bloque. Editar una rutina a mitad de mes no sobrescribe el historial previo del alumno.
              </p>
              <div className="mt-auto pt-4 border-t border-white/5">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-500">Valor Comercial:</span>
                <p className="text-white/40 text-sm mt-1">Garantiza la integridad matemática de las estadísticas de fuerza. Métrica profesional que justifica el aumento de tu tarifa.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Pricing Section (Integrado con el estilo oscuro) */}
      <section id="pricing" className="relative z-10 py-24 bg-[#080808] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Planes diseñados para escalar</h2>
            <p className="text-white/40">Comienza gratis. Paga solo cuando tu negocio crezca.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Plan 1 */}
            <a 
              href={WHATSAPP_LINK} 
              className="bg-[#111111] rounded-2xl p-8 border border-white/5 hover:border-emerald-500/30 transition-all hover:-translate-y-1 group relative overflow-hidden flex flex-col cursor-pointer"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all"></div>
              <h3 className="text-lg font-medium text-white/70 mb-2">Plan Inicial</h3>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-4xl font-bold text-white">$2.000</span>
                <span className="text-white/40 text-sm">ARS / mes</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1 text-sm text-white/60">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span className="text-base text-white">Hasta <strong>1 alumno</strong></span>
                </li>
                <li className="flex items-center gap-3 opacity-60">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>Acceso total a todas las funciones</span>
                </li>
              </ul>
              <div className="w-full py-3 bg-white/5 group-hover:bg-emerald-500/20 border border-white/10 group-hover:border-emerald-500/30 text-white text-center rounded-lg transition-colors text-sm font-medium">
                Elegir Inicial
              </div>
            </a>

            {/* Plan 2 */}
            <a 
              href={WHATSAPP_LINK} 
              className="bg-[#161616] rounded-2xl p-8 border border-emerald-500/30 relative flex flex-col shadow-2xl shadow-emerald-900/10 md:-translate-y-4 hover:-translate-y-6 transition-all group cursor-pointer"
            >
              <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/30 transition-all"></div>
              </div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-black px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase z-10">
                Más Popular
              </div>
              <h3 className="text-lg font-medium text-emerald-400 mb-2 relative z-10">Plan Pro</h3>
              <div className="flex items-baseline gap-2 mb-8 relative z-10">
                <span className="text-4xl font-bold text-white">$15.000</span>
                <span className="text-white/40 text-sm">ARS / mes</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1 text-sm text-white/60 relative z-10">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span className="text-base text-white">Hasta <strong>10 alumnos</strong></span>
                </li>
                <li className="flex items-center gap-3 opacity-60">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>Acceso total a todas las funciones</span>
                </li>
              </ul>
              <div className="w-full py-3 bg-emerald-500 group-hover:bg-emerald-400 text-black text-center font-bold rounded-lg transition-colors text-sm relative z-10 shadow-lg shadow-emerald-500/20">
                Elegir Pro
              </div>
            </a>

            {/* Plan 3 */}
            <a 
              href={WHATSAPP_LINK} 
              className="bg-[#111111] rounded-2xl p-8 border border-white/5 hover:border-emerald-500/30 transition-all hover:-translate-y-1 group relative overflow-hidden flex flex-col cursor-pointer"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all"></div>
              <h3 className="text-lg font-medium text-white/70 mb-2">Plan Premium</h3>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-4xl font-bold text-white">$70.000</span>
                <span className="text-white/40 text-sm">ARS / mes</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1 text-sm text-white/60">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span className="text-base text-white">Hasta <strong>50 alumnos</strong></span>
                </li>
                <li className="flex items-center gap-3 opacity-60">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>Acceso total a todas las funciones</span>
                </li>
              </ul>
              <div className="w-full py-3 bg-white/5 group-hover:bg-emerald-500/20 border border-white/10 group-hover:border-emerald-500/30 text-white text-center rounded-lg transition-colors text-sm font-medium">
                Elegir Premium
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Footer Minimalista */}
      <footer className="border-t border-white/5 py-12 text-center text-white/30 text-sm bg-[#050505]">
        <div className="flex items-center justify-center gap-2 mb-4">
          <img src="/logo.png" alt="Syncro" className="w-5 h-5 opacity-50 grayscale mix-blend-screen" />
          <span className="font-semibold text-white/50">Syncro</span>
        </div>
        <p>© 2026 Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
