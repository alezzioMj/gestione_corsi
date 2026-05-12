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
exports.default = AddDocenteModal;
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const Grid_1 = __importDefault(require("@mui/material/Grid"));
const Add_1 = __importDefault(require("@mui/icons-material/Add"));
const navigation_1 = require("next/navigation");
const countries = __importStar(require("i18n-iso-countries"));
const it_json_1 = __importDefault(require("i18n-iso-countries/langs/it.json"));
const config_1 = require("@/lib/config");
// Registra la localizzazione italiana per la libreria delle nazioni
countries.registerLocale(it_json_1.default);
function AddDocenteModal() {
    const [open, setOpen] = (0, react_1.useState)(false);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const router = (0, navigation_1.useRouter)();
    const [formData, setFormData] = (0, react_1.useState)({
        nome: "",
        cognome: "",
        codice_fiscale: "",
        datanascita: "",
        nazione: "Italia", // Default Italia
        regione: "",
        provincia: "",
        comune: "",
        sesso: "",
        cellulare: "",
        mail: "",
        cv: "",
        contratto: "",
    });
    // Stati per le opzioni geografiche
    const [regioni, setRegioni] = (0, react_1.useState)([]);
    const [province, setProvince] = (0, react_1.useState)([]);
    const [comuni, setComuni] = (0, react_1.useState)([]);
    // Ottieni la lista delle nazioni in italiano dalla libreria
    const countryOptions = Object.entries(countries.getNames("it")).map(([code, name]) => ({
        code,
        name
    }));
    (0, react_1.useEffect)(() => {
        const isItaly = formData.nazione === "Italia" || formData.nazione === "IT";
        if (open && isItaly && regioni.length === 0) {
            fetch("https://comuni-ita.nicolorebaioli.dev/regioni")
                .then(res => res.json())
                .then(data => setRegioni(data))
                .catch(err => console.error("Errore caricamento regioni", err));
        }
        if (!isItaly && open) {
            if (regioni.length)
                setRegioni([]);
            if (province.length)
                setProvince([]);
            if (comuni.length)
                setComuni([]);
        }
    }, [open, formData.nazione]);
    // Caricamento Province quando cambia la regione
    const loadProvince = (regioneNome) => {
        if (!regioneNome) {
            setProvince([]);
            return;
        }
        fetch(`https://comuni-ita.nicolorebaioli.dev/province?regione=${encodeURIComponent(regioneNome)}`)
            .then(res => res.json())
            .then(data => {
            console.log(data);
            setProvince(data);
        })
            .catch(err => console.error("Errore caricamento province", err));
    };
    // Caricamento Comuni quando cambia la provincia
    const loadComuni = (provinciaNome) => {
        if (!provinciaNome) {
            setComuni([]);
            return;
        }
        fetch(`https://comuni-ita.nicolorebaioli.dev/comuni?provincia=${encodeURIComponent(provinciaNome)}`)
            .then(res => res.json())
            .then(data => {
            setComuni(data);
        })
            .catch(err => console.error("Errore caricamento comuni", err));
    };
    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setFormData({ nome: "", cognome: "", codice_fiscale: "", datanascita: "", nazione: "Italia", regione: "", provincia: "", comune: "", sesso: "", cellulare: "", mail: "", cv: "", contratto: "" });
        setProvince([]);
        setComuni([]);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${config_1.API_BASE_URL}/docenti`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                handleClose();
                router.refresh();
            }
            else {
                const errorData = await res.json();
                alert(`Errore: ${errorData.error || res.statusText}`);
            }
        }
        catch (error) {
            console.error("Errore:", error);
            alert("Errore di rete.");
        }
        finally {
            setLoading(false);
        }
    };
    // Calcolo codice fiscale
    /*const calculateCodiceFiscale = (
        nome: string,
        cognome: string,
        sesso: string,
        luogoDiNascita: string,
        codiceProvincia: string,
        giornoDiNascita: string,
        meseDiNascita: string,
        annoDiNascita: string,
        livelloOmocodia: string,
        comuneSospeso: string,
        access_token: string
    ) => async () => {
        const URL = "http://api.miocodicefiscale.it/calculate?lname={cognome}&fname={nome}&gender={sesso}&city={luogo-di-nascita}&state={codice-provincia}&abolished={comune-soppresso}&day={giorno-di-nascita}&month={mese-di-nascita}&year={anno-di-nascita}&omocodia_level={livello-omocodia}&access_token={tua-chiave-API}";
        try {
            const res = await fetch(URL)
        } catch {

        }
    }*/
    return (<>
            <material_1.Button variant="contained" startIcon={<Add_1.default />} onClick={handleOpen}>
                Nuovo Docente
            </material_1.Button>

            <material_1.Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
                <form onSubmit={handleSubmit}>
                    <material_1.DialogTitle>Aggiungi Nuovo Docente</material_1.DialogTitle>
                    <material_1.DialogContent>
                        <Grid_1.default container spacing={2} sx={{ mt: 1 }}>
                            {/* Dati Anagrafici */}
                            <Grid_1.default size={{ xs: 12, sm: 6 }}>
                                <material_1.TextField label="Nome" fullWidth required value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })}/>
                            </Grid_1.default>
                            <Grid_1.default size={{ xs: 12, sm: 6 }}>
                                <material_1.TextField label="Cognome" fullWidth required value={formData.cognome} onChange={(e) => setFormData({ ...formData, cognome: e.target.value })}/>
                            </Grid_1.default>
                            <Grid_1.default size={12}>
                                <material_1.TextField label="Codice Fiscale" fullWidth required value={formData.codice_fiscale} onChange={(e) => setFormData({ ...formData, codice_fiscale: e.target.value.toUpperCase() })}/>
                            </Grid_1.default>
                            <Grid_1.default size={{ xs: 12, sm: 6 }}>
                                <material_1.TextField label="Data di Nascita" type="date" fullWidth required slotProps={{ inputLabel: { shrink: true } }} value={formData.datanascita} onChange={(e) => setFormData({ ...formData, datanascita: e.target.value })}/>
                            </Grid_1.default>
                            <Grid_1.default size={{ xs: 12, sm: 6 }}>
                                <material_1.TextField select label="Sesso" fullWidth required value={formData.sesso} onChange={(e) => setFormData({ ...formData, sesso: e.target.value })}>
                                    <material_1.MenuItem value="M">Maschio</material_1.MenuItem>
                                    <material_1.MenuItem value="F">Femmina</material_1.MenuItem>
                                    <material_1.MenuItem value="Altro">Altro</material_1.MenuItem>
                                </material_1.TextField>
                            </Grid_1.default>

                            {/* Contatti */}
                            <Grid_1.default size={{ xs: 12, sm: 6 }}>
                                <material_1.TextField label="Email" type="email" fullWidth required value={formData.mail} onChange={(e) => setFormData({ ...formData, mail: e.target.value })}/>
                            </Grid_1.default>
                            <Grid_1.default size={{ xs: 12, sm: 6 }}>
                                <material_1.TextField label="Cellulare" fullWidth value={formData.cellulare} onChange={(e) => setFormData({ ...formData, cellulare: e.target.value })}/>
                            </Grid_1.default>

                            {/* Geografia */}
                            <Grid_1.default size={{ xs: 12, sm: 6 }}>
                                <material_1.Autocomplete options={countryOptions} getOptionLabel={(opt) => opt.name || ""} value={countryOptions.find(c => c.name === formData.nazione) || null} renderInput={(params) => <material_1.TextField {...params} label="Nazione" required/>} isOptionEqualToValue={(option, value) => option.name === value.name} onChange={(_, val) => {
            const newNazione = val?.name || "";
            setFormData({ ...formData, nazione: newNazione, regione: "", provincia: "", comune: "" });
            setProvince([]);
            setComuni([]);
        }}/>
                            </Grid_1.default>
                            <Grid_1.default size={{ xs: 12, sm: 6 }}>
                                <material_1.Autocomplete options={regioni} value={regioni.find(r => r === formData.regione) || null} getOptionLabel={(opt) => opt || ""} isOptionEqualToValue={(option, value) => option === value} renderInput={(params) => <material_1.TextField {...params} label="Regione" required={formData.nazione === "Italia"}/>} disabled={formData.nazione !== "Italia"} onChange={(_, val) => {
            const newRegione = val || "";
            setFormData({ ...formData, regione: newRegione, provincia: "", comune: "" });
            setComuni([]); // Pulisco i comuni perché cambio regione
            loadProvince(newRegione);
        }}/>
                            </Grid_1.default>
                            <Grid_1.default size={{ xs: 12, sm: 6 }}>
                                <material_1.Autocomplete options={province} value={province.find(p => p.nome === formData.provincia) || null} getOptionLabel={(opt) => opt.nome || ""} isOptionEqualToValue={(option, value) => option.nome === value.nome} renderInput={(params) => <material_1.TextField {...params} label="Provincia" required={formData.nazione === "Italia"}/>} disabled={!formData.regione || formData.nazione !== "Italia"} onChange={(_, val) => {
            setFormData({ ...formData, provincia: val?.nome || "", comune: "" });
            loadComuni(val?.nome ?? "");
        }}/>
                            </Grid_1.default>
                            <Grid_1.default size={{ xs: 12, sm: 6 }}>
                                <material_1.Autocomplete options={comuni} value={comuni.find(c => c.nome === formData.comune) || null} getOptionLabel={(opt) => opt.nome || ""} isOptionEqualToValue={(option, value) => option.nome === value.nome} renderInput={(params) => <material_1.TextField {...params} label="Comune" required={formData.nazione === "Italia"}/>} disabled={!formData.provincia || formData.nazione !== "Italia"} onChange={(_, val) => setFormData({ ...formData, comune: val?.nome || "" })}/>
                            </Grid_1.default>

                            {/* Documentazione e Contratto */}
                            <Grid_1.default size={{ xs: 12, sm: 6 }}>
                                <material_1.TextField label="Contratto" placeholder="Es: P.IVA, Co.Co.Co" fullWidth value={formData.contratto} onChange={(e) => setFormData({ ...formData, contratto: e.target.value })}/>

                            </Grid_1.default>
                            <Grid_1.default size={{ xs: 12, sm: 6 }}>
                                <material_1.TextField label="Link CV" placeholder="URL o riferimento CV" fullWidth value={formData.cv} onChange={(e) => setFormData({ ...formData, cv: e.target.value })}/>
                            </Grid_1.default>
                        </Grid_1.default>
                    </material_1.DialogContent>
                    <material_1.DialogActions>
                        <material_1.Button onClick={handleClose}>Annulla</material_1.Button>
                        <material_1.Button type="submit" variant="contained" disabled={loading}>
                            {loading ? <material_1.CircularProgress size={24}/> : "Salva"}
                        </material_1.Button>
                    </material_1.DialogActions>
                </form>
            </material_1.Dialog>
        </>);
}
