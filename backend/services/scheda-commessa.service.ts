import fs from "node:fs";
import path from "node:path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { prisma } from "../prisma";

const formatDate = (date: Date | null | undefined): string => {
    if (!date) return "";

    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();

    return `${day}/${month}/${year}`;
};

export const generaSchedaCommessa = async (commessaId: number): Promise<Buffer> => {
    const commessa = await prisma.commessa.findUnique({
        where: { id: commessaId },
        include: {
            cliente: true,
            corsi: {
                include: {
                    sessione: {
                        include: {
                            docente: true,
                            modulo: true,
                            sede: true,
                        },
                    },
                },
            },
        },
    });

    if (!commessa) {
        throw new Error("Commessa non trovata");
    }

    const corsi = commessa.corsi;

    const sessioni = corsi
        .flatMap((corso) => corso.sessione)
        .sort((a, b) => {
            const dateComparison = a.data.getTime() - b.data.getTime();

            if (dateComparison !== 0) {
                return dateComparison;
            }

            return a.ora_inizio.localeCompare(b.ora_inizio);
        });

    const dateInizio = corsi
        .map((corso) => corso.inizio)
        .filter((date): date is Date => date !== null)
        .sort((a, b) => a.getTime() - b.getTime())[0];

    const dateFine = corsi
        .map((corso) => corso.fine)
        .filter((date): date is Date => date !== null)
        .sort((a, b) => b.getTime() - a.getTime())[0];

    const sedi = [
        ...new Set(
            sessioni
                .map((sessione) =>`${sessione.sede?.indirizzo} ${sessione.sede?.civico}, ${sessione.sede?.citta} ${sessione.sede?.provincia}`)
                .filter((nome): nome is string => Boolean(nome))
        ),
    ];

    const dati = {
        codice_commessa: commessa.codice_commessa ?? "",
        codice_FT: commessa.codice_ft ?? "",
        codice_RLOM: commessa.codice_rlom ?? "",
        titolo_commessa: commessa.descrizione ?? "",
        cliente: commessa.cliente?.ragione_sociale ?? "",

        // Questi due campi non risultano presenti nei dati condivisi.
        apl: "",
        tipologia: "",

        sede: sedi.join(", "),
        data_inizio: formatDate(dateInizio),
        data_fine: formatDate(dateFine),
        n_ore: corsi.reduce(
            (totale, corso) => totale + (corso.n_ore ?? 0),
            0
        ),

        sessioni: sessioni.map((sessione, index) => ({
            n: index + 1,
            data: formatDate(sessione.data),
            ora_inizio: sessione.ora_inizio ?? "",
            ora_fine: sessione.ora_fine ?? "",
            modulo: sessione.modulo?.titolo ?? "",
            docente: sessione.docente
                ? `${sessione.docente.nome} ${sessione.docente.cognome}`
                : "",
            stato: sessione.stato ?? "",
        })),
    };

    const templatePath = path.join(
        process.cwd(),
        "templates",
        "scheda-commessa.docx"
    );

    const content = fs.readFileSync(templatePath, "binary");
    const zip = new PizZip(content);

    const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
    });

    doc.render(dati);

    return doc.toBuffer();
};