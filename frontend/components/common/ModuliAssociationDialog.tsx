"use client";

import React, { useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { fetcher } from "@/lib/swr-config";
import { useCreateEntity } from "@/hooks/useCreateEntity";
import { EntityDialog, EntityFormShell } from "@/components/common/EntityFormShell";
import AsyncContent from "@/components/AsyncContent";
import ModuliPicker from "@/components/common/ModuliPicker";
import type { Modulo } from "@progetto/shared/validation/modulo.schema";

interface ModuliAssociationDialogProps<TAssoc extends object> {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    title: string;
    associationsEndpoint: string;
    saveEndpoint: string;
    extractIds: (data: TAssoc[]) => number[];
    sortable?: boolean;
}

export default function ModuliAssociationDialog<TAssoc extends object>(
    props: ModuliAssociationDialogProps<TAssoc>
) {
    return (
        <EntityDialog open={props.open} onClose={props.onClose} size="lg">
            <Loader {...props} />
        </EntityDialog>
    );
}

function Loader<TAssoc extends object>({
    associationsEndpoint, extractIds, ...rest
}: ModuliAssociationDialogProps<TAssoc>) {
    const { data: moduli, error: moduliError } = useSWR<Modulo[]>("/moduli", fetcher);
    const { data: assoc, error: assocError } = useSWR<TAssoc[]>(associationsEndpoint, fetcher);

    return (
        <AsyncContent
            data={moduli && assoc ? { moduli, assoc } : undefined}
            error={moduliError ?? assocError}
            isEmpty={() => false}
            empty={null}
        >
            {({ moduli, assoc }) => (
                <AssociationForm
                    {...rest}
                    associationsEndpoint={associationsEndpoint}
                    moduli={moduli}
                    initialIds={extractIds(assoc)}
                />
            )}
        </AsyncContent>
    );
}

function AssociationForm({
    title, saveEndpoint, associationsEndpoint, sortable, moduli, initialIds, onClose, onSuccess,
}: {
    title: string;
    saveEndpoint: string;
    associationsEndpoint: string;
    sortable?: boolean;
    moduli: Modulo[];
    initialIds: number[];
    onClose: () => void;
    onSuccess?: () => void;
}) {
    const [selectedIds, setSelectedIds] = useState(initialIds);
    const { mutate } = useSWRConfig();
    const { submitting, create } = useCreateEntity<{ moduli_ids: number[] }, unknown>(
        saveEndpoint, "Moduli associati salvati!"
    );

    const handleSubmit = async () => {
        const ok = await create({ moduli_ids: selectedIds });
        if (ok) {
            await mutate(associationsEndpoint); // la prossima apertura parte dai dati aggiornati
            onSuccess?.();
        }
    };

    return (
        <EntityFormShell
            title={title}
            submitLabel="Salva"
            submitting={submitting}
            onSubmit={handleSubmit}
            onClose={onClose}
        >
            <ModuliPicker moduli={moduli} selectedIds={selectedIds} onChange={setSelectedIds} sortable={sortable} />
        </EntityFormShell>
    );
}