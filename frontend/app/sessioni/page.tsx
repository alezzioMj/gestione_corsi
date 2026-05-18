import SessionFilterAndDisplay from "@/components/SessionFilterAndDisplay";
import { API_BASE_URL } from "@/lib/config";

type Sessione = {
    id: number;
    corso_id: number;
    data: string;
}

// 1. In Next.js 15, searchParams deve essere una Promise
interface CorsoSessionsPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function getAllCorsi() {
    const res = await fetch(`${API_BASE_URL}/corsi`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
}

async function getAllSessions() {
    const res = await fetch(`${API_BASE_URL}/sessioni/full`, { cache: "no-store" });
    if (!res.ok) throw new Error("Errore nel recupero di tutte le sessioni");
    return res.json();
}

export default async function SessionsPage({ searchParams }: CorsoSessionsPageProps) {
    // 2. Risolviamo la Promise prima di accedere alle sue proprietà
    const resolvedSearchParams = await searchParams;
    const corsoIdFilter = resolvedSearchParams.corsoId;

    // Carichiamo dati iniziali lato server per velocità
    const [allSessions, allCorsi] = await Promise.all([
        getAllSessions(),
        getAllCorsi()
    ]);

    // Filtraggio iniziale basato sul parametro appena scompattato
    const initialSessions = corsoIdFilter 
        ? allSessions.filter((s: Sessione) => s.corso_id === Number(corsoIdFilter))
        : allSessions;

    return (
        <SessionFilterAndDisplay 
            initialSessions={initialSessions} 
            allCorsi={allCorsi} 
            initialCorsoIdFilter={corsoIdFilter}
        />
    );
}