"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SideDrawer;
const material_1 = require("@mui/material");
const link_1 = __importDefault(require("next/link")); // Import Next.js Link
const navigation_1 = require("next/navigation"); // Import usePathname for active link styling
const Brightness4_1 = __importDefault(require("@mui/icons-material/Brightness4"));
const Brightness7_1 = __importDefault(require("@mui/icons-material/Brightness7"));
const providers_1 = require("@/app/providers");
const drawerWidth = 240;
function SideDrawer() {
    const theme = (0, material_1.useTheme)(); // Usa il tema per uno stile coerente
    const pathname = (0, navigation_1.usePathname)(); // Ottieni il percorso corrente per lo stile del link attivo
    const colorMode = (0, providers_1.useColorMode)();
    return (<material_1.Drawer variant="permanent" sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
                width: drawerWidth,
                boxSizing: "border-box",
                backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.background.paper, // Usa i colori del tema
                color: theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.text.primary, // Usa i colori del tema
            },
        }}>
      <material_1.Toolbar sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            py: 3,
            height: 'auto',
            px: 2.5,
        }}>
        <material_1.Box component="img" src="/favicon.svg" // Usa percorso assoluto per asset statici
     alt="Logo" sx={{
            width: 45,
            height: 45,
            mr: 2,
        }}/>

        <material_1.Typography variant="h6" sx={{
            fontWeight: 'bold',
            lineHeight: 1.2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
        }}>
          MongodiAPP
        </material_1.Typography>
      </material_1.Toolbar>

      <material_1.Divider sx={{ borderColor: theme.palette.divider }}/> {/* Usa il colore del divisore del tema */}

      {/* TASTO LIGHT/DARK MODE */}
      <material_1.Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1 }}>
        <material_1.Typography variant="body2" color="text.secondary">
          Tema {theme.palette.mode === 'dark' ? 'Scuro' : 'Chiaro'}
        </material_1.Typography>
        <material_1.IconButton onClick={colorMode.toggleColorMode} color="inherit">
          {theme.palette.mode === 'dark' ? <Brightness7_1.default /> : <Brightness4_1.default />}
        </material_1.IconButton>
      </material_1.Box>

      <material_1.Divider sx={{ borderColor: theme.palette.divider }}/>

      {/* Sezione principale */}
      <material_1.List sx={{ mt: 1 }}>
        <material_1.ListItem disablePadding sx={{ mb: 1 }}>
          <material_1.ListItemButton component={link_1.default} href="/sessioni" selected={pathname === "/sessioni"} sx={{
            '&:hover': { backgroundColor: theme.palette.action.hover },
            ...(pathname === "/sessioni" && { backgroundColor: theme.palette.action.selected }),
        }}>
            <material_1.ListItemText primary="Sessioni"/>
          </material_1.ListItemButton>
        </material_1.ListItem>
      </material_1.List>

      <material_1.Divider sx={{ borderColor: theme.palette.divider, my: 1 }}/>

      {/* Sezione Anagrafiche */}
      <material_1.Typography variant="overline" sx={{ px: 2.5, pt: 1, display: 'block', color: 'text.secondary' }}>
        Anagrafiche
      </material_1.Typography>
      <material_1.List>
        {[
            { text: "Commesse", href: "/commesse" },
            { text: "Sedi", href: "/sedi" },
            { text: "Docenti", href: "/docenti" },
            { text: "Programmi", href: "/programmi" },
            { text: "Moduli", href: "/moduli" },
        ].map((item) => {
            // Controlla se il pathname inizia con l'href per evidenziare anche le sottosezioni (es. /sedi/123/aule)
            const isSelected = pathname.startsWith(item.href);
            return (<material_1.ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <material_1.ListItemButton component={link_1.default} href={item.href} selected={isSelected} sx={{
                    '&:hover': { backgroundColor: theme.palette.action.hover },
                    ...(isSelected && { backgroundColor: theme.palette.action.selected }),
                }}>
                <material_1.ListItemText primary={item.text}/>
              </material_1.ListItemButton>
            </material_1.ListItem>);
        })}
      </material_1.List>
    </material_1.Drawer>);
}
