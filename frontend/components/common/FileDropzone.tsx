"use client";

import React, { useRef, useState } from "react";
import { Box, Button, IconButton, Typography } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";
import { useSnackbar } from "@/components/SnackbarContext";

const DEFAULT_ACCEPT = [".pdf", ".ppt", ".pptx", ".zip", ".docx"];

interface FileDropzoneProps {
    files: File[];
    onChange: (files: File[]) => void;
    multiple?: boolean;
    accept?: string[];
    maxSizeMb?: number;
    hint?: string;
    disabled?: boolean;
}

export default function FileDropzone({
    files, onChange, multiple = false, accept = DEFAULT_ACCEPT,
    maxSizeMb = 25, hint, disabled,
}: FileDropzoneProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);
    const { showMessage } = useSnackbar();

    const addFiles = (incoming: File[]) => {
        const valid: File[] = [];
        for (const f of incoming) {
            if (!accept.some((ext) => f.name.toLowerCase().endsWith(ext))) {
                showMessage(`Formato non supportato (${f.name}). Usa: ${accept.join(", ")}`, "error");
            } else if (f.size > maxSizeMb * 1024 * 1024) {
                showMessage(`${f.name} supera ${maxSizeMb} MB`, "error");
            } else {
                valid.push(f);
            }
        }
        if (valid.length === 0) return;

        if (!multiple) {
            onChange([valid[0]]);
            return;
        }
        const fresh = valid.filter((f) => !files.some((p) => p.name === f.name && p.size === f.size));
        onChange([...files, ...fresh]);
    };

    const defaultHint = `${accept.join(", ")} (max ${maxSizeMb} MB${multiple ? " per file" : ""})`;

    return (
        <Box
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                if (!disabled) addFiles(Array.from(e.dataTransfer.files));
            }}
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                border: "2px dashed",
                borderColor: dragging ? "primary.main" : "divider",
                p: 3,
                textAlign: "center",
                borderRadius: 2,
                bgcolor: dragging ? "action.selected" : "action.hover",
                transition: "background-color 0.2s, border-color 0.2s",
                "&:hover": { bgcolor: "action.selected" },
            }}
        >
            <input
                type="file"
                hidden
                multiple={multiple}
                ref={inputRef}
                accept={accept.join(",")}
                onChange={(e) => {
                    addFiles(Array.from(e.target.files ?? []));
                    e.target.value = ""; // permette di riselezionare lo stesso file
                }}
            />
            <Button
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                onClick={() => inputRef.current?.click()}
                disabled={disabled}
                sx={{ mb: 1 }}
            >
                Seleziona {multiple ? "file" : "file"}
            </Button>

            {files.length === 0 ? (
                <Typography variant="caption" color="text.secondary">
                    {hint ?? `Trascina qui o clicca per scegliere: ${defaultHint}`}
                </Typography>
            ) : (
                <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 0.5 }}>
                    {files.map((f, i) => (
                        <Box
                            key={`${f.name}-${f.size}`}
                            sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}
                        >
                            <Typography variant="body2" noWrap sx={{ color: "success.main", fontWeight: "bold" }}>
                                {f.name} ({(f.size / 1024 / 1024).toFixed(2)} MB)
                            </Typography>
                            <IconButton
                                size="small"
                                aria-label={`Rimuovi ${f.name}`}
                                onClick={() => onChange(files.filter((_, idx) => idx !== i))}
                                disabled={disabled}
                            >
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    ))}
                </Box>
            )}
        </Box>
    );
}
