import React, { useState, useEffect, useRef } from 'react';
import { api, logout } from '../services/api.js';
import { useModal } from '../components/ModalProvider.jsx';
import WorkoutBuilder from './WorkoutBuilder.jsx';
import StudentProgress from './StudentProgress.jsx';

export default function CoachDashboard() {
  const [activePanel, setActivePanel] = useState('students');
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [isBuildingRoutine, setIsBuildingRoutine] = useState(false);
  const [email, setEmail] = useState('');
  const [students, setStudents] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [profile, setProfile] = useState({});
  const [editingRoutine, setEditingRoutine] = useState(null);
  const [audits, setAudits] = useState([]);
  const modal = useModal();

  useEffect(() => {
    const userRaw = localStorage.getItem("fitness_user");
    if (userRaw) {
      const user = JSON.parse(userRaw);
      setEmail(user.email);
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const stdData = await api.get("/api/v1/coaches/students");
      setStudents(stdData.filter(s => s.estado_activo));
      
      const invData = await api.get("/api/v1/coaches/invitations");
      setInvitations(invData);
      
      const exData = await api.get("/api/v1/exercises");
      setExercises(exData);
      
      const rutData = await api.get("/api/v1/routines");
      setRoutines(rutData);

      const profData = await api.get("/api/v1/coaches/profile");
      setProfile(profData);
      
      const audData = await api.get("/api/v1/coaches/audits/pending");
      setAudits(audData);
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveAudit = async (id, action) => {
    if (!(await modal.confirm(`¿Seguro que deseas ${action} este récord?`))) return;
    try {
      await api.post(`/api/v1/coaches/audits/${id}/resolve`, { action });
      await modal.alert(`Récord ${action} exitosamente.`);
      loadData();
    } catch (err) {
      await modal.alert("Error: " + err.message);
    }
  };

  const handleCreateExercise = async (e) => {
    e.preventDefault();
    const nombre = e.target.nombre.value.trim();
    const descripcion = e.target.descripcion.value.trim();
    const url_media = e.target.url_media.value.trim();
    
    try {
      await api.post("/api/v1/exercises/custom", { nombre, descripcion, url_media });
      await modal.alert("Ejercicio creado exitosamente.");
      e.target.reset();
      loadData();
    } catch (error) {
      await modal.alert(`Error al crear ejercicio: ${error.message}`);
    }
  };

  const handleOverrideMedia = async (id_ejercicio) => {
    const url = await modal.prompt("Ingresa la URL de YouTube para este ejercicio global (Solo lo verán tus alumnos):");
    if (!url) return; 
    try {
      await api.post(`/api/v1/exercises/${id_ejercicio}/media`, { url_media: url.trim() });
      await modal.alert("Video asignado exitosamente al ejercicio global.");
      loadData();
    } catch (err) {
      await modal.alert("Error: " + err.message);
    }
  };

  const handleEditCustomExercise = async (ejercicio) => {
    const nombre = await modal.prompt("Nuevo nombre del ejercicio:");
    if (nombre === null) return;
    const url = await modal.prompt("Nueva URL de YouTube para el ejercicio:");
    if (url === null) return;
    
    try {
      await api.put(`/api/v1/exercises/${ejercicio.id_ejercicio}`, { 
        nombre: nombre.trim() || undefined,
        url_media: url.trim() || undefined
      });
      await modal.alert("Ejercicio modificado exitosamente.");
      loadData();
    } catch (err) {
      await modal.alert("Error: " + err.message);
    }
  };

  const handleDeleteCustomExercise = async (id_ejercicio) => {
    if (!(await modal.confirm("¿Estás seguro de eliminar este ejercicio personalizado? Esta acción no se puede deshacer."))) return;
    try {
      await api.delete(`/api/v1/exercises/${id_ejercicio}`);
      await modal.alert("Ejercicio eliminado exitosamente.");
      loadData();
    } catch (err) {
      await modal.alert("Error al eliminar: Es posible que esté en uso en alguna rutina.");
    }
  };

  const handleDeactivateStudent = async (id) => {
    if (!(await modal.confirm("¿Estás seguro de dar de baja a este alumno?"))) return;
    try {
      await api.delete(`/api/v1/coaches/students/${id}`);
      await modal.alert("Alumno dado de baja lógicamente con éxito.");
      loadData();
    } catch (error) {
      await modal.alert(`Error: ${error.message}`);
    }
  };

  const handleCreateInvitation = async (e) => {
    e.preventDefault();
    const destEmail = e.target['invite-email'].value.trim();
    try {
      const data = await api.post("/api/v1/coaches/invitations", { email_destinatario: destEmail || null });
      await modal.alert(`¡Invitación creada con éxito!\nCódigo UUIDv4: ${data.codigo_unico}`);
      e.target.reset();
      loadData();
    } catch (error) {
      await modal.alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 p-4 md:p-8">
      <header className="glass-card rounded-2xl p-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-base font-bold bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">COACH HUB</h1>
            <p className="text-xs text-zinc-400 truncate max-w-xs font-mono">{email}</p>
          </div>
        </div>

        <nav className="flex items-center gap-1">
          <button onClick={() => { setActivePanel('students'); setSelectedStudentId(null); }} className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${activePanel === 'students' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}>Alumnos</button>
          <button onClick={() => setActivePanel('exercises')} className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${activePanel === 'exercises' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}>Ejercicios</button>
          <button onClick={() => setActivePanel('routines')} className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${activePanel === 'routines' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}>Mis Rutinas</button>
          <button onClick={() => setActivePanel('audits')} className={`relative px-3 py-2 rounded-xl text-xs font-bold transition-all ${activePanel === 'audits' ? 'bg-amber-600 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}>
            Auditoría
            {audits.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-lg animate-pulse">{audits.length}</span>
            )}
          </button>
          <button onClick={() => { setEditingRoutine(null); setIsBuildingRoutine(true); }} className="px-3 py-2 rounded-xl text-xs font-bold transition-all bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 ml-2">Crear Rutina</button>
          <button onClick={() => setActivePanel('profile')} className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${activePanel === 'profile' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'} ml-2`}>Perfil</button>
          <button onClick={logout} className="px-3 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition-all border border-red-500/10 ml-2">Salir</button>
        </nav>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {activePanel === 'students' && (
          selectedStudentId ? (
            <div className="flex flex-col gap-4 w-full">
              <button onClick={() => setSelectedStudentId(null)} className="self-start px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-bold transition-all border border-zinc-700/50 flex items-center gap-2 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Volver a Mis Alumnos
              </button>
              <StudentProgress studentId={selectedStudentId} />
            </div>
          ) : (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card rounded-2xl p-6 shadow-lg md:col-span-1 flex flex-col gap-6">
              <div>
                <h2 className="text-lg font-bold text-zinc-100">Crear Invitación</h2>
                <p className="text-xs text-zinc-400 mt-1">Genera un código UUIDv4 para tus alumnos.</p>
              </div>
              <form onSubmit={handleCreateInvitation} className="flex flex-col gap-3">
                <input type="email" id="invite-email" placeholder="alumno@correo.com" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200" />
                <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 font-bold text-sm">Generar UUIDv4</button>
              </form>
              <div className="flex flex-col gap-3">
                <h3 className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Historial de Códigos</h3>
                <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                  {invitations.length === 0 ? <p className="text-xs text-zinc-500 italic">No hay códigos.</p> : invitations.map(inv => (
                    <div key={inv.id_invitacion} className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-800/40 flex flex-col gap-2">
                      <p className="text-xs font-mono break-all text-zinc-300 bg-zinc-950 p-2 rounded border border-zinc-850/60">{inv.codigo_unico}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="glass-card rounded-2xl p-6 shadow-lg md:col-span-2 flex flex-col gap-6">
              <div>
                <h2 className="text-lg font-bold text-zinc-100">Mis Alumnos Activos</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {students.length === 0 ? <p className="col-span-2 text-center text-zinc-500 text-sm">No tienes alumnos vinculados actualmente.</p> : students.map(alumno => (
                  <div key={alumno.id_usuario} className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/40 flex flex-col justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-zinc-100">{alumno.usuario.email.split('@')[0]}</h3>
                      <p className="text-[10px] text-zinc-500">{alumno.usuario.email}</p>
                      <p className="text-xs text-zinc-400 mt-2 font-medium">Objetivo: <span className="text-blue-400">{alumno.objetivo || "No definido"}</span></p>
                      <p className="text-xs text-zinc-400 mt-1 font-medium">Rutina: <span className={alumno.rutina_nombre ? "text-emerald-400" : "text-zinc-500"}>{alumno.rutina_nombre || "Ninguna asignada"}</span></p>
                    </div>
                    <div className="flex gap-2 w-full mt-2">
                      <button onClick={() => setSelectedStudentId(alumno.id_usuario)} className="flex-1 py-2 px-3 rounded-lg text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors border border-indigo-500/20">Ver Progreso</button>
                      <button onClick={() => handleDeactivateStudent(alumno.id_usuario)} className="flex-1 py-2 px-3 rounded-lg text-xs bg-red-950/20 hover:bg-red-900/40 text-red-400 border border-red-500/10 font-semibold transition-colors">Dar Baja</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
          )
        )}
        
        {activePanel === 'audits' && (
          <section className="glass-card rounded-2xl p-6 shadow-lg flex flex-col gap-6">
            <div>
              <h2 className="text-lg font-bold text-amber-500 flex items-center gap-2">⚠️ Red Flags (Auditoría)</h2>
              <p className="text-xs text-zinc-400 mt-1">Récords sospechosos o de nivel Élite que requieren tu validación manual.</p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {audits.length === 0 ? <p className="text-zinc-500 text-sm">No hay auditorías pendientes.</p> : audits.map(audit => (
                <div key={audit.id_log} className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 flex flex-col sm:flex-row justify-between gap-4 items-center">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-200">Alumno: <span className="text-blue-400">{audit.alumno_nombre}</span></h3>
                    <p className="text-xs text-zinc-400 mt-1">
                      Reclama <span className="text-emerald-400 font-bold">{audit.e1rm_logrado}kg</span> (e1RM) en <span className="text-white font-semibold">{audit.ejercicio_nombre}</span>.
                    </p>
                    <p className="text-xs text-amber-500/80 mt-1">Alcanza nivel: <span className="font-bold">{audit.nivel_alcanzado} {audit.subnivel_alcanzado}</span></p>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button onClick={() => handleResolveAudit(audit.id_log, 'aprobar')} className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-all">Aprobar</button>
                    <button onClick={() => handleResolveAudit(audit.id_log, 'rechazar')} className="flex-1 sm:flex-none px-4 py-2 bg-red-900/50 hover:bg-red-600 text-red-200 hover:text-white font-bold text-xs rounded-lg transition-all border border-red-500/30">Rechazar</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        
        {activePanel === 'exercises' && (
          <section className="glass-card rounded-2xl p-6 shadow-lg flex flex-col gap-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-zinc-100">Catálogo de Ejercicios</h2>
                <p className="text-xs text-zinc-400 mt-1">Ejercicios globales y tus ejercicios personalizados.</p>
              </div>
            </div>

            <div className="bg-zinc-900/60 border border-zinc-800/40 p-4 rounded-xl flex flex-col gap-4">
              <h3 className="text-sm font-bold text-emerald-500 uppercase tracking-widest">Crear Ejercicio Personalizado</h3>
              <form onSubmit={handleCreateExercise} className="flex flex-col gap-3">
                <input type="text" name="nombre" placeholder="Nombre del Ejercicio (Ej. Remo Pendlay)" required className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-zinc-200" />
                <textarea name="descripcion" placeholder="Instrucciones breves..." required className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-zinc-200 h-20 resize-none"></textarea>
                <input type="url" name="url_media" placeholder="URL de YouTube (Ej. https://youtube.com/watch?v=...)" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-zinc-200" />
                <button type="submit" className="w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-bold text-xs uppercase tracking-widest text-white transition-all">Añadir al Catálogo</button>
              </form>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
               {exercises.map(exe => (
                 <div key={exe.id_ejercicio} className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/40 flex flex-col justify-between items-start relative overflow-hidden gap-3">
                   {exe.id_entrenador && (
                     <div className="absolute top-0 right-0 bg-emerald-600/20 text-emerald-500 text-[9px] font-black uppercase px-2 py-1 border-b border-l border-emerald-500/20 rounded-bl-lg">
                       Personalizado
                     </div>
                   )}
                   <div className="flex gap-4 w-full">
                     <div className="h-16 w-16 bg-zinc-950 rounded-lg flex items-center justify-center flex-shrink-0 border border-zinc-800 overflow-hidden shadow-inner text-2xl">
                       {exe.url_media?.includes('youtube') ? '🎥' : exe.id_entrenador ? '🏋️‍♂️' : '🌐'}
                     </div>
                     <div className="pr-4 flex-1">
                       <h3 className="text-sm font-semibold text-zinc-200">{exe.nombre}</h3>
                       <p className="text-xs text-zinc-400 mt-1 leading-relaxed line-clamp-2">{exe.descripcion}</p>
                     </div>
                   </div>
                   {!exe.id_entrenador ? (
                     <button onClick={() => handleOverrideMedia(exe.id_ejercicio)} className="w-full mt-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs py-2 rounded-lg font-bold border border-zinc-700/50 transition-colors">
                       {exe.url_media?.includes('youtube') ? 'Editar mi Video 🎥' : 'Añadir mi Video 🎥'}
                     </button>
                   ) : (
                     <div className="flex gap-2 w-full mt-2">
                       <button onClick={() => handleEditCustomExercise(exe)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs py-2 rounded-lg font-bold border border-zinc-700/50 transition-colors">
                         Editar
                       </button>
                       <button onClick={() => handleDeleteCustomExercise(exe.id_ejercicio)} className="flex-1 bg-red-900/40 hover:bg-red-800/60 text-red-300 text-xs py-2 rounded-lg font-bold border border-red-900/50 transition-colors">
                         Eliminar
                       </button>
                     </div>
                   )}
                 </div>
               ))}
            </div>
          </section>
        )}

        {activePanel === 'routines' && (
          <section className="glass-card rounded-2xl p-6 shadow-lg flex flex-col gap-6">
            <h2 className="text-lg font-bold text-zinc-100">Mis Rutinas Activas</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {routines.map(rut => (
                 <div key={rut.id_rutina} className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/40 flex flex-col gap-3">
                   <div className="flex justify-between items-start">
                     <div>
                       <h3 className="text-sm font-semibold text-zinc-200">{rut.nombre_rutina}</h3>
                       <p className="text-xs text-blue-400 mt-1 font-mono">v{rut.version_id}</p>
                     </div>
                     <div className="flex gap-2">
                       <button 
                         onClick={() => { setEditingRoutine(rut); setIsBuildingRoutine(true); }}
                         className="px-2 py-1 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 rounded text-xs"
                       >
                         Editar
                       </button>
                       <button 
                         onClick={async () => {
                           if (!(await modal.confirm(`¿Duplicar la rutina "${rut.nombre_rutina}"?`))) return;
                           try {
                             await api.post(`/api/v1/routines/${rut.id_rutina}/duplicate`);
                             await modal.alert("Rutina duplicada exitosamente.");
                             loadData();
                           } catch(e) { await modal.alert(e.message); }
                         }}
                         className="px-2 py-1 bg-indigo-900/40 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-800/60 transition-colors rounded text-xs font-medium"
                       >
                         Duplicar
                       </button>
                     </div>
                   </div>
                   
                   <div className="mt-2 border-t border-zinc-800/50 pt-3">
                     <p className="text-[10px] text-zinc-500 uppercase mb-2">Asignar a Alumno</p>
                     <select 
                       className="w-full bg-zinc-950 border border-zinc-800 rounded p-1 text-xs text-zinc-300"
                       onChange={async (e) => {
                         if(!e.target.value) return;
                         try {
                           await api.post(`/api/v1/routines/${rut.id_rutina}/assign`, { id_alumno: e.target.value });
                           await modal.alert("Rutina asignada exitosamente.");
                           e.target.value = "";
                         } catch (err) {
                           await modal.alert(err.message);
                         }
                       }}
                     >
                       <option value="">Seleccionar Alumno...</option>
                       {students.map(s => <option key={s.id_usuario} value={s.id_usuario}>{s.usuario.email}</option>)}
                     </select>
                   </div>
                 </div>
               ))}
            </div>
          </section>
        )}

        {activePanel === 'profile' && (
          <section className="glass-card rounded-2xl p-6 shadow-lg max-w-xl mx-auto w-full flex flex-col gap-6">
            <h2 className="text-lg font-bold text-zinc-100">Mi Perfil Profesional</h2>
            
            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-zinc-900/40 border border-zinc-800">
               <div className="relative h-24 w-24 rounded-full border-2 border-blue-500 bg-zinc-950 overflow-hidden flex items-center justify-center shadow-lg shrink-0">
                 {profile.url_foto_perfil ? <img src={profile.url_foto_perfil} className="h-full w-full object-cover" /> : <span className="text-xs text-zinc-500 text-center">Sin Foto</span>}
               </div>
               <div className="flex flex-col gap-2 w-full">
                 <p className="text-xs text-zinc-400 font-semibold">Foto en Cloudflare R2</p>
                 <label className="cursor-pointer py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-center border border-zinc-700/60 block transition-colors">
                   Subir Nueva Foto
                   <input 
                     type="file" 
                     accept="image/*" 
                     className="hidden" 
                     onChange={async (e) => {
                       const file = e.target.files[0];
                       if (!file) return;
                       if (file.size > 5 * 1024 * 1024) {
                         await modal.alert("El archivo es demasiado grande. Máximo 5MB.");
                         return;
                       }
                       const formData = new FormData();
                       formData.append('file', file);
                       try {
                         await api.post('/api/v1/coaches/profile/image', formData, {
                           headers: { 'Content-Type': 'multipart/form-data' }
                         });
                         await modal.alert("Foto subida exitosamente.");
                         loadData();
                       } catch (error) {
                         await modal.alert("Error al subir foto: " + error.message);
                       }
                     }} 
                   />
                 </label>
               </div>
            </div>

            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                const nombre = e.target.nombre.value.trim() || null;
                const especialidad = e.target.especialidad.value.trim() || null;
                const biografia = e.target.biografia.value.trim() || null;
                const aniosRaw = e.target.anios.value.trim();
                const anios_experiencia = aniosRaw ? parseInt(aniosRaw) : null;
                
                try {
                  await api.put('/api/v1/coaches/profile', { nombre, especialidad, biografia, anios_experiencia });
                  await modal.alert("Perfil actualizado correctamente.");
                  loadData();
                } catch (error) {
                  await modal.alert("Error al actualizar perfil: " + error.message);
                }
              }}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1">
                <label className="text-xs text-zinc-400 font-semibold">Nombre Completo</label>
                <input name="nombre" defaultValue={profile.nombre || ""} placeholder="Ej. Juan Pérez" className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-zinc-400 font-semibold">Años de Experiencia</label>
                <input name="anios" type="number" min="0" defaultValue={profile.anios_experiencia || ""} placeholder="Ej. 5" className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-zinc-400 font-semibold">Especialidad</label>
                <input name="especialidad" defaultValue={profile.especialidad || ""} placeholder="Ej. Hipertrofia y Fuerza" className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-zinc-400 font-semibold">Biografía / Descripción</label>
                <textarea name="biografia" defaultValue={profile.biografia || ""} placeholder="Cuéntale a tus alumnos sobre ti..." className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white h-24 resize-none" />
              </div>
              <button type="submit" className="w-full py-3 mt-2 rounded-lg bg-blue-600 hover:bg-blue-500 font-bold text-xs uppercase tracking-widest text-white transition-all shadow-lg shadow-blue-500/20">
                Guardar Cambios
              </button>
            </form>
          </section>
        )}
      </div>

      {isBuildingRoutine && (
        <WorkoutBuilder 
          initialData={editingRoutine}
          onClose={() => { setIsBuildingRoutine(false); setEditingRoutine(null); }} 
          onSaveSuccess={() => { setIsBuildingRoutine(false); setEditingRoutine(null); loadData(); }} 
        />
      )}
    </div>
  );
}
