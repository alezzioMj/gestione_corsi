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
exports.default = SedeCard;
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const LocationOn_1 = __importDefault(require("@mui/icons-material/LocationOn"));
const Phone_1 = __importDefault(require("@mui/icons-material/Phone"));
const link_1 = __importDefault(require("next/link"));
const Edit_1 = __importDefault(require("@mui/icons-material/Edit"));
const Delete_1 = __importDefault(require("@mui/icons-material/Delete"));
const EditSedeModal_1 = __importDefault(require("./EditSedeModal")); // Importa il modal di modifica
function SedeCard({ sede, onSedeUpdated, onDeleteSede }) {
    const [isEditModalOpen, setIsEditModalOpen] = (0, react_1.useState)(false);
    return (<material_1.Card sx={{ height: "100%", display: "flex", flexDirection: "column", boxShadow: 2 }}>
      <material_1.CardContent>
        <material_1.Typography variant="h6" component="div" gutterBottom color="primary">
          {sede.nome}
        </material_1.Typography>

        <material_1.Divider sx={{ my: 1.5 }}/>

        <material_1.Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <LocationOn_1.default fontSize="small" sx={{ mr: 1, color: "text.secondary" }}/>
          <material_1.Typography variant="body2" color="text.secondary">
            {sede.citta}, {sede.provincia}, - CAP:{sede.cap} {sede.indirizzo} - {sede.civico}
          </material_1.Typography>
        </material_1.Box>

        <material_1.Box sx={{ display: "flex", alignItems: "center" }}>
          <Phone_1.default fontSize="small" sx={{ mr: 1, color: "text.secondary" }}/>
          <material_1.Typography variant="body2" color="text.secondary">
            {sede.descrizione || "N/A"}
          </material_1.Typography>
        </material_1.Box>
        <material_1.Box sx={{ mt: 2, display: "flex", justifyContent: "space-between", alignItems: 'center', gap: 1 }}>
          <material_1.Button size="small" variant="text" onClick={() => {
            const query = encodeURIComponent(`${sede.indirizzo} ${sede.civico}, ${sede.citta} ${sede.provincia}`);
            window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
        }}>
            Mappa
          </material_1.Button>
          <material_1.Box sx={{ display: 'flex', gap: 1 }}>
            <material_1.Button variant="outlined" size="small" startIcon={<Edit_1.default />} onClick={() => setIsEditModalOpen(true)} // Apre il modal di modifica
    >
              Modifica
            </material_1.Button>
            <material_1.Button variant="outlined" color="error" size="small" startIcon={<Delete_1.default />} onClick={() => onDeleteSede(sede.id)}>
              Elimina
            </material_1.Button>
          </material_1.Box>
          <material_1.Button variant="outlined" size="small" component={link_1.default} href={`/sedi/${sede.id}/aule`}>
            Aule
          </material_1.Button>
        </material_1.Box>
      </material_1.CardContent>

      {/* Modal di Modifica Sede */}
      {sede && (<EditSedeModal_1.default open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} sede={sede} onSaveSuccess={onSedeUpdated}/>)}
    </material_1.Card>);
}
