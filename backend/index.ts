import express from "express";
import cors from "cors";

const app = express();

const corsOptions = {
  origin: '*', //'https://gestione-corsi-ronr.vercel.app', // o '*' se vuoi testare, ma meglio specifico
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  optionsSuccessStatus: 204 // Cruciale per alcuni browser vecchi o specifici
};

app.use(cors(corsOptions)); // Abilita CORS per tutte le origini
app.use(express.json());

import docenteRoutes from "./routes/docenteRouter"; 
import sedeRouter from "./routes/sedeRouter";
import materialeRouter from "./routes/materialeRouter";
import aulaRouter from "./routes/aulaRouter";
import moduloRouter from "./routes/moduloRouter";
import programmaRouter from "./routes/programmaRouter";
import corsoRouter from "./routes/corsoRouter"
import indisponibilitaRouter from "./routes/indisponibilitaRouter";
import sessioneRouter from "./routes/sessioneRouter";

app.use('/docenti', docenteRoutes);
app.use('/sedi', sedeRouter);
app.use('/materiali', materialeRouter);
app.use('/aule', aulaRouter);
app.use('/moduli', moduloRouter);
app.use('/programmi', programmaRouter);
app.use('/corsi', corsoRouter);
app.use('/indisponibilita', indisponibilitaRouter);
app.use('/sessioni', sessioneRouter);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server avviato sulla porta ${PORT}`);
});