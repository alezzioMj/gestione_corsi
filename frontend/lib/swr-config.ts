import { API_BASE_URL } from "@/lib/config";

export type DeleteArg = { id: string | number; suffix?: string };
export type UpdateArg<TBody> = { id: string | number; body?: TBody; suffix?: string };
export type CreateArg<TBody> = { body?: TBody; id?: string | number; suffix?: string };

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

function buildTargetUrl(base: string, id?: string | number, suffix?: string): string {
  const cleanBase = base.replace(/\/$/, "");
  const idPart = id !== undefined ? `/${id}` : "";
  const suffixPart = suffix ? `/${suffix.replace(/^\/|\/$/g, "")}` : "";
  return `${cleanBase}${idPart}${suffixPart}`;
}

export async function fetcher<TResult>(url: string, init?: RequestInit): Promise<TResult> {
  const res = await fetch(buildApiUrl(url), init ?? { method: "GET" });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || res.statusText);
  }

  return res.json();
}

export async function postFetcher<TBody = undefined, TResult = unknown>(
  url: string,
  { arg }: { arg?: TBody | CreateArg<TBody> }
): Promise<TResult | null> {
  const isCreateArg =
    typeof arg === "object" &&
    arg !== null &&
    !(arg instanceof FormData) &&
    ("body" in arg || "id" in arg || "suffix" in arg);

  const payload = isCreateArg ? arg.body : arg;
  const targetUrl = isCreateArg
    ? buildTargetUrl(url, arg.id, arg.suffix)
    : buildTargetUrl(url);

  const { body, headers } =
    payload !== undefined ? buildBody(payload) : { body: undefined, headers: {} };

  const res = await fetch(buildApiUrl(targetUrl), {
    method: "POST",
    headers,
    body,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || res.statusText);
  }

  return res.status === 204 ? null : res.json().catch(() => null);
}

export async function updateFetcher<TBody = undefined, TResult = unknown>(
  base: string,
  { arg }: { arg: UpdateArg<TBody> }
): Promise<TResult | null> {
  const targetUrl = buildTargetUrl(base, arg.id, arg.suffix);
  const { body, headers } =
    arg.body !== undefined ? buildBody(arg.body) : { body: undefined, headers: {} };

  const res = await fetch(buildApiUrl(targetUrl), {
    method: "PUT",
    headers,
    body,
  });

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