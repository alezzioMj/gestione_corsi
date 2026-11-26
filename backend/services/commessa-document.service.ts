import { prisma } from "../prisma";

export const getDatiSchedaCommessa = async (id: number) => {
    const commessa = await prisma.commessa.findUnique({
        where: { id },
        include: {
            cliente: true,
            corsi: {
                include: {
                    sessione: {
                        include: {
                            docente: true,
                            modulo: true,
                            sede: true,
                            aula: true,
                        },
                    },
                },
            },
        },
    });

    if (!commessa) {
        throw new Error("Commessa non trovata");
    }

    const sessioni = commessa.corsi
        .flatMap((corso) => corso.sessione)
        .sort((a, b) => {
            const dateDiff =
                a.data.getTime() - b.data.getTime();

            if (dateDiff !== 0) return dateDiff;

            return a.ora_inizio.localeCompare(b.ora_inizio);
        });

    const formatDate = (date: Date | null | undefined) =>
        date?.toLocaleDateString("it-IT") ?? "";

    return {
        codice_commessa: commessa.codice_commessa,
        codice_FT: commessa.codice_ft ?? "",
        codice_RLOM: commessa.codice_rlom ?? "",
        titolo_commessa: commessa.descrizione ?? "",
        cliente: commessa.cliente?.ragione_sociale ?? "",

        data_inizio: formatDate(
            sessioni[0]?.data
        ),

        data_fine: formatDate(
            sessioni[sessioni.length - 1]?.data
        ),

        n_ore: commessa.corsi.reduce(
            (totale, corso) => totale + (corso.n_ore ?? 0),
            0
        ),

        sessioni: sessioni.map((s, index) => ({
            n: index + 1,
            data: formatDate(s.data),
            ora_inizio: s.ora_inizio,
            ora_fine: s.ora_fine,
            modulo: s.modulo.titolo,
            docente: s.docente
                ? `${s.docente.cognome} ${s.docente.nome}`
                : "",
            stato: s.stato ?? "",
        })),
    };
};
