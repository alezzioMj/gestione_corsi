"use client";

import {
    Stepper,
    Step,
    StepLabel,
    Button,
    Box,
} from "@mui/material";
import Typography from "@mui/material/Typography"; // Import Typography
import * as React from "react";
import StepForm from "./StepForm";
import { SedeFormInput } from "../../validation/sede.schema"
import { z } from "zod";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import StepDocenti from "./StepDocenti";
import { useRouter } from "next/navigation";
import StepReview from "./StepReview";
import { Docente, Programma } from "../../validation/types"
import { API_BASE_URL } from "@/lib/config";
import dynamic from "next/dynamic";

export interface ApiErrorBody {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

const StepProgrammazione = dynamic(
    () => import("./StepProgrammazione"),
    { ssr: false }
);

async function parseErrorResponse(res: Response): Promise<ApiErrorBody> {
    try {
        const data = await res.json();
        return {
            code: data.code ?? "UNKNOWN_ERROR",
            message: data.message ?? "Errore sconosciuto",
            details: data.details,
        };
    } catch {
        return { code: "UNKNOWN_ERROR", message: "Errore sconosciuto" };
    }
}

function messaggioErrore(err: ApiErrorBody): string {
    switch (err.code) {
        case "NO_TEACHER_FOR_MODULE":
            return `Nessun docente disponibile per il modulo "${err.details?.moduloTitolo}"`;
        case "INSUFFICIENT_SLOTS":
            return `Slot insufficienti: mancano ${err.details?.oreMancanti} ore per completare la schedulazione`;
        case "AULA_UNAVAILABLE":
            return "Nessuna aula disponibile per uno degli slot richiesti";
        case "MISSING_COURSE_DATES":
            return "Il corso non ha date di inizio/fine impostate";
        default:
            return err.message;
    }
}

export const formSchema = z.object({
    nome: z.string().min(1, "Il nome del corso è obbligatorio"),
    cliente: z.string().min(1, "Il cliente è obbligatorio"),
    sedi: z.array(z.string()).min(1, "Seleziona almeno una sede"),
    programmi: z.number().min(1, "Seleziona un programma"),
    docenti: z.array(z.string()).min(1, "Seleziona almeno un docente"),
    oreTotali: z.number().min(0, "Le ore totali non possono essere negative"), // Changed min to 0, dynamic validation will handle the lower bound
    moduliOrdinati: z.array(z.string()).min(1, "L'ordine dei moduli è obbligatorio"),
    dataInizio: z.string().min(1, "Data inizio obbligatoria"),
    dataFine: z.string().min(1, "Data fine obbligatoria"),
    giorni: z.array(z.number()).min(1, "Seleziona almeno un giorno di lezione"),
    mattina_inizio: z.string().min(1, "Orario obbligatorio"),
    mattina_fine: z.string().min(1, "Orario obbligatorio"),
    pomeriggio_inizio: z.string().min(1, "Orario obbligatorio"),
    pomeriggio_fine: z.string().min(1, "Orario obbligatorio"),
    note: z.string().optional(),
});

export type FormType = z.infer<typeof formSchema>;

// Interfacce per i dati arricchiti dal backend
export interface ModuloRelation {
    modulo_id: number;
    modulo: { titolo: string; n_ore?: number; competenza?: string; multiplo: boolean; };
    n_ripetizioni: number;
}

export interface ProgrammaConModuli extends Programma {
    programma_modulo: ModuloRelation[];
    durata_totale: number;
    ore_pratiche: number;
    ore_teoriche: number;
    ore_trasversali: number;
}

export interface DocenteConModuli extends Docente {
    docente_modulo: ModuloRelation[];
}

export default function MyStepper({ sedi, programmi, docenti }: {
    sedi: SedeFormInput[],
    programmi: ProgrammaConModuli[],
    docenti: DocenteConModuli[]
}) {
    const steps = ["Anagrafica corso", "Programmazione", "Docenti", "Conferma"];

    const dynamicSchema = React.useMemo(() => {
        return formSchema.superRefine((data, ctx) => {
            const selectedProgram = programmi.find(p => p.id === data.programmi);
            if (!selectedProgram) return;

            // 1. Identifica i moduli richiesti dal programma
            const requiredModuleIds = selectedProgram.programma_modulo?.map(pm => pm.modulo_id) || [];

            // 2. Identifica i moduli coperti dai docenti selezionati
            const coveredModuleIds = new Set<number>();
            data.docenti.forEach(cf => {
                const docente = docenti.find(d => d.codice_fiscale === cf);
                docente?.docente_modulo?.forEach(dm => coveredModuleIds.add(dm.modulo_id));
            });

            const missingModuleIds = requiredModuleIds.filter(id => !coveredModuleIds.has(id));

            if (missingModuleIds.length > 0) {
                const nomiModuliMancanti = selectedProgram.programma_modulo
                    .filter(pm => missingModuleIds.includes(pm.modulo_id))
                    .map(pm => pm.modulo.titolo)
                    .join(", ");

                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `Copertura insufficiente. Mancano docenti per: ${nomiModuliMancanti}`,
                    path: ["docenti"],
                });
            }

            // New validation for oreTotali
            if (selectedProgram.durata_totale && data.oreTotali < selectedProgram.durata_totale) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `Le ore totali non possono essere inferiori a quelle del programma selezionato (${selectedProgram.durata_totale}h).`,
                    path: ["oreTotali"],
                });
            }

        });
    }, [programmi, docenti]);

    const methods = useForm<FormType>({
        resolver: zodResolver(dynamicSchema),
        defaultValues: {
            cliente: "",
            nome: "",
            sedi: [],
            programmi: 0,
            docenti: [],
            moduliOrdinati: [],
            oreTotali: 0,
            dataInizio: "",
            dataFine: "",
            giorni: [],
            mattina_inizio: "09:00",
            mattina_fine: "13:00",
            pomeriggio_inizio: "14:00",
            pomeriggio_fine: "18:00",
            note: "",
        },
    });
    const [activeStep, setActiveStep] = React.useState(0);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [submitError, setSubmitError] = React.useState<string | null>(null);
    const router = useRouter();

    const onSubmit = async (data: FormType) => {
        const corsoData = {
            nome: data.nome,
            cliente: data.cliente,
            programma_id: data.programmi,
            n_ore: data.oreTotali,
            inizio: data.dataInizio,
            fine: data.dataFine,
            mattina_inizio: data.mattina_inizio,
            mattina_fine: data.mattina_fine,
            pomeriggio_inizio: data.pomeriggio_inizio,
            pomeriggio_fine: data.pomeriggio_fine,
            note: data.note,
        };

        setIsSubmitting(true);
        setSubmitError(null);

        let corsoId: number | null = null;

        try {
            // 1. Crea il corso
            const corsoResponse = await fetch(`${API_BASE_URL}/corsi`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(corsoData),
            });
            if (!corsoResponse.ok) throw await parseErrorResponse(corsoResponse);
            const newCorso = await corsoResponse.json();
            corsoId = newCorso.id;

            // 2. Associa i docenti
            const docentiResponse = await fetch(`${API_BASE_URL}/corsi/${corsoId}/docenti`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ docenti_cfs: data.docenti }),
            });
            if (!docentiResponse.ok) throw await parseErrorResponse(docentiResponse);

            // 3. Associa le sedi
            const sediResponse = await fetch(`${API_BASE_URL}/corsi/${corsoId}/sedi`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sedi_names: data.sedi }),
            });
            if (!sediResponse.ok) throw await parseErrorResponse(sediResponse);

            // 4. Genera le sessioni
            const scheduleResponse = await fetch(`${API_BASE_URL}/corsi/${corsoId}/schedule`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    giorniDisponibili: data.giorni,
                    ordine: data.moduliOrdinati.map((uniqueKey, index) => ({
                        modulo_id: Number(uniqueKey.split("-")[0]),
                        ordine: index + 1,
                    })),
                }),
            });
            if (!scheduleResponse.ok) throw await parseErrorResponse(scheduleResponse);

            alert("Corso creato con successo!");
            router.push(`/sessioni?corsoId=${corsoId}`);

        } catch (error) {
            const apiError = error as ApiErrorBody;
            setSubmitError(messaggioErrore(apiError));

            // Rollback: se il corso è stato creato ma un passo successivo è fallito,
            // eliminalo per evitare corsi "a metà" senza sessioni
            if (corsoId) {
                try {
                    await fetch(`${API_BASE_URL}/corsi/${corsoId}`, { method: "DELETE" });
                } catch {
                    console.error(`ATTENZIONE: rollback fallito, corso ${corsoId} rimasto orfano nel DB`);
                }
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNext = async () => {
        let fieldsToValidate: (keyof FormType)[] = [];

        if (activeStep === 0) {
            fieldsToValidate = ["nome", "cliente", "sedi", "dataInizio", "dataFine"];
        } else if (activeStep === 1) {
            fieldsToValidate = ["moduliOrdinati", "programmi", "oreTotali"];

        } else if (activeStep === 2) {
            fieldsToValidate = ["docenti", "giorni", "mattina_inizio", "mattina_fine", "pomeriggio_inizio", "pomeriggio_fine"];
        }

        const isStepValid = fieldsToValidate.length > 0
            ? await methods.trigger(fieldsToValidate as (keyof FormType)[])
            : true;

        if (isStepValid) {
            if (activeStep === steps.length - 1) {
                methods.handleSubmit(onSubmit)();
            } else {
                setActiveStep((prev) => prev + 1);
            }
        }
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    return (
        <FormProvider {...methods}>
            <Box sx={{ width: "100%" }}>
                <Stepper activeStep={activeStep}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {/* CONTENUTO */}
                <Box sx={{ mt: 3 }}>
                    {activeStep === 0 && <StepForm
                        sedi={sedi}
                        programmi={programmi}
                    />}
                    {activeStep === 1 && <StepProgrammazione programmi={programmi} />}
                    {activeStep === 2 && <StepDocenti docenti={docenti}></StepDocenti>}
                    {activeStep === 3 && <StepReview docenti={docenti} programmi={programmi} />}
                </Box>

                {/* BOTTONI */}
                <Box sx={{ mt: 2 }}>
                    <Button disabled={activeStep === 0} onClick={handleBack}>
                        Indietro
                    </Button>

                    <Button onClick={handleNext} disabled={isSubmitting}>
                        {activeStep === steps.length - 1 ? (isSubmitting ? "Invio..." : "Fine") : "Avanti"}
                    </Button>
                </Box>
                {submitError && (
                    <Typography color="error" sx={{ mt: 2 }}>
                        {submitError}
                    </Typography>
                )}
            </Box >
        </FormProvider>
    );
}