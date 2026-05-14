"use client";

import React from "react";
import { Box, CircularProgress, Typography, Fade } from "@mui/material";

interface LoadingProps {
    message?: string;
    minHeight?: string | number;
}

const Loading: React.FC<LoadingProps> = ({ message = "Caricamento in corso...", minHeight = "300px" }) => {
    return (
        <Fade in style={{ transitionDelay: '200ms' }} unmountOnExit>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    minHeight: minHeight,
                    gap: 2,
                    py: 4
                }}
            >
                <CircularProgress size={50} thickness={4} color="primary" />
                <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                    {message}
                </Typography>
            </Box>
        </Fade>
    );
};

export default Loading;