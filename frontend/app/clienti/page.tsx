'use client'

import { Box, Button, Container, Link, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add"
import ClientiModal from "@/components/Clienti/ClientiModal";
import { useState } from "react";

export default function ClientiPage() {
    const [open, setOpen] = useState(false);
    return (
        <Container disableGutters maxWidth={false} sx={{ py: 2, px: 3 }}>
            <Box sx={{
                mb: 4
            }}>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 2,
                }}>
                    <Typography variant="h4">Clienti</Typography>
                    <Link style={{ textDecoration: 'none' }}>
                        <Button variant="contained" startIcon={<AddIcon />} color="primary"
                            onClick={() => setOpen(true)}>
                            Aggiungi cliente
                        </Button>
                    </Link>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    {" Gestione dei clienti "}
                </Typography>

                <ClientiModal open={open} onClose={()=>1} onSuccess={()=>1}></ClientiModal>
            </Box>
        </Container>)
}