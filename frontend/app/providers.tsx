"use client";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import SideDrawer from "@/components/Navigation/Drawer";

const ColorModeContext = createContext({ toggleColorMode: () => {} });
export const useColorMode = () => useContext(ColorModeContext);

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mode, setMode] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState(false);

  // Evita l'idratazione fino a quando il client non si è completamente montato
  useEffect(() => {
    setMounted(true);
  }, []);

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    []
  );

  const theme = useMemo(
    () => createTheme({ palette: { mode } }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {/* Se non ancora montato sul client, mostra uno scheletro trasparente per prevenire il mismatch di Emotion */}
        <Box 
          sx={{ 
            display: "flex", 
            minHeight: "100vh" // Previene il flash di layout mantenendo lo spazio
          }}
        >
          {/* SIDEBAR */}
          <SideDrawer />

          {/* CONTENUTO PRINCIPALE */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              width: "100%",
              minWidth: 0,
              p: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch",
            }}
          >
            {children}
          </Box>
        </Box>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}