"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)()); // Abilita CORS per tutte le origini
app.use(express_1.default.json());
const docenteRouter_1 = __importDefault(require("./routes/docenteRouter"));
const sedeRouter_1 = __importDefault(require("./routes/sedeRouter"));
const materialeRouter_1 = __importDefault(require("./routes/materialeRouter"));
const aulaRouter_1 = __importDefault(require("./routes/aulaRouter"));
const moduloRouter_1 = __importDefault(require("./routes/moduloRouter"));
const programmaRouter_1 = __importDefault(require("./routes/programmaRouter"));
const corsoRouter_1 = __importDefault(require("./routes/corsoRouter"));
const indisponibilitaRouter_1 = __importDefault(require("./routes/indisponibilitaRouter"));
const sessioneRouter_1 = __importDefault(require("./routes/sessioneRouter"));
app.use('/docenti', docenteRouter_1.default);
app.use('/sedi', sedeRouter_1.default);
app.use('/materiali', materialeRouter_1.default);
app.use('/aule', aulaRouter_1.default);
app.use('/moduli', moduloRouter_1.default);
app.use('/programmi', programmaRouter_1.default);
app.use('/corsi', corsoRouter_1.default);
app.use('/indisponibilita', indisponibilitaRouter_1.default);
app.use('/sessioni', sessioneRouter_1.default);
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server avviato sulla porta ${PORT}`);
});
