"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SessionsPage;
const SessionFilterAndDisplay_1 = __importDefault(require("@/components/SessionFilterAndDisplay"));
async function getAllCorsi() {
    const res = await fetch(`http://localhost:3001/corsi`, { cache: "no-store" });
    if (!res.ok)
        return [];
    return res.json();
}
async function getAllSessions() {
    const res = await fetch(`http://localhost:3001/sessioni/full`, { cache: "no-store" });
    if (!res.ok)
        throw new Error("Errore nel recupero di tutte le sessioni");
    return res.json();
}
async function SessionsPage({ searchParams }) {
    const corsoIdFilter = searchParams.corsoId;
    // Carichiamo dati iniziali lato server per velocità
    const [allSessions, allCorsi] = await Promise.all([
        getAllSessions(),
        getAllCorsi()
    ]);
    // Filtraggio iniziale (opzionale, il componente client lo gestirà comunque)
    const initialSessions = corsoIdFilter
        ? allSessions.filter((s) => s.corso_id === Number(corsoIdFilter))
        : allSessions;
    return (<SessionFilterAndDisplay_1.default initialSessions={initialSessions} allCorsi={allCorsi} initialCorsoIdFilter={corsoIdFilter}/>);
}
