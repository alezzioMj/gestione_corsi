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
exports.default = DocenteCard;
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const Email_1 = __importDefault(require("@mui/icons-material/Email"));
const Badge_1 = __importDefault(require("@mui/icons-material/Badge"));
const AddModuloModal_1 = __importDefault(require("./AddModuloModal"));
const EditDocenteModal_1 = __importDefault(require("./EditDocenteModal")); // Importa il componente EditDocenteModal
const Edit_1 = __importDefault(require("@mui/icons-material/Edit")); // Importa l'icona di modifica
const Delete_1 = __importDefault(require("@mui/icons-material/Delete")); // Importa l'icona di eliminazione
function DocenteCard({ docente, onDocenteUpdated, onDeleteDocente }) {
    const [isEditModalOpen, setIsEditModalOpen] = (0, react_1.useState)(false);
    const handleOpenEditModal = () => {
        setIsEditModalOpen(true);
    };
    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
    };
    const handleEditSuccess = () => {
        onDocenteUpdated(); // Aggiorna la lista dei docenti nel componente padre
        handleCloseEditModal();
    };
    return (<material_1.Card sx={{ height: "100%", display: "flex", flexDirection: "column", boxShadow: 2 }}>
      <material_1.CardContent>
        <material_1.Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
          <material_1.Avatar sx={{ bgcolor: 'primary.main' }}>
            {docente.nome[0]}{docente.cognome[0]}
          </material_1.Avatar>
          <material_1.Typography variant="h6" component="div" color="primary">
            {docente.nome} {docente.cognome}
          </material_1.Typography>
        </material_1.Box>

        <material_1.Divider sx={{ my: 1.5 }}/>

        <material_1.Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Badge_1.default fontSize="small" sx={{ mr: 1, color: "text.secondary" }}/>
          <material_1.Typography variant="body2" color="text.secondary">
            CF: {docente.codice_fiscale}
          </material_1.Typography>
        </material_1.Box>

        <material_1.Box sx={{ display: "flex", alignItems: "center" }}>
          <Email_1.default fontSize="small" sx={{ mr: 1, color: "text.secondary" }}/>
          <material_1.Typography variant="body2" color="text.secondary">
            {docente.mail || "Email non disponibile"}
          </material_1.Typography>
        </material_1.Box>

        <material_1.Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end", gap: 1 }}>
          <AddModuloModal_1.default docente={docente}/>
          <material_1.Button variant="outlined" size="small" startIcon={<Edit_1.default />} onClick={handleOpenEditModal}>
            Modifica
          </material_1.Button>
          <material_1.Button variant="outlined" color="error" size="small" startIcon={<Delete_1.default />} onClick={() => onDeleteDocente(docente.codice_fiscale)}>
            Elimina
          </material_1.Button>
        </material_1.Box>
      </material_1.CardContent>

      {docente && ( // Renderizza il modale solo se il docente è presente
        <EditDocenteModal_1.default open={isEditModalOpen} onClose={handleCloseEditModal} docente={docente} onSaveSuccess={handleEditSuccess}/>)}
    </material_1.Card>);
}
