"use strict";
"use client";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formSchema = void 0;
exports.default = MyStepper;
const material_1 = require("@mui/material");
const Typography_1 = __importDefault(require("@mui/material/Typography")); // Import Typography
const React = __importStar(require("react"));
const StepForm_1 = __importDefault(require("./StepForm"));
const zod_1 = require("zod");
const react_hook_form_1 = require("react-hook-form");
const zod_2 = require("@hookform/resolvers/zod");
const StepDocenti_1 = __importDefault(require("./StepDocenti"));
const navigation_1 = require("next/navigation");
const StepReview_1 = __importDefault(require("./StepReview"));
exports.formSchema = zod_1.z.object({
    nomeCorso: zod_1.z.string().min(1, "Il nome del corso è obbligatorio"), // Nuovo campo
    cliente: zod_1.z.string().min(1, "Il cliente è obbligatorio"),
    sedi: zod_1.z.array(zod_1.z.string()).min(1, "Seleziona almeno una sede"),
    programmi: zod_1.z.number().min(1, "Seleziona un programma"), // Ora è l'ID del programma
    docenti: zod_1.z.array(zod_1.z.string()).min(1, "Seleziona almeno un docente"),
    oreTotali: zod_1.z.coerce.number().min(1, "Le ore totali devono essere maggiori di 0"),
    dataInizio: zod_1.z.string().min(1, "Data inizio obbligatoria"),
    dataFine: zod_1.z.string().min(1, "Data fine obbligatoria"),
    giorni: zod_1.z.array(zod_1.z.number()).min(1, "Seleziona almeno un giorno di lezione"),
    mattina_inizio: zod_1.z.string().min(1, "Orario obbligatorio"),
    mattina_fine: zod_1.z.string().min(1, "Orario obbligatorio"),
    pomeriggio_inizio: zod_1.z.string().min(1, "Orario obbligatorio"),
    pomeriggio_fine: zod_1.z.string().min(1, "Orario obbligatorio"),
    note: zod_1.z.string().optional(),
});
function MyStepper({ sedi, programmi, docenti }) {
    const steps = ["Anagrafica corso", "Docenti", "Conferma"];
    const dynamicSchema = React.useMemo(() => {
        return exports.formSchema.superRefine((data, ctx) => {
            const selectedProgram = programmi.find(p => p.id === data.programmi);
            if (!selectedProgram)
                return;
            // 1. Identifica i moduli richiesti dal programma
            const requiredModuleIds = selectedProgram.programma_modulo?.map(pm => pm.modulo_id) || [];
            // 2. Identifica i moduli coperti dai docenti selezionati
            const coveredModuleIds = new Set();
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
                    code: zod_1.z.ZodIssueCode.custom,
                    message: `Copertura insufficiente. Mancano docenti per: ${nomiModuliMancanti}`,
                    path: ["docenti"],
                });
            }
        });
    }, [programmi, docenti]);
    const methods = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_2.zodResolver)(dynamicSchema),
        defaultValues: {
            cliente: "",
            nomeCorso: "", // Nuovo campo
            sedi: [],
            programmi: 0, // Default a 0 per l'ID del programma
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
    const [submitError, setSubmitError] = React.useState(null);
    const router = (0, navigation_1.useRouter)();
    const onSubmit = async (data) => {
        // Estrai solo i dati per la creazione del corso principale
        const corsoData = {
            nome: data.nomeCorso, // Includi il nome del corso
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
                body: JSON.stringify({ docenti_cfs: data.docenti }), // Invia un array di CF
            });
            if (!docentiResponse.ok) {
                const errorData = await docentiResponse.json();
                throw new Error(errorData.message || "Errore durante l'associazione dei docenti");
            }
            // 3. Associa le sedi al corso
            const sediResponse = await fetch(`/api/corsi/${corsoId}/sedi`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sedi_names: data.sedi }), // Invia un array di nomi sede
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
                body: JSON.stringify({ giorniDisponibili: data.giorni }), // Usa la chiave corretta per il backend
            });
            if (!generateSessionsResponse.ok) {
                const errorData = await generateSessionsResponse.json();
                throw new Error(errorData.message || "Errore durante la generazione delle sessioni");
            }
            alert("Corso creato con successo!");
            // Reindirizza alla nuova pagina che mostra le sessioni per il corso appena creato
            router.push(`/sessioni?corsoId=${corsoId}`);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Si è verificato un errore sconosciuto.";
            console.error("Errore nell'invio dei dati:", message);
            setSubmitError(message);
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const handleNext = async () => {
        let fieldsToValidate = [];
        if (activeStep === 0) {
            fieldsToValidate = ["nomeCorso", "cliente", "sedi", "programmi", "oreTotali", "dataInizio", "dataFine"]; // Aggiungi nomeCorso
        }
        else if (activeStep === 1) {
            fieldsToValidate = ["docenti", "giorni", "mattina_inizio", "mattina_fine", "pomeriggio_inizio", "pomeriggio_fine"];
        }
        const isStepValid = fieldsToValidate.length > 0
            ? await methods.trigger(fieldsToValidate)
            : true;
        if (isStepValid) {
            if (activeStep === steps.length - 1) {
                methods.handleSubmit(onSubmit)(); // Triggera la sottomissione finale
            }
            else {
                setActiveStep((prev) => prev + 1);
            }
        }
    };
    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };
    return (<react_hook_form_1.FormProvider {...methods}>
            <material_1.Box sx={{ width: "100%" }}>
                <material_1.Stepper activeStep={activeStep}>
                    {steps.map((label) => (<material_1.Step key={label}>
                            <material_1.StepLabel>{label}</material_1.StepLabel>
                        </material_1.Step>))}
                </material_1.Stepper>

                {/* CONTENUTO */}
                <material_1.Box sx={{ mt: 3 }}>
                    {activeStep === 0 && <StepForm_1.default sedi={sedi} programmi={programmi}/>}
                    {activeStep === 1 && <StepDocenti_1.default docenti={docenti}></StepDocenti_1.default>}
                    {activeStep === 2 && <StepReview_1.default docenti={docenti}/>}
                </material_1.Box>

                {/* BOTTONI */}
                <material_1.Box sx={{ mt: 2 }}>
                    <material_1.Button disabled={activeStep === 0} onClick={handleBack}>
                        Indietro
                    </material_1.Button>

                    <material_1.Button onClick={handleNext} disabled={isSubmitting}>
                        {activeStep === steps.length - 1 ? (isSubmitting ? "Invio..." : "Fine") : "Avanti"}
                    </material_1.Button>
                </material_1.Box>
                {submitError && (<Typography_1.default color="error" sx={{ mt: 2 }}>
                        {submitError}
                    </Typography_1.default>)}
            </material_1.Box>
        </react_hook_form_1.FormProvider>);
}
