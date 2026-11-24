import React from "react";
import { Box, Button } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

interface CardActionsBarProps {
    onEdit?: () => void;
    onDelete?: () => void;
    children?: React.ReactNode;
}

export default function CardActionsBar({ onEdit, onDelete, children }: CardActionsBarProps) {
    return (
        <Box sx={{ mt: "auto", pt: 2, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            {children}
            {onEdit && (
                <Button variant="outlined" size="small" startIcon={<EditIcon />} onClick={onEdit}>
                    Modifica
                </Button>
            )}
            {onDelete && (
                <Button variant="outlined" color="error" size="small" startIcon={<DeleteIcon />} onClick={onDelete}>
                    Elimina
                </Button>
            )}
        </Box>
    );
}