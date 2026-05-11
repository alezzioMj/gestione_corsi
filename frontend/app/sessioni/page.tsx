import SessionFilterAndDisplay from "@/components/SessionFilterAndDisplay";

interface CorsoSessionsPageProps {
    searchParams: { [key: string]: string | string[] | undefined };
}

async function getAllCorsi() {
    const res = await fetch(`http://localhost:3001/corsi`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
}

async function getAllSessions() {
    const res = await fetch(`http://localhost:3001/sessioni/full`, { cache: "no-store" });
    if (!res.ok) throw new Error("Errore nel recupero di tutte le sessioni");
    return res.json();
}

export default async function SessionsPage({ searchParams }: CorsoSessionsPageProps) {
    const corsoIdFilter = searchParams.corsoId;

    // Carichiamo dati iniziali lato server per velocità
    const [allSessions, allCorsi] = await Promise.all([
        getAllSessions(),
        getAllCorsi()
    ]);

    // Filtraggio iniziale (opzionale, il componente client lo gestirà comunque)
    const initialSessions = corsoIdFilter 
        ? allSessions.filter((s: any) => s.corso_id === Number(corsoIdFilter))
        : allSessions;

    return (
        <SessionFilterAndDisplay 
            initialSessions={initialSessions} 
            allCorsi={allCorsi} 
            initialCorsoIdFilter={corsoIdFilter}
        />
    );
}