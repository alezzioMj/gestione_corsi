"use client";

import { useState } from "react";
import {
  Box, Button, Card, CardActionArea, Dialog, DialogContent,
  DialogTitle, IconButton, Typography
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ImageIcon from "@mui/icons-material/Image";
import VideocamIcon from "@mui/icons-material/Videocam";
import AudiotrackIcon from "@mui/icons-material/Audiotrack";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import CloseIcon from "@mui/icons-material/Close";
import { Materiale } from "@progetto/shared/validation/types";

interface MaterialeCardProps {
  materiale: Materiale;
  onDelete: (materiale_id: string) => void;
}

const IMAGE_EXT = ["png", "jpg", "jpeg", "gif", "webp"];
const VIDEO_EXT = ["mp4", "webm", "mov"];
const AUDIO_EXT = ["mp3", "wav", "ogg", "m4a"];

export default function MaterialeCard({ materiale, onDelete }: MaterialeCardProps) {
  const [previewOpen, setPreviewOpen] = useState(false);

  const fileName = materiale.originalName ?? "";
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  const tipo = materiale.tipo?.toLowerCase() ?? "";

  const isPdf = tipo === "pdf" || ext === "pdf";
  const isImage = tipo === "immagine" || IMAGE_EXT.includes(ext);
  const isVideo = tipo === "video" || VIDEO_EXT.includes(ext);
  const isAudio = tipo === "audio" || AUDIO_EXT.includes(ext);
  const hasPreview = isImage || isPdf || isVideo || isAudio;

  const Icon = isPdf
    ? PictureAsPdfIcon
    : isImage
      ? ImageIcon
      : isVideo
        ? VideocamIcon
        : isAudio
          ? AudiotrackIcon
          : InsertDriveFileIcon;

  // Clic sulla card: anteprima se disponibile, altrimenti apre il file.
  const handleClick = () => {
    if (hasPreview) setPreviewOpen(true);
    else window.open(materiale.url, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <Card variant="outlined" sx={{ height: "100%" }}>
        <CardActionArea
          onClick={handleClick}
          sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.5, justifyContent: "flex-start" }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              width: 40,
              height: 40,
              borderRadius: 1,
              bgcolor: "action.hover",
              color: "primary.main",
            }}
          >
            <Icon fontSize="small" />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" noWrap title={materiale.titolo}>
              {materiale.titolo}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap component="p" title={fileName}>
              {fileName}
            </Typography>
          </Box>
        </CardActionArea>
      </Card>

      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ pr: 6 }}>
          {materiale.titolo}
          <IconButton
            aria-label="Chiudi anteprima"
            onClick={() => setPreviewOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {isImage && (
            <Box
              component="img"
              src={materiale.url}
              alt={fileName}
              sx={{ width: "100%", maxHeight: "70vh", objectFit: "contain" }}
            />
          )}
          {isPdf && (
            <Box
              component="iframe"
              src={materiale.url}
              title={`Anteprima di ${fileName}`}
              sx={{ width: "100%", height: "70vh", border: 0 }}
            />
          )}
          {isVideo && (
            <Box component="video" src={materiale.url} controls sx={{ width: "100%", maxHeight: "70vh" }} />
          )}
          {isAudio && <Box component="audio" src={materiale.url} controls sx={{ width: "100%" }} />}
          <Box
            sx={{
              mt: 2,
              display: "flex",
              justifyContent: "flex-end",
              gap: 2
            }}
          >
            <Button
              href={materiale.url}
              target="_blank"
              rel="noopener noreferrer"
              size="small"
            >
              Apri in una nuova scheda
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => {
                onDelete(materiale.id)
                setPreviewOpen(false);  
              }}
            >
              Elimina
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}