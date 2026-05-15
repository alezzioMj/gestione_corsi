"use client";

import SessionsTable from "./SessionTable";
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

export const formSchema = z.object({
    nomeCorso: z.string().min(1, "Il nome del corso è obbligatorio"),
    cliente: z.string().min(1, "Il cliente è obbligatorio"),
    sedi: z.array(z.string()).min(1, "Seleziona almeno una sede"),
    programmi: z.number().min(1, "Seleziona un programma"),
    docenti: z.array(z.string()).min(1, "Seleziona almeno un docente"),
    oreTotali: z.coerce.number().min(1, "Le ore totali devono essere maggiori di 0"),
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
    modulo: { titolo: string };
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
    const steps = ["Anagrafica corso", "Docenti", "Conferma"];

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
        });
    }, [programmi, docenti]);

    const methods = useForm<FormType>({
        resolver: zodResolver(dynamicSchema),
        defaultValues: {
            cliente: "",
            nomeCorso: "",
            sedi: [],
            programmi: 0,
            docenti: [],
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
            nome: data.nomeCorso,
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
        try {
            // 1. Crea il corso principale
            const corsoResponse = await fetch("/api/corsi", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(corsoData),
            });
            if (!corsoResponse.ok) {
                const errorData = await corsoResponse.json();
                throw new Error(errorData.message || "Errore durante la creazione del corso");
            }
            const newCorso = await corsoResponse.json();
            const corsoId = newCorso.id;

            // 2. Associa i docenti al corso
            const docentiResponse = await fetch(`/api/corsi/${corsoId}/docenti`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ docenti_cfs: data.docenti }),
            });
            if (!docentiResponse.ok) {
                const errorData = await docentiResponse.json();
                throw new Error(errorData.message || "Errore durante l'associazione dei docenti");
            }

            // 3. Associa le sedi al corso
            const sediResponse = await fetch(`/api/corsi/${corsoId}/sedi`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sedi_names: data.sedi }),
            });
            if (!sediResponse.ok) {
                const errorData = await sediResponse.json();
                throw new Error(errorData.message || "Errore durante l'associazione delle sedi");
            }

            // 4. Genera le sessioni per il corso
            // Questa chiamata attiverà il scheduler.service.ts nel backend
            const generateSessionsResponse = await fetch(`/api/corsi/${corsoId}/schedule`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ giorniDisponibili: data.giorni }),
            });
            if (!generateSessionsResponse.ok) {
                const errorData = await generateSessionsResponse.json();
                throw new Error(errorData.message || "Errore durante la generazione delle sessioni");
            }

            alert("Corso creato con successo!");
            // Reindirizza alla nuova pagina che mostra le sessioni per il corso appena creato
            router.push(`/sessioni?corsoId=${corsoId}`);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Si è verificato un errore sconosciuto.";
            console.error("Errore nell'invio dei dati:", message);
            setSubmitError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNext = async () => {
        let fieldsToValidate: (keyof FormType)[] = [];

        if (activeStep === 0) {
            fieldsToValidate = ["nomeCorso", "cliente", "sedi", "programmi", "oreTotali", "dataInizio", "dataFine"];
        } else if (activeStep === 1) {
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
                    {activeStep === 1 && <StepDocenti docenti={docenti}></StepDocenti>}
                    {activeStep === 2 && <StepReview docenti={docenti} />}
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