// src/components/ColorSwatchPicker.tsx
"use client";

import { Box } from "@mui/material";

import { DOCENTE_COLORS } from "@shared/constants/docente";

interface ColorSwatchPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export default function ColorSwatchPicker({ value, onChange }: ColorSwatchPickerProps) {
  return (
    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", py: 1 }}>
      {DOCENTE_COLORS.map((color) => (
        <Box
          key={color}
          onClick={() => onChange(color)}
          sx={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            bgcolor: color,
            cursor: "pointer",
            border: value === color ? "3px solid black" : "3px solid transparent",
            boxShadow: value === color ? 2 : 0,
            transition: "border 0.15s ease",
          }}
        />
      ))}
    </Box>
  );
}