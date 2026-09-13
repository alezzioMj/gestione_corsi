export const DOCENTE_COLORS = [
  "#1976d2", // blu
  "#388e3c", // verde
  "#f57c00", // arancione
  "#7b1fa2", // viola
  "#c2185b", // rosa scuro
  "#0097a7", // ciano scuro
  "#455a64", // blu grigio
  "#e64a19", // arancione rossastro
  "#00796b", // verde acqua
] as const;

export type DocenteColor = typeof DOCENTE_COLORS[number];