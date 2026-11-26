"use client";

import { Alert } from "@mui/material";
import { useFormContext } from "react-hook-form";
import type { FormType } from "@progetto/shared/validation/types";
import type { DocenteWithRelations } from "@progetto/shared/validation/docente.schema";
import type { Sede } from "@progetto/shared/validation/sede.schema";
import BozzeEditor from "@/components/Sessioni/BozzeEditor";

interface Props {
    corsoId: number | null;
    docenti: DocenteWithRelations<"docente_modulo">[];
    sedi: Sede[];
}

export default function StepBozzeSessioni({ corsoId, docenti, sedi }: Props) {
    const { getValues } = useFormContext<FormType>();

    if (!corsoId) {
        return <Alert severity="info">Completa prima i dati del corso per generare le bozze delle sessioni.</Alert>;
    }

    const docentiScelti = getValues("docenti");
    const sediScelte = getValues("sedi").map(Number);

    return (
        <BozzeEditor
            corsoId={corsoId}
            docenti={docenti.filter((d) => docentiScelti.includes(d.codice_fiscale))}
            sedi={sedi.filter((s) => sediScelte.includes(s.id))}
        />
    );
}