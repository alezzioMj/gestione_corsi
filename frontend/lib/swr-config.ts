// lib/swr-config.ts
import { API_BASE_URL } from "./config";

export const fetcher = async (resource: string, init?: RequestInit) => {
  const url = resource.startsWith('http') ? resource : `${API_BASE_URL}${resource}`;
  
  const res = await fetch(url, init);

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const error = new Error(errorData.message || "Errore durante il recupero dei dati.");
    // Aggiungi info extra all'errore se serve
    (error as Error & { status?: number }).status = res.status;
    throw error;
  }

  return res.json();
};

export const swrOptions = {
  fetcher,
  revalidateOnFocus: true, // Ricarica i dati quando torni sulla scheda del browser
  revalidateIfStale: true,  // Usa la cache ma aggiorna in background
  dedupingInterval: 5000,   // Evita chiamate duplicate se fatte entro 5 secondi
  errorRetryCount: 3,       // Riprova 3 volte in caso di errore di rete
};