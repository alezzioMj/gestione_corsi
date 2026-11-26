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
import { useState } from "react";

import { Sede } from "@progetto/shared/validation/sede.schema";
import StepDocenti from "./StepDocenti";
import StepReview from "./StepReview";
import StepBozzeSessioni from "./StepBozzeSessioni";
import { formSchema, FormType } from "@progetto/shared/validation/types";
import { ProgrammaWithRelations } from "@progetto/shared/validation/programma.schema";
import { DocenteWithRelations } from "@progetto/shared/validation/docente.schema";
import { CommessaWithRelations } from "@progetto/shared/validation/commessa.schema";
import StepForm from "./StepForm";
import { useCreateEntity } from "@/hooks/useCreateEntity";
import { useSnackbar } from "@/components/SnackbarContext";
import { useDeleteEntity } from "@/hooks/useDeleteEntity";
import { useConfirm } from "../ConfirmContext";

const StepProgrammazione = dynamic(
    () => import("./StepProgrammazione"),
    { ssr: false }
);

const EMPTY: FormType = {
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
};

type CreateCorsoPayload = {
    nome: string;
    commessa_id: number;
    programma_id: number;
    n_ore: number;
    inizio: string | null;
    fine: string | null;
    mattina_inizio: string;
    mattina_fine: string;
    pomeriggio_inizio: string;
    pomeriggio_fine: string;
    note: string;
    docenti: string[];
    sedi: number[];
    giorniDisponibili: number[];
    ordine: { modulo_id: number; ordine: number }[];
};

type CorsoBozzeResponse = {
    corso: { id: number };
};

export default function MyStepper({
    sedi,
    programmi,
    docenti,
    commesse,
}: {
    sedi: Sede[];
    programmi: ProgrammaWithRelations<"corso" | "programma_modulo">[];
    docenti: DocenteWithRelations<"docente_modulo">[];
    commesse: CommessaWithRelations<"cliente">[];
}) {
    const steps = [
        "Anagrafica corso",
        "Programmazione",
        "Docenti",
        "Bozze sessioni",
        "Conferma",
    ];

    const [createdCorsoId, setCreatedCorsoId] = useState<number | null>(null);

    const { showMessage } = useSnackbar();
    const router = useRouter();

    const { submitting: submittingCorso, create: createCorso } = useCreateEntity<
        CreateCorsoPayload,
        CorsoBozzeResponse
    >("/corsi");

    const { remove: eliminaCorso } = useDeleteEntity("/corsi");
    const { confirm } = useConfirm();

    const creaCorsoEGeneraBozze = async (data: FormType) => {
        if (createdCorsoId) { setActiveStep(3); return; } // già creato: non duplicare

        const res = await createCorso(buildCorsoPayload(data));
        if (!res.ok) return;

        const id = res.data?.corso?.id;
        if (!id) { showMessage("Corso creato ma id mancante", "error"); return; }

        setCreatedCorsoId(id);
        setActiveStep(3);
    };

    const { submitting: submittingSchedulazione } =
        useCreateEntity<FormType, CorsoBozzeResponse>("/corsi");

    const { submitting: submittingConferma, create: confermaSessioni } =
        useCreateEntity<undefined, unknown>("/corsi");

    const dynamicSchema = React.useMemo(() => {
        return formSchema.superRefine((data, ctx) => {
            const selectedProgram = programmi.find((p) => p.id === data.programmi);
            if (!selectedProgram) return;

            const requiredModuleIds =
                selectedProgram.programma_modulo?.map((m) => m.modulo_id) || [];

            const coveredModuleIds = new Set<number>();
            data.docenti.forEach((cf) => {
                const docente = docenti.find((d) => d.codice_fiscale === cf);
                docente?.docente_modulo?.forEach((dm) =>
                    coveredModuleIds.add(dm.modulo_id)
                );
            });

            const missingModuleIds = requiredModuleIds.filter(
                (id) => !coveredModuleIds.has(id)
            );

            if (missingModuleIds.length > 0) {
                const nomiModuliMancanti = Array.from(
                    new Set(
                        selectedProgram.programma_modulo
                            .filter((m) => missingModuleIds.includes(m.modulo_id))
                            .map((m) => m.modulo?.titolo)
                            .filter(Boolean)
                    )
                ).join(", ");

                ctx.addIssue({
                    code: "custom",
                    path: ["docenti"],
                    message: `Copertura insufficiente. Mancano docenti per: ${nomiModuliMancanti}`,
                });
            }

            if (
                selectedProgram.durata_totale &&
                data.oreTotali < selectedProgram.durata_totale
            ) {
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
        defaultValues: EMPTY,
    });

    const [activeStep, setActiveStep] = useState(0);
    const isSubmitting =
        submittingCorso || submittingSchedulazione || submittingConferma;

    const buildCorsoPayload = (data: FormType): CreateCorsoPayload => ({
        nome: data.nome,
        commessa_id: data.commessa_id,
        programma_id: data.programmi,
        n_ore: data.oreTotali,
        inizio: data.dataInizio ? data.dataInizio : null,
        fine: data.dataFine ? data.dataFine : null,
        mattina_inizio: data.mattina_inizio,
        mattina_fine: data.mattina_fine,
        pomeriggio_inizio: data.pomeriggio_inizio,
        pomeriggio_fine: data.pomeriggio_fine,
        note: data.note ?? "",
        docenti: data.docenti,
        sedi: data.sedi.map(Number),
        giorniDisponibili: data.giorni,
        ordine: data.moduliOrdinati.map((uniqueKey, index) => ({
            modulo_id: Number(uniqueKey.split("-")[0]),
            ordine: index + 1,
        })),
    });

    const onSubmit = async () => {
        if (!createdCorsoId) return;
        const res = await confermaSessioni(undefined, createdCorsoId, "scheduling/conferma");
        if (!res.ok) {
            setActiveStep(3); // i conflitti si vedono e si correggono qui
            return;
        }
        router.push("/calendario");
    };

    const handleAnnulla = async () => {
        if (!createdCorsoId) return;
        const ok = await confirm({
            title: "Annullare la creazione?",
            message: "Il corso e le bozze delle sessioni verranno eliminati.",
            cancelText: "Continua",
            confirmText: "Elimina corso",
            confirmColor: "error",
        });
        if (ok && (await eliminaCorso(createdCorsoId))) router.push("/corsi");
    };

    const handleNext = async () => {
        let fieldsToValidate: (keyof FormType)[] = [];

        if (activeStep === 0) {
            fieldsToValidate = [
                "nome",
                "commessa_id",
                "sedi",
                "dataInizio",
                "dataFine",
            ];
        } else if (activeStep === 1) {
            fieldsToValidate = ["moduliOrdinati", "programmi", "oreTotali"];
        } else if (activeStep === 2) {
            fieldsToValidate = [
                "docenti",
                "giorni",
                "mattina_inizio",
                "mattina_fine",
                "pomeriggio_inizio",
                "pomeriggio_fine",
            ];
        }

        const isStepValid =
            fieldsToValidate.length > 0
                ? await methods.trigger(fieldsToValidate)
                : true;

        if (!isStepValid) return;

        if (activeStep === 2) {
            await creaCorsoEGeneraBozze(methods.getValues());
            return;
        }

        if (activeStep === steps.length - 1) {
            await onSubmit();
        } else {
            setActiveStep((prev) => prev + 1);
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
                    {activeStep === 0 && <StepForm sedi={sedi} commesse={commesse} />}
                    {activeStep === 1 && <StepProgrammazione programmi={programmi} />}
                    {activeStep === 2 && <StepDocenti docenti={docenti} />}
                    {activeStep === 3 && (
                        <StepBozzeSessioni corsoId={createdCorsoId} docenti={docenti} sedi={sedi} />
                    )}

                    <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                        <Button disabled={activeStep === 0 || activeStep === 3 || isSubmitting} onClick={handleBack}>
                            Indietro
                        </Button>
                        <Button onClick={handleNext} disabled={isSubmitting}>
                            {activeStep === steps.length - 1 ? (isSubmitting ? "Invio..." : "Conferma e Fine")
                                : activeStep === 2 ? (isSubmitting ? "Generazione..." : "Genera sessioni")
                                    : "Avanti"}
                        </Button>
                        {createdCorsoId && (
                            <Button color="error" onClick={handleAnnulla} disabled={isSubmitting} sx={{ ml: "auto" }}>
                                Annulla e elimina corso
                            </Button>
                        )}
                    </Box>
                    {activeStep === 4 && (
                        <StepReview
                            docenti={docenti}
                            programmi={programmi}
                            commesse={commesse}
                        />
                    )}
                </Box>
            </Box>
        </FormProvider>
    );
}