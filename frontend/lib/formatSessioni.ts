export interface DocenteLegenda {
    cf: string;
    nome: string;
    colore: string;
}

export interface SlotOrario {
    iniziale: string;
    colore: string;
    docenteNome?: string;
}

export interface GiornoOrario {
    mattina: (SlotOrario | null)[];
    pomeriggio: (SlotOrario | null)[];
}

export interface RigaCommessa {
    id: number;
    nomeCorso: string;
    aula: string;
    richiestaOre: number;
    totaleOre: number;
    docenti: DocenteLegenda[];
    sessioniMap: Record<string, GiornoOrario>;
}

export function trasformaSessioniInCommesse(
    sessioniFromDb: any[],
    corsiAnagrafica: any[] = [],
    moduliAnagrafica: any[] = [],
    docentiAnagrafica: any[] = []
): RigaCommessa[] {
    const commesseMap: Record<number, RigaCommessa> = {};

    sessioniFromDb.forEach((sess) => {
        const corsoId = sess.corso_id;
        if (!corsoId) return;

        // 1. RECUPERO DATI REALI DEL CORSO
        const corsoReale = corsiAnagrafica.find(c => c.id === corsoId);
        const nomeCorso = corsoReale?.nome || sess.corso?.nome || `Commessa #${corsoId}`;
        const oreRichieste = corsoReale?.ore_richieste || corsoReale?.n_ore || sess.corso?.n_ore || 0;
        const oreTotali = corsoReale?.ore_totali || corsoReale?.n_ore || sess.corso?.n_ore || 0;
        const aulaNome = `AULA ${sess.aula_id || 1}`;

        // 2. RECUPERO DOCENTE REALE E COLORE
        const docenteReale = docentiAnagrafica.find(d => d.cf === sess.docente_cf);
        const nomeDocente = docenteReale 
            ? `${docenteReale.nome} ${docenteReale.cognome}` 
            : (sess.docente?.nome ? `${sess.docente.nome} ${sess.docente.cognome}` : sess.docente_cf || "N/D");
        
        // Assegna il colore dinamico dal docente o usa un colore di fallback se non definito
        const coloreDocente = docenteReale?.colore || sess.docente?.colore || "#3b82f6";

        if (!commesseMap[corsoId]) {
            commesseMap[corsoId] = {
                id: corsoId,
                nomeCorso,
                aula: aulaNome,
                richiestaOre: oreRichieste,
                totaleOre: oreTotali,
                docenti: [],
                sessioniMap: {}
            };
        }

        // 3. RECUPERO DATA
        const dataStr = String(sess.data).split("T")[0];
        
        if (!commesseMap[corsoId].sessioniMap[dataStr]) {
            commesseMap[corsoId].sessioniMap[dataStr] = {
                mattina: [null, null, null, null],
                pomeriggio: [null, null, null, null]
            };
        }

        // 4. RECUPERO MODULO REALE (Iniziale)
        const moduloReale = moduliAnagrafica.find(m => m.id === sess.modulo_id);
        const iniziale = moduloReale?.nome ? moduloReale.nome.charAt(0).toUpperCase() : "M";

        // Aggiunge il docente alla legenda della commessa se non già presente
        if (sess.docente_cf && !commesseMap[corsoId].docenti.some(d => d.cf === sess.docente_cf)) {
            commesseMap[corsoId].docenti.push({
                cf: sess.docente_cf,
                nome: nomeDocente,
                colore: coloreDocente
            });
        }

        const slotInfo: SlotOrario = {
            iniziale,
            colore: coloreDocente,
            docenteNome: nomeDocente
        };

        // 5. ASSEGNAZIONE SLOT ORARI (Sempre 4 ore per blocco)
        const oraInizio = parseInt(sess.ora_inizio?.split(":")[0] || "8", 10);
        const isMattina = oraInizio < 13;

        // Riempie esattamente tutti e 4 gli slot della mezza giornata corrispondente
        for (let i = 0; i < 4; i++) {
            if (isMattina) {
                commesseMap[corsoId].sessioniMap[dataStr].mattina[i] = slotInfo;
            } else {
                commesseMap[corsoId].sessioniMap[dataStr].pomeriggio[i] = slotInfo;
            }
        }
    });

    return Object.values(commesseMap);
}