import type { CorsoWithRelations } from "@progetto/shared/validation/corso.schema";

export type CorsoItem = CorsoWithRelations<"commessa" | "corso_docente" | "corso_sede" | "programma"> & {
    bozze_count?: number;
};

type DateInput = Date | string | null | undefined;

export type Row = [label: string, value: string | number | null | undefined];

export const visibleRows = (rows: (Row | false | null | undefined)[]): Row[] =>
    rows.filter(
        (r): r is Row => !!r && r[1] !== undefined && r[1] !== null && r[1] !== ""
    );

export const formatDate = (value: DateInput) =>
    value ? new Date(value).toLocaleDateString("it-IT") : "—";

export const formatTime = (value: string) => value.slice(0, 5);

export const formatRange = (from: DateInput, to: DateInput) =>
    `${formatDate(from)} – ${formatDate(to)}`;