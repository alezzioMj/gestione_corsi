// app/corsi/loading.tsx
import { Box, CircularProgress } from '@mui/material';

export default function Loading() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh', // così è centrato verticalmente nella pagina
      }}
    >
      <CircularProgress />
    </Box>
  );
}