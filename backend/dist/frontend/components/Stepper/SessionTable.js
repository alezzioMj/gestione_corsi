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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SessionsTable;
const React = __importStar(require("react"));
const material_1 = require("@mui/material");
const config_1 = require("@/lib/config");
function SessionsTable({ sessions, }) {
    const [edit, setEdit] = React.useState(false);
    const [localSessions, setLocalSessions] = React.useState(sessions);
    // Risincronizza i dati locali se le props cambiano (es. per filtraggio)
    React.useEffect(() => {
        setLocalSessions(sessions);
        setEdit(false); // Toglie modalità edit
    }, [sessions]);
    const handleFieldChange = (id, field, value) => {
        setLocalSessions(prev => prev.map(s => (s.id === id ? { ...s, [field]: value } : s)));
    };
    const handleSave = async () => {
        try {
            // In un'app reale potresti voler salvare solo le righe modificate
            // Qui facciamo una chiamata per ogni sessione per semplicità
            const updatePromises = localSessions.map(async (s) => {
                const res = await fetch(`${config_1.API_BASE_URL}/sessioni/${s.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        corso_id: s.corso_id,
                        docente_cf: s.docente_cf,
                        sede_id: s.sede_id,
                        aula_id: s.aula_id,
                        modulo_id: s.modulo_id,
                        data: s.data,
                        ora_inizio: s.ora_inizio,
                        ora_fine: s.ora_fine,
                        stato: s.stato,
                        note: s.note,
                        priorita: s.priorita
                    }),
                });
                if (!res.ok) {
                    throw new Error("Errore durante il salvataggio delle sessioni.");
                }
            });
            await Promise.all(updatePromises);
            alert("Modifiche salvate con successo!");
            setEdit(false);
        }
        catch (err) {
            console.error("Errore durante il salvataggio:", err);
            alert("Errore durante il salvataggio delle sessioni.");
        }
    };
    return (<material_1.Box>
      <material_1.Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <material_1.Button variant="contained" onClick={() => setEdit(!edit)}>
          {edit ? "Annulla" : "Modifica Sessioni"}
        </material_1.Button>
        {edit && <material_1.Button variant="contained" color="success" onClick={handleSave}>Salva Tutto</material_1.Button>}
      </material_1.Box>
      
      <material_1.TableContainer component={material_1.Paper}>
        <material_1.Table>

          {/* HEADER */}
          <material_1.TableHead>
            <material_1.TableRow>
              <material_1.TableCell><b>ID</b></material_1.TableCell>
              <material_1.TableCell><b>Corso</b></material_1.TableCell>
              <material_1.TableCell><b>Docente</b></material_1.TableCell>
              <material_1.TableCell><b>Sede</b></material_1.TableCell>
              <material_1.TableCell><b>Aula</b></material_1.TableCell>
              <material_1.TableCell><b>Data</b></material_1.TableCell>
              <material_1.TableCell><b>Orario</b></material_1.TableCell>
              <material_1.TableCell><b>Stato</b></material_1.TableCell>
              <material_1.TableCell><b>Note</b></material_1.TableCell>
              <material_1.TableCell><b>Modulo</b></material_1.TableCell>
            </material_1.TableRow>
          </material_1.TableHead>

          {/* BODY */}
          <material_1.TableBody>
            {localSessions.map((s) => (<material_1.TableRow key={s.id} hover>
                <material_1.TableCell>{s.id}</material_1.TableCell>
                <material_1.TableCell>{s.corso?.cliente}</material_1.TableCell>
                <material_1.TableCell>
                  {s.docente?.nome} {s.docente?.cognome}
                </material_1.TableCell>
                <material_1.TableCell>{s.sede?.nome}</material_1.TableCell>
                <material_1.TableCell>{s.aula?.nome}</material_1.TableCell>
                <material_1.TableCell>
                  {edit ? (<material_1.TextField type="date" size="small" value={s.data.toString().split('T')[0]} onChange={(e) => handleFieldChange(s.id, "data", e.target.value)}/>) : (new Date(s.data).toLocaleDateString("it-IT"))}
                </material_1.TableCell>
                <material_1.TableCell>
                  {edit ? (<material_1.Box sx={{ display: 'flex', gap: 1 }}>
                      <material_1.TextField size="small" value={s.ora_inizio} onChange={(e) => handleFieldChange(s.id, "ora_inizio", e.target.value)} sx={{ width: 80 }}/>
                      <material_1.TextField size="small" value={s.ora_fine} onChange={(e) => handleFieldChange(s.id, "ora_fine", e.target.value)} sx={{ width: 80 }}/>
                    </material_1.Box>) : (`${s.ora_inizio} - ${s.ora_fine}`)}
                </material_1.TableCell>
                <material_1.TableCell>
                  {edit ? (<material_1.Select size="small" value={s.stato} onChange={(e) => handleFieldChange(s.id, "stato", e.target.value)}>
                      <material_1.MenuItem value="Bozza">Bozza</material_1.MenuItem>
                      <material_1.MenuItem value="Confermata">Confermata</material_1.MenuItem>
                    </material_1.Select>) : (<material_1.Chip label={s.stato} color={s.stato === "Bozza" ? "warning" : "success"} size="small"/>)}
                </material_1.TableCell>
                <material_1.TableCell>
                  {edit ? (<material_1.TextField size="small" value={s.note ?? ""} onChange={(e) => handleFieldChange(s.id, "note", e.target.value)}/>) : (s.note ?? "-")}
                </material_1.TableCell>
                <material_1.TableCell>{s.modulo.titolo}</material_1.TableCell>
              </material_1.TableRow>))}
          </material_1.TableBody>

        </material_1.Table>
      </material_1.TableContainer>
    </material_1.Box>);
}
