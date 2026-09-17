"use client";
"use client";

import * as React from "react";
import {
    Stepper,
    Step,
    StepLabel,
    Button,
    Box,
    Typography,
} from "@mui/material";
import { z } from "zod";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

import { SedeFormInput } from "@shared/validation/sede.schema";
import { creaCorsoCompleto } from "@/lib/corsi/createCorsoRollback";
import { messaggioErrore } from "@/lib/errors/errorMessage";
import { ApiErrorBody } from "@shared/validation/types"
import {
    formSchema,
    FormType,
    ProgrammaConModuli,
    DocenteConModuli,
} from "../../validation/corso-form.schema";

import StepDocenti from "./StepDocenti";
import StepReview from "./StepReview";
import StepForm from "./StepForm";

const StepProgrammazione = dynamic(
    () => import("./StepProgrammazione"),
    { ssr: false }
);

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

            const requiredModuleIds = selectedProgram.programma_modulo?.map(pm => pm.modulo_id) || [];

            const coveredModuleIds = new Set<number>();
            data.docenti.forEach(cf => {
                const docente = docenti.find(d => d.codice_fiscale === cf);
                docente?.docente_modulo?.forEach(dm => coveredModuleIds.add(dm.modulo_id));
            });

            // FFiltra moduli senza docente
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
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const corsoId = await creaCorsoCompleto({
                corsoData: {
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
                },
                docenti: data.docenti,
                sedi: data.sedi,
                giorniDisponibili: data.giorni,
                ordine: data.moduliOrdinati.map((uniqueKey, index) => ({
                    modulo_id: Number(uniqueKey.split("-")[0]),
                    ordine: index + 1,
                })),
            });

            alert("Corso creato con successo!");
            router.push(`/sessioni?corsoId=${corsoId}`);
        } catch (error) {
            setSubmitError(messaggioErrore(error as ApiErrorBody));
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