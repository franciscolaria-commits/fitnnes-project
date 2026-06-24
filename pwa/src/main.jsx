import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { get, set, del } from 'idb-keyval'
import './index.css'
import App from './App.jsx'

import { ModalProvider } from './components/ModalProvider.jsx'

// Query Client configurado para Offline-First
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // Mantener en caché por 24 horas
      staleTime: 1000 * 60 * 5, // Refetchear en background tras 5 minutos
      refetchOnWindowFocus: true, // Siempre buscar actualizaciones al volver a la pestaña
    },
  },
})

// Persister usando IndexedDB (idb-keyval)
const asyncStoragePersister = createAsyncStoragePersister({
  storage: {
    getItem: async (key) => await get(key),
    setItem: async (key, value) => await set(key, value),
    removeItem: async (key) => await del(key),
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: asyncStoragePersister }}
    >
      <ModalProvider>
        <App />
      </ModalProvider>
    </PersistQueryClientProvider>
  </StrictMode>,
)
