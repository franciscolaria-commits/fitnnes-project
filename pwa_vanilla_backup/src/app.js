import { api, logout } from "./api.js";

// ==========================================
// MÁQUINA DE ESTADO & ENRUTADO DE VISTAS (SPA)
// ==========================================

const views = {
  auth: document.getElementById("auth-view"),
  coach: document.getElementById("coach-view"),
  student: document.getElementById("student-view")
};

const coachPanels = {
  students: document.getElementById("panel-students"),
  exercises: document.getElementById("panel-exercises"),
  profile: document.getElementById("panel-profile")
};

function showView(viewName) {
  Object.keys(views).forEach((key) => {
    if (key === viewName) {
      views[key].classList.remove("hidden");
    } else {
      views[key].classList.add("hidden");
    }
  });
}

function showCoachPanel(panelName) {
  Object.keys(coachPanels).forEach((key) => {
    if (key === panelName) {
      coachPanels[key].classList.remove("hidden");
    } else {
      coachPanels[key].classList.add("hidden");
    }
  });

  // Estilos de botones de navegación
  const btnStudents = document.getElementById("nav-btn-students");
  const btnExercises = document.getElementById("nav-btn-exercises");
  const btnProfile = document.getElementById("nav-btn-profile");

  btnStudents.className = panelName === "students" 
    ? "px-3 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white transition-all" 
    : "px-3 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all";
    
  btnExercises.className = panelName === "exercises" 
    ? "px-3 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white transition-all" 
    : "px-3 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all";
    
  btnProfile.className = panelName === "profile" 
    ? "px-3 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white transition-all" 
    : "px-3 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all";
}

// Verificar sesión al cargar
function initSession() {
  const token = localStorage.getItem("fitness_jwt") || sessionStorage.getItem("fitness_jwt");
  const userRaw = localStorage.getItem("fitness_user") || sessionStorage.getItem("fitness_user");

  if (token && userRaw) {
    const user = JSON.parse(userRaw);
    if (user.rol === "entrenador") {
      document.getElementById("coach-navbar-email").innerText = user.email;
      showView("coach");
      showCoachPanel("students");
      loadCoachDashboardData();
    } else if (user.rol === "alumno") {
      document.getElementById("student-info-email").innerText = user.email;
      showView("student");
      loadStudentDashboardData();
    }
  } else {
    showView("auth");
    showAuthPanel("login");
  }
}

// Conmutar entre paneles de auth
const authPanels = {
  login: document.getElementById("panel-login"),
  registerCoach: document.getElementById("panel-register-coach"),
  registerStudent: document.getElementById("panel-register-student")
};

function showAuthPanel(panelName) {
  Object.keys(authPanels).forEach((key) => {
    if (key === panelName) {
      authPanels[key].classList.remove("hidden");
    } else {
      authPanels[key].classList.add("hidden");
    }
  });
}

// Listeners de alternancia de Auth
document.getElementById("btn-go-register-coach").addEventListener("click", () => showAuthPanel("registerCoach"));
document.getElementById("btn-go-register-student").addEventListener("click", () => showAuthPanel("registerStudent"));
document.getElementById("btn-back-login-1").addEventListener("click", () => showAuthPanel("login"));
document.getElementById("btn-back-login-2").addEventListener("click", () => showAuthPanel("login"));


// ==========================================
// FLUJO 1: AUTENTICACIÓN (LOGIN / REGISTRO)
// ==========================================

// Formulario de Login
document.getElementById("form-login").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    // fastapi OAuth2PasswordRequestForm requiere x-www-form-urlencoded o FormData
    const formData = new FormData();
    formData.append("username", email);
    formData.append("password", password);

    const data = await api.post("/api/v1/auth/login", formData);
    
    // Guardar sesión
    localStorage.setItem("fitness_jwt", data.access_token);
    const userData = { email: data.email, rol: data.rol, id_usuario: data.id_usuario };
    localStorage.setItem("fitness_user", JSON.stringify(userData));

    initSession();
  } catch (error) {
    alert(`Error al iniciar sesión: ${error.message}`);
  }
});

// Formulario de Registro Entrenador
document.getElementById("form-register-coach").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("reg-coach-email").value;
  const password = document.getElementById("reg-coach-password").value;

  try {
    await api.post("/api/v1/auth/register", {
      email: email,
      password: password,
      rol: "entrenador"
    });
    alert("¡Cuenta de entrenador creada con éxito! Ahora inicia sesión.");
    showAuthPanel("login");
  } catch (error) {
    alert(`Error de registro: ${error.message}`);
  }
});

// Formulario de Registro Alumno (Con Validación de Invitación)
document.getElementById("form-register-student").addEventListener("submit", async (e) => {
  e.preventDefault();
  const code = document.getElementById("reg-student-code").value.trim();
  const email = document.getElementById("reg-student-email").value;
  const password = document.getElementById("reg-student-password").value;
  const weight = document.getElementById("reg-student-weight").value;
  const goal = document.getElementById("reg-student-goal").value;

  try {
    await api.post("/api/v1/auth/register-student", {
      codigo_invitacion: code,
      email: email,
      password: password,
      peso_corporal_actual: weight ? parseFloat(weight) : null,
      objetivo: goal || null
    });
    alert("¡Registro completado exitosamente con tu invitación! Iniciá sesión con tus credenciales.");
    showAuthPanel("login");
  } catch (error) {
    alert(`Error en registro de alumno: ${error.message}`);
  }
});


// ==========================================
// FLUJO 2: GESTIÓN DEL ENTRENADOR
// ==========================================

// Carga centralizada de datos del Dashboard del Coach
function loadCoachDashboardData() {
  loadStudents();
  loadInvitations();
  loadExercises();
  loadProfile();
}

// 2.1 Cargar y Renderizar Alumnos
async function loadStudents() {
  const studentsList = document.getElementById("students-list");
  studentsList.innerHTML = "<p class='text-zinc-500 text-xs italic col-span-2'>Cargando alumnos...</p>";

  try {
    const data = await api.get("/api/v1/coaches/students");
    
    // Filtrar solo los alumnos activos
    const activos = data.filter(s => s.estado_activo);

    if (activos.length === 0) {
      studentsList.innerHTML = `
        <div class="col-span-2 text-center py-8 text-zinc-500 text-sm">
          No tienes alumnos vinculados actualmente. Generá una invitación a la izquierda para vincular tu primer alumno.
        </div>
      `;
      return;
    }

    studentsList.innerHTML = activos.map(alumno => `
      <div class="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/40 flex flex-col justify-between gap-3">
        <div>
          <h3 class="text-sm font-semibold text-zinc-200">${alumno.usuario.email}</h3>
          <p class="text-xs text-zinc-400 mt-1 font-medium">Objetivo: <span class="text-blue-400">${alumno.objetivo || "No definido"}</span></p>
          <p class="text-xs text-zinc-400 font-medium">Peso actual: <span class="text-blue-400">${alumno.peso_corporal_actual ? alumno.peso_corporal_actual + " kg" : "No registrado"}</span></p>
        </div>
        <button onclick="deactivateStudent('${alumno.id_usuario}')" class="w-full py-2 px-3 rounded-lg text-xs bg-red-950/20 hover:bg-red-500/10 text-red-400 border border-red-500/10 transition-all font-semibold">
          Dar de Baja
        </button>
      </div>
    `).join("");
  } catch (error) {
    studentsList.innerHTML = `<p class='text-red-400 text-xs col-span-2'>Error al cargar alumnos: ${error.message}</p>`;
  }
}

// Dar de baja lógica a un alumno
window.deactivateStudent = async function(id) {
  if (!confirm("¿Estás seguro de que deseas dar de baja lógicamente a este alumno? El registro histórico se mantendrá intacto.")) {
    return;
  }

  try {
    await api.put(`/api/v1/coaches/students/${id}`, {
      estado_activo: false
    });
    alert("Alumno dado de baja lógicamente con éxito.");
    loadStudents();
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
};

// 2.2 Crear y Cargar Invitaciones (UUIDv4 Inquebrantable)
document.getElementById("form-create-invitation").addEventListener("submit", async (e) => {
  e.preventDefault();
  const emailInput = document.getElementById("invite-email");
  const email = emailInput.value.trim();

  try {
    const data = await api.post("/api/v1/coaches/invitations", {
      email_destinatario: email || null
    });
    
    alert(`¡Invitación creada con éxito!\nCódigo UUIDv4: ${data.codigo_unico}`);
    emailInput.value = "";
    loadInvitations();
  } catch (error) {
    alert(`Error al generar invitación: ${error.message}`);
  }
});

async function loadInvitations() {
  const invitationsList = document.getElementById("invitations-list");
  invitationsList.innerHTML = "<p class='text-zinc-500 text-xs italic'>Cargando...</p>";

  try {
    const data = await api.get("/api/v1/coaches/invitations");

    if (data.length === 0) {
      invitationsList.innerHTML = "<p class='text-xs text-zinc-500 italic'>No has generado códigos aún.</p>";
      return;
    }

    invitationsList.innerHTML = data.map(invite => {
      const isExpired = new Date(invite.fecha_expiracion) < new Date();
      let badgeClass = "bg-blue-500/10 text-blue-400 border-blue-500/20";
      let statusText = "Disponible";

      if (invite.is_used) {
        badgeClass = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
        statusText = "Registrado";
      } else if (isExpired) {
        badgeClass = "bg-red-500/10 text-red-400 border-red-500/20";
        statusText = "Expirado";
      }

      return `
        <div class="p-3 rounded-lg bg-zinc-900/40 border border-zinc-800/40 flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <span class="inline-flex px-2 py-0.5 rounded text-[10px] font-bold border ${badgeClass}">
              ${statusText}
            </span>
            <button onclick="navigator.clipboard.writeText('${invite.codigo_unico}'); alert('Código copiado!')" class="text-[10px] text-zinc-400 hover:text-white underline">
              Copiar UUID
            </button>
          </div>
          <p class="text-xs font-mono break-all text-zinc-300 bg-zinc-950 p-2 rounded border border-zinc-850/60">${invite.codigo_unico}</p>
          ${invite.email_destinatario ? `<p class="text-[10px] text-zinc-500">Destinatario: ${invite.email_destinatario}</p>` : ""}
        </div>
      `;
    }).join("");
  } catch (error) {
    invitationsList.innerHTML = `<p class='text-red-400 text-xs'>Error al cargar códigos: ${error.message}</p>`;
  }
}

// 2.3 Catálogo de Ejercicios y Flujo de Subida R2 Decoupled
async function loadExercises() {
  const exercisesCatalog = document.getElementById("exercises-catalog");
  exercisesCatalog.innerHTML = "<p class='text-zinc-500 text-xs italic col-span-2'>Cargando catálogo...</p>";

  try {
    const data = await api.get("/api/v1/exercises");

    if (data.length === 0) {
      exercisesCatalog.innerHTML = "<p class='text-zinc-500 text-xs col-span-2 text-center py-4'>No hay ejercicios registrados.</p>";
      return;
    }

    exercisesCatalog.innerHTML = data.map(exe => `
      <div class="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/40 flex gap-4 items-start">
        <div class="h-16 w-16 bg-zinc-950 rounded-lg flex items-center justify-center flex-shrink-0 border border-zinc-800 overflow-hidden shadow-inner">
          ${exe.url_media ? `<img src="${exe.url_media}" class="h-full w-full object-contain" />` : `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          `}
        </div>
        <div>
          <h3 class="text-sm font-semibold text-zinc-200 flex items-center gap-1.5">
            ${exe.nombre}
            ${exe.id_entrenador ? `<span class="inline-flex px-1.5 py-0.5 text-[9px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded">Custom</span>` : ""}
          </h3>
          <p class="text-xs text-zinc-400 mt-1 leading-relaxed">${exe.descripcion || "Sin descripción."}</p>
        </div>
      </div>
    `).join("");
  } catch (error) {
    exercisesCatalog.innerHTML = `<p class='text-red-400 text-xs col-span-2'>Error al cargar ejercicios: ${error.message}</p>`;
  }
}

// Crear Ejercicio Custom (R2 Decoupled PUT Integration)
document.getElementById("form-create-exercise").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("exe-name").value;
  const desc = document.getElementById("exe-desc").value;
  const fileInput = document.getElementById("exe-file");
  const file = fileInput.files[0];
  const uploadStatus = document.getElementById("exe-upload-status");
  const submitBtn = document.getElementById("exe-submit-btn");

  uploadStatus.innerText = "";
  submitBtn.disabled = true;

  try {
    let finalUrlMedia = null;

    if (file) {
      uploadStatus.innerText = "Solicitando firma R2...";
      uploadStatus.className = "text-[11px] text-yellow-400 text-center mt-1";

      // 1. Solicitar presigned URL al backend
      const presignedData = await api.post("/api/v1/storage/presigned", {
        filename: file.name,
        content_type: file.type || "application/octet-stream"
      });

      uploadStatus.innerText = "Subiendo archivo binario directo a Cloudflare R2...";
      uploadStatus.className = "text-[11px] text-blue-400 text-center mt-1";

      // 2. Subir directamente el archivo binario a R2 con PUT
      const uploadRes = await fetch(presignedData.upload_url, {
        method: "PUT",
        headers: {
          "Content-Type": file.type || "application/octet-stream"
        },
        body: file
      });

      if (!uploadRes.ok) {
        throw new Error(`Error en la subida R2: ${uploadRes.statusText}`);
      }

      finalUrlMedia = presignedData.public_url;
    }

    // 3. Crear el ejercicio custom en la DB con la URL multimedia
    uploadStatus.innerText = "Registrando ejercicio en catálogo...";
    uploadStatus.className = "text-[11px] text-indigo-400 text-center mt-1";

    await api.post("/api/v1/exercises/custom", {
      nombre: name,
      descripcion: desc || null,
      url_media: finalUrlMedia
    });

    alert("¡Ejercicio personalizado creado de forma exitosa!");
    
    // Resetear formulario
    document.getElementById("form-create-exercise").reset();
    document.getElementById("exe-file-display").innerText = "Sin archivo";
    uploadStatus.innerText = "";
    loadExercises();
  } catch (error) {
    alert(`Error al crear ejercicio custom: ${error.message}`);
    uploadStatus.innerText = `Error: ${error.message}`;
    uploadStatus.className = "text-[11px] text-red-400 text-center mt-1";
  } finally {
    submitBtn.disabled = false;
  }
});

// Listener para actualizar el display del nombre del archivo en el selector
document.getElementById("exe-file").addEventListener("change", (e) => {
  const file = e.target.files[0];
  document.getElementById("exe-file-display").innerText = file ? file.name : "Sin archivo";
});


// 2.4 Perfil Profesional del Entrenador (R2 Direct Photo Upload)
async function loadProfile() {
  try {
    const profile = await api.get("/api/v1/coaches/profile");
    document.getElementById("prof-specialty").value = profile.especialidad || "";
    document.getElementById("prof-bio").value = profile.biografia || "";

    const previewImg = document.getElementById("profile-img-preview");
    const svgPlaceholder = document.getElementById("profile-svg-placeholder");

    if (profile.url_foto_perfil) {
      previewImg.src = profile.url_foto_perfil;
      previewImg.classList.remove("hidden");
      svgPlaceholder.classList.add("hidden");
    } else {
      previewImg.classList.add("hidden");
      svgPlaceholder.classList.remove("hidden");
    }
  } catch (error) {
    console.error("Error al cargar perfil:", error);
  }
}

// Actualizar Perfil
document.getElementById("form-update-profile").addEventListener("submit", async (e) => {
  e.preventDefault();
  const specialty = document.getElementById("prof-specialty").value;
  const bio = document.getElementById("prof-bio").value;

  try {
    await api.put("/api/v1/coaches/profile", {
      especialidad: specialty || null,
      biografia: bio || null
    });
    alert("¡Perfil profesional guardado de forma exitosa!");
    loadProfile();
  } catch (error) {
    alert(`Error al guardar perfil: ${error.message}`);
  }
});

// Subida de Foto de Perfil Directo a R2
document.getElementById("profile-photo-input").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const statusSpan = document.getElementById("profile-photo-status");
  statusSpan.innerText = "Procesando firma...";
  statusSpan.className = "text-[11px] text-yellow-400 mt-1 block";

  try {
    // 1. Obtener presigned URL
    const presignedData = await api.post("/api/v1/storage/presigned", {
      filename: file.name,
      content_type: file.type || "image/jpeg"
    });

    statusSpan.innerText = "Subiendo foto directamente a R2...";
    statusSpan.className = "text-[11px] text-blue-400 mt-1 block";

    // 2. Subir directamente el binario a R2 con PUT
    const uploadRes = await fetch(presignedData.upload_url, {
      method: "PUT",
      headers: {
        "Content-Type": file.type || "image/jpeg"
      },
      body: file
    });

    if (!uploadRes.ok) {
      throw new Error("No se pudo subir la foto de perfil al storage");
    }

    statusSpan.innerText = "Actualizando perfil profesional...";
    statusSpan.className = "text-[11px] text-indigo-400 mt-1 block";

    // 3. Modificar la foto en la DB de Entrenador
    await api.put("/api/v1/coaches/profile", {
      url_foto_perfil: presignedData.public_url
    });

    statusSpan.innerText = "¡Foto de perfil actualizada!";
    statusSpan.className = "text-[11px] text-emerald-400 mt-1 block font-semibold";
    
    loadProfile();
  } catch (error) {
    alert(`Error al cambiar foto de perfil: ${error.message}`);
    statusSpan.innerText = `Error: ${error.message}`;
    statusSpan.className = "text-[11px] text-red-400 mt-1 block";
  }
});


// ==========================================
// FLUJO 3: GESTIÓN DEL ALUMNO
// ==========================================

async function loadStudentDashboardData() {
  try {
    // Para el alumno, cargamos sus ejercicios
    const exercises = await api.get("/api/v1/exercises");
    console.log(`[Alumno] ${exercises.length} ejercicios del catálogo cargados.`);

    // En la Fase 1 mostramos el nombre del entrenador
    // Hacemos una consulta rápida para el saludo
    const userRaw = localStorage.getItem("fitness_user") || sessionStorage.getItem("fitness_user");
    const user = JSON.parse(userRaw);
    document.getElementById("student-welcome-title").innerText = `¡Hola, atleta ${user.email.split('@')[0]}!`;
    document.getElementById("student-coach-name").innerText = "Coach Vinculado Correctamente";
  } catch (error) {
    console.error("Error al cargar dashboard de alumno:", error);
  }
}


// ==========================================
// ACCIONES DE NAVEGACIÓN Y CONFIGURACIÓN
// ==========================================

// Navbar Tabs del Entrenador
document.getElementById("nav-btn-students").addEventListener("click", () => showCoachPanel("students"));
document.getElementById("nav-btn-exercises").addEventListener("click", () => showCoachPanel("exercises"));
document.getElementById("nav-btn-profile").addEventListener("click", () => showCoachPanel("profile"));

// Deslogueo
document.getElementById("nav-btn-logout").addEventListener("click", logout);
document.getElementById("student-logout-btn").addEventListener("click", logout);

// Inicializar la sesión al entrar a la PWA
initSession();
