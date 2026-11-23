import { API_BASE_URL } from "./config";

// lib/swr-config.ts
export function buildApiUrl(endpoint: string): string {
  if (/^https?:\/\//i.test(endpoint)) {
    return endpoint;
  }

  return `${API_BASE_URL.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;
}

export async function fetcher<TResult>(url: string, init?: RequestInit): Promise<TResult> {
  const res = await fetch(buildApiUrl(url),
    init ?? { method: "GET" }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || res.statusText);
  }

  return res.json();
}

export async function postFetcher<TBody extends object, TResult>(
  url: string,
  { arg }: { arg: TBody }
): Promise<TResult | null> {
  const res = await fetch(buildApiUrl(url), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(arg),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || res.statusText);
  }
  return res.json().catch(() => null);
}

export async function updateFetcher<TBody extends object, TResult>(
  url: string,
  { arg }: { arg: TBody }
): Promise<TResult | null> {
  const res = await fetch(buildApiUrl(url), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(arg),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || res.statusText);
  }

  return res.json().catch(() => null);
}

export async function deleteFetcher(url: string) {
  const res = await fetch(buildApiUrl(url), {
    method: "DELETE",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || res.statusText);
  }

  return res.json().catch(() => null);
}

export const swrOptions = {
  fetcher,
  revalidateOnFocus: true, // Ricarica i dati quando torni sulla scheda del browser
  revalidateIfStale: true,  // Usa la cache ma aggiorna in background
  dedupingInterval: 5000,   // Evita chiamate duplicate se fatte entro 5 secondi
  errorRetryCount: 3,       // Riprova 3 volte in caso di errore di rete
};