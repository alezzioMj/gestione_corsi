import { API_BASE_URL } from "./config";

type DeleteArg = { id: string | number };
export type UpdateArg<TBody> = { id: string | number; body: TBody };


function buildBody(arg: unknown): { body: BodyInit; headers: HeadersInit } {
  if (arg instanceof FormData) {
    // Nessun Content-Type: lo imposta il browser con il boundary
    return { body: arg, headers: {} };
  }
  return {
    body: JSON.stringify(arg),
    headers: { "Content-Type": "application/json" },
  };
}

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
  const { body, headers } = buildBody(arg);

  const res = await fetch(buildApiUrl(url), {
    method: "POST",
    headers,
    body
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || res.statusText);
  }
  return res.json().catch(() => null);
}

export async function updateFetcher<TBody, TResult>(
    base: string,
    { arg }: { arg: UpdateArg<TBody> }
): Promise<TResult | null> {
    const { body, headers } = buildBody(arg.body);
    const res = await fetch(buildApiUrl(`${base}/${arg.id}`), { method: "PUT", headers, body });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || res.statusText);
    }
    return res.status === 204 ? null : res.json().catch(() => null);
}

export async function deleteFetcher(
  base: string,
  { arg }: { arg: DeleteArg }
) {

  const res = await fetch(buildApiUrl(`${base}/${arg.id}`), {
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