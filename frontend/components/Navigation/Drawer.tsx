"use client";

import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
  Box,
  IconButton,
  useTheme, // Import useTheme
} from "@mui/material";
import Link from "next/link"; // Import Next.js Link
import { usePathname } from "next/navigation"; // Import usePathname for active link styling
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";

import { useColorMode } from "@/app/providers";

const drawerWidth = 240;

export default function SideDrawer() {
  const theme = useTheme(); // Usa il tema per uno stile coerente
  const pathname = usePathname(); // Ottieni il percorso corrente per lo stile del link attivo
  const colorMode = useColorMode();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.background.paper, // Usa i colori del tema
          color: theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.text.primary, // Usa i colori del tema
        },
      }}
    >
      <Toolbar sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        py: 3,
        height: 'auto',
        px: 2.5,
      }}>
        <Box
          component="img"
          src="/favicon.svg"
          alt="Logo"
          sx={{
            width: 45,
            height: 45,
            mr: 2,
            borderRadius: 2, // arrotonda il box dell'immagine stessa
            boxShadow: 4,
          }}
        />
        <Typography variant="h6" sx={{
          fontWeight: 'bold',
          lineHeight: 1.2,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          MongodiAPP
        </Typography>
      </Toolbar>

      <Divider sx={{ borderColor: theme.palette.divider }} /> {/* Usa il colore del divisore del tema */}

      {/* TASTO LIGHT/DARK MODE */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Tema {theme.palette.mode === 'dark' ? 'Scuro' : 'Chiaro'}
        </Typography>
        <IconButton onClick={colorMode.toggleColorMode} color="inherit">
          {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Box>

      <Divider sx={{ borderColor: theme.palette.divider }} />

      {/* Sezione principale */}
      <List sx={{ mt: 1 }}>
        <ListItem disablePadding sx={{ mb: 1 }}>
          <ListItemButton
            component={Link}
            href="/sessioni"
            selected={pathname === "/sessioni"}
            sx={{
              '&:hover': { backgroundColor: theme.palette.action.hover },
              ...(pathname === "/sessioni" && { backgroundColor: theme.palette.action.selected }),
            }}
          >
            <ListItemText primary="Sessioni" />
          </ListItemButton>
        </ListItem>
      </List>

      <Divider sx={{ borderColor: theme.palette.divider, my: 1 }} />

      {/* Sezione Anagrafiche */}
      <Typography variant="overline" sx={{ px: 2.5, pt: 1, display: 'block', color: 'text.secondary' }}>
        Anagrafiche
      </Typography>
      <List>
        {[
          { text: "Commesse", href: "/commesse" },
          { text: "Sedi", href: "/sedi" },
          { text: "Docenti", href: "/docenti" },
          { text: "Programmi", href: "/programmi" },
          { text: "Moduli", href: "/moduli" },
          { text: "Materiali", href: "/materiali" }

        ].map((item) => {
          // Controlla se il pathname inizia con l'href per evidenziare anche le sottosezioni (es. /sedi/123/aule)
          const isSelected = pathname.startsWith(item.href);
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                component={Link}
                href={item.href}
                selected={isSelected}
                sx={{
                  '&:hover': { backgroundColor: theme.palette.action.hover },
                  ...(isSelected && { backgroundColor: theme.palette.action.selected }),
                }}
              >
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Drawer>
  );
}