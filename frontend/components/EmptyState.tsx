// components/EmptyState.tsx
"use client";
import { Box, Typography, Button, Paper } from "@mui/material";
import { SvgIconComponent } from "@mui/icons-material";

type EmptyStateProps = {
  icon: SvgIconComponent;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        borderStyle: "dashed",
        borderWidth: 2,
        borderColor: "divider",
        bgcolor: "transparent",
        py: 6,
        px: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: 1.5,
      }}
    >
      <Icon sx={{ fontSize: 56, color: "text.disabled" }} />
      <Typography variant="h6" color="text.secondary">
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.disabled" sx={{ maxWidth: 320 }}>
          {description}
        </Typography>
      )}
      {actionLabel && onAction && (
        <Button variant="outlined" onClick={onAction} sx={{ mt: 1 }}>
          {actionLabel}
        </Button>
      )}
    </Paper>
  );
}