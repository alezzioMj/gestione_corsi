"use strict";
"use client";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ProgrammaCard;
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const MenuBook_1 = __importDefault(require("@mui/icons-material/MenuBook"));
const AddModuloProgrammaModal_1 = __importDefault(require("./AddModuloProgrammaModal"));
const EditProgrammaModal_1 = __importDefault(require("./EditProgrammaModal")); // Importa il modal di modifica
const Edit_1 = __importDefault(require("@mui/icons-material/Edit"));
const Delete_1 = __importDefault(require("@mui/icons-material/Delete"));
function ProgrammaCard({ programma, onProgrammaUpdated, onDeleteProgramma }) {
    const [isEditModalOpen, setIsEditModalOpen] = (0, react_1.useState)(false);
    return (<material_1.Card sx={{ height: "100%", display: "flex", flexDirection: "column", boxShadow: 2 }}>
      <material_1.CardContent>
        <material_1.Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
          <material_1.Typography variant="h6" component="div" color="primary">
            {programma.titolo}
          </material_1.Typography>
        </material_1.Box>

        <material_1.Divider sx={{ my: 1.5 }}/>

        <material_1.Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <material_1.Typography variant="body2" color="text.secondary">
            Ore pratiche: {programma.ore_pratiche}
          </material_1.Typography>
        </material_1.Box>

        <material_1.Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <material_1.Typography variant="body2" color="text.secondary">
            Ore teoriche: {programma.ore_teoriche}
          </material_1.Typography>
        </material_1.Box>

        <material_1.Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <material_1.Typography variant="body2" color="text.secondary">
            Ore ore_trasversali: {programma.ore_trasversali}
          </material_1.Typography>
        </material_1.Box>

        <material_1.Divider sx={{ my: 1.5 }}/>

        {/* Carosello Moduli Orizzontale */}
        <material_1.Box sx={{ mb: 2 }}>
          <material_1.Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1 }}>
            <MenuBook_1.default fontSize="small" color="action"/>
            <material_1.Typography variant="subtitle2">Moduli associati:</material_1.Typography>
          </material_1.Box>

          <material_1.Box sx={{
            display: 'flex',
            gap: 1,
            overflowX: 'auto',
            pb: 1,
            '&::-webkit-scrollbar': { height: '5px' },
            '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: '10px' },
        }}>
            {programma.programma_modulo && programma.programma_modulo.length > 0 ? (programma.programma_modulo.map((pm) => (<material_1.Chip key={pm.modulo_id} label={pm.modulo?.titolo || "Senza Titolo"} size="small" variant="outlined" color="secondary" sx={{ flexShrink: 0 }}/>))) : (<material_1.Typography variant="caption" color="text.secondary">Nessun modulo associato</material_1.Typography>)}
          </material_1.Box>
        </material_1.Box>

        <material_1.Box sx={{ mt: 'auto', display: "flex", justifyContent: "flex-end", gap: 1 }}>
          <AddModuloProgrammaModal_1.default programma={programma}/>
          <material_1.Button variant="outlined" size="small" startIcon={<Edit_1.default />} onClick={() => setIsEditModalOpen(true)} // Apre il modal di modifica
    >
            Modifica
          </material_1.Button>
          <material_1.Button variant="outlined" color="error" size="small" startIcon={<Delete_1.default />} onClick={() => onDeleteProgramma(programma.id)}>
            Elimina
          </material_1.Button>
        </material_1.Box>
      </material_1.CardContent>
      {programma && (<EditProgrammaModal_1.default open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} programma={programma} onSaveSuccess={onProgrammaUpdated}/>)}
    </material_1.Card>);
}
