const API_BASE_URL = "http://localhost:8000";

// Obtener el JWT de la sesión
function getToken() {
  return localStorage.getItem("fitness_jwt") || sessionStorage.getItem("fitness_jwt");
}

// Cerrar sesión limpiando credenciales
export function logout() {
  localStorage.removeItem("fitness_jwt");
  sessionStorage.removeItem("fitness_jwt");
  localStorage.removeItem("fitness_user");
  sessionStorage.removeItem("fitness_user");
  window.location.reload();
}

// Wrapper Fetch centralizado
async function request(endpoint, options = {}) {
  const token = getToken();
  
  // Configurar headers por defecto
  const headers = {
    ...options.headers
  };

  // Inyectar JWT en cabeceras de autorización si está disponible
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Si recibimos un 401 Unauthorized, forzamos deslogueo inmediato por seguridad
    if (response.status === 401) {
      console.warn("[API] Token expirado o inválido. Forzando deslogueo.");
      logout();
      throw new Error("Sesión expirada. Por favor inicia sesión nuevamente.");
    }
    
    return response;
  } catch (error) {
    console.error(`[API Error] Error en petición ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  get: async (endpoint) => {
    const res = await request(endpoint, { method: "GET" });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || "Error en petición de lectura");
    }
    return res.json();
  },
  
  post: async (endpoint, body) => {
    const isFormData = body instanceof FormData;
    const res = await request(endpoint, {
      method: "POST",
      headers: isFormData ? {} : { "Content-Type": "application/json" },
      body: isFormData ? body : JSON.stringify(body)
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || "Error en petición de creación");
    }
    return res.json();
  },
  
  put: async (endpoint, body) => {
    const isFormData = body instanceof FormData;
    const res = await request(endpoint, {
      method: "PUT",
      headers: isFormData ? {} : { "Content-Type": "application/json" },
      body: isFormData ? body : JSON.stringify(body)
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || "Error en petición de actualización");
    }
    return res.json();
  },
  
  delete: async (endpoint) => {
    const res = await request(endpoint, { method: "DELETE" });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || "Error en petición de eliminación");
    }
    return res.json();
  }
};
