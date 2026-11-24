"use client";

import * as React from "react";
import {
    Stepper,
    Step,
    StepLabel,
    Button,
    Box,
} from "@mui/material";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

import { CreateSede } from "@progetto/shared/validation/sede.schema";
import StepDocenti from "./StepDocenti";
import StepReview from "./StepReview";
import { useSnackbar } from "../SnackbarContext";
import { formSchema, FormType } from "@progetto/shared/validation/types";
import { useState } from "react";
import { ProgrammaWithRelations } from "@progetto/shared/validation/programma.schema";
import { DocenteWithRelations } from "@progetto/shared/validation/docente.schema";
import { CommessaWithRelations } from "@progetto/shared/validation/commessa.schema";
import StepForm from "./StepForm";
import { getErrorMessage } from "@/utils/errorMessages";
import { API_BASE_URL } from "@/lib/config";

const StepProgrammazione = dynamic(
    () => import("./StepProgrammazione"),
    { ssr: false }
);

export default function MyStepper({ sedi, programmi, docenti, commesse }: {
    sedi: CreateSede[],
    programmi: ProgrammaWithRelations<"corso" | "programma_modulo">[],
    docenti: DocenteWithRelations<"docente_modulo">[],
    commesse: CommessaWithRelations<"cliente">[]
}) {
    const steps = ["Anagrafica corso", "Programmazione", "Docenti", "Conferma"];

    const { showMessage } = useSnackbar();

    const dynamicSchema = React.useMemo(() => {
        return formSchema.superRefine((data, ctx) => {
            const selectedProgram = programmi.find(p => p.id === data.programmi);
            if (!selectedProgram) return;

            const requiredModuleIds = selectedProgram.programma_modulo?.map(m => m.id) || [];

            const coveredModuleIds = new Set<number>();
            data.docenti.forEach(cf => {
                const docente = docenti.find(d => d.codice_fiscale === cf);
                docente?.docente_modulo?.forEach(dm => coveredModuleIds.add(dm.modulo_id));
            });

            const missingModuleIds = requiredModuleIds.filter(id => !coveredModuleIds.has(id));

            if (missingModuleIds.length > 0) {
                const nomiModuliMancanti = selectedProgram.programma_modulo
                    .filter(m => missingModuleIds.includes(m.id))
                    .map(m => m.modulo?.titolo)
                    .join(", ");

                ctx.addIssue({
                    code: "custom",
                    path: ["docenti"], // il campo a cui agganciare l'errore nel form
                    message: `Copertura insufficiente. Mancano docenti per: ${nomiModuliMancanti}`,
                });
            }

            if (selectedProgram.durata_totale && data.oreTotali < selectedProgram.durata_totale) {
                ctx.addIssue({
                    code: "custom",
                    message: `Le ore totali non possono essere inferiori a quelle del programma selezionato (${selectedProgram.durata_totale}h).`,
                    path: ["oreTotali"],
                });
            }

        });
    }, [programmi, docenti]);

    const methods = useForm({
        resolver: zodResolver(dynamicSchema),
        defaultValues: {
            commessa_id: 0,
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
    const [activeStep, setActiveStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const onSubmit = async (data: FormType) => {
        setIsSubmitting(true);

        try {
            const response = await fetch(`${API_BASE_URL}/corsi`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    nome: data.nome,
                    commessa_id: data.commessa_id,
                    programma_id: data.programmi,
                    n_ore: data.oreTotali,
                    inizio: data.dataInizio,
                    fine: data.dataFine,
                    mattina_inizio: data.mattina_inizio,
                    mattina_fine: data.mattina_fine,
                    pomeriggio_inizio: data.pomeriggio_inizio,
                    pomeriggio_fine: data.pomeriggio_fine,
                    note: data.note,

                    docenti: data.docenti,
                    sedi: data.sedi.map(Number),
                    giorniDisponibili: data.giorni,

                    ordine: data.moduliOrdinati.map((uniqueKey, index) => ({
                        modulo_id: Number(uniqueKey.split("-")[0]),
                        ordine: index + 1,
                    })),
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || error.error || "Errore creazione corso");
            }

            const result = await response.json();
            const corsoId = result.corso.id;

            showMessage("Corso creato con successo!", "success");
            router.push(`/calendario`);
        } catch (error) {
            showMessage(getErrorMessage(error), "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNext = async () => {
        let fieldsToValidate: (keyof FormType)[] = [];

        if (activeStep === 0) {
            fieldsToValidate = ["nome", "commessa_id", "sedi", "dataInizio", "dataFine"];
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

                <Box sx={{ mt: 3 }}>
                    {activeStep === 0 && <StepForm
                        sedi={sedi}
                        commesse={commesse}
                    />}
                    {activeStep === 1 && <StepProgrammazione programmi={programmi} />}
                    {activeStep === 2 && <StepDocenti docenti={docenti}></StepDocenti>}
                    {activeStep === 3 && <StepReview docenti={docenti} programmi={programmi} commesse={commesse} />}
                </Box>

                <Box sx={{ mt: 2 }}>
                    <Button disabled={activeStep === 0} onClick={handleBack}>
                        Indietro
                    </Button>

                    <Button onClick={handleNext} disabled={isSubmitting}>
                        {activeStep === steps.length - 1 ? (isSubmitting ? "Invio..." : "Fine") : "Avanti"}
                    </Button>
                </Box>
            </Box >
        </FormProvider>
    );
}