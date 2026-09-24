// components/common/EntitySelect.tsx
"use client";

import { Autocomplete, TextField } from "@mui/material";

interface EntitySelectProps<T, I extends string | number> {
    label: string;
    options: T[];
    value: I | null;
    getOptionId: (option: T) => I;
    getOptionLabel: (option: T) => string;
    onChange: (id: I | null) => void;
    required?: boolean;
    disabled?: boolean;
}

export default function EntitySelect<T, I extends string | number>({
    label, options, value, getOptionId, getOptionLabel, onChange, required = false, disabled = false,
}: EntitySelectProps<T, I>) {
    return (
        <Autocomplete
            options={options}
            disabled={disabled}
            getOptionLabel={getOptionLabel}
            isOptionEqualToValue={(option, val) => getOptionId(option) === getOptionId(val)}
            value={options.find((o) => getOptionId(o) === value) ?? null}
            onChange={(_, val) => onChange(val ? getOptionId(val) : null)}
            renderInput={(params) => (
                <TextField {...params} label={label} required={required} />
            )}
        />
    );
}