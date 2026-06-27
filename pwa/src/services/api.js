const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

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

  // Manual timeout for max compatibility
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...config,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    // Si recibimos un 401 Unauthorized y NO es el endpoint de login, forzamos deslogueo
    if (response.status === 401 && !endpoint.includes('/login')) {
      console.warn("[API] Token expirado o inválido. Forzando deslogueo.");
      logout();
      throw new Error("Sesión expirada. Por favor inicia sesión nuevamente.");
    }

    // Si recibimos un 403 Forbidden (Interceptor Financiero B2B)
    if (response.status === 403) {
      const errorData = await response.clone().json().catch(() => ({}));
      const detail = errorData.detail || "";
      if (detail.includes("Pago") || detail.includes("temporalmente") || detail.includes("suspendido")) {
        console.warn("[API] Bloqueo financiero detectado.");
        // Guardar el mensaje para que la vista de bloqueo lo lea
        sessionStorage.setItem("fitness_blocked_reason", detail);
        window.location.href = "/blocked";
        throw new Error(detail);
      }
    }
    
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      console.error(`[API Error] Timeout al contactar ${endpoint}.`);
      throw new Error("OFFLINE");
    }
    if (error.name === 'TypeError' && (error.message === 'Failed to fetch' || error.message.includes('NetworkError'))) {
      console.error(`[API Error] Error de red al contactar ${endpoint}.`);
      throw new Error("OFFLINE");
    }
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
    if (res.status === 204) {
      return null;
    }
    return res.json().catch(() => null);
  }
};
