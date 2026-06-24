import { get, set } from 'idb-keyval';
import { api } from './api.js';

const QUEUE_KEY = 'offline_sync_queue';

// Agrega una sesión a la cola offline
export async function enqueueSession(sessionData) {
  const queue = (await get(QUEUE_KEY)) || [];
  queue.push(sessionData);
  await set(QUEUE_KEY, queue);
}

// Intenta sincronizar toda la cola con el servidor
export async function syncOfflineQueue() {
  if (!navigator.onLine) return;
  
  const queue = (await get(QUEUE_KEY)) || [];
  if (queue.length === 0) return;

  const newQueue = [];
  
  for (const sessionData of queue) {
    try {
      // Iniciar sesión
      const sessionStart = await api.post('/api/v1/sessions/start', { id_rutina: sessionData.id_rutina });
      // Completar sesión
      await api.put(`/api/v1/sessions/${sessionStart.id_sesion}/complete`, {
        fecha_fin: sessionData.fecha_fin,
        sets: sessionData.sets
      });
      console.log("[OfflineSync] Sesión sincronizada con éxito:", sessionStart.id_sesion);
    } catch (error) {
      console.error("[OfflineSync] Error sincronizando sesión:", error);
      // Si falla por otra cosa que no sea red (ej: 400 Bad Request), igual lo droppeamos o lo guardamos?
      // Por ahora, si hay error de red, lo devolvemos a la cola.
      if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
        newQueue.push(sessionData);
      }
    }
  }

  await set(QUEUE_KEY, newQueue);
}

// Iniciar listener
export function initOfflineSync() {
  window.addEventListener('online', () => {
    console.log("[OfflineSync] Conexión restaurada, intentando sincronizar...");
    syncOfflineQueue();
  });
  
  // Intentar sincronizar al arrancar la app por si ya hay internet
  syncOfflineQueue();
}
