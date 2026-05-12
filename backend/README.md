# 📚 Gestionale Corsi

Backend API per la gestione di corsi, docenti e sedi.

---

## 🚀 Tech Stack
- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL

---

## 📦 Installazione
```bash
npm install
```

---

## ▶️ Avvio progetto
```bash
npm start
```

---

## 🔐 Environment Variables

Crea file `.env`:

DATABASE_URL=postgresql://user:password@localhost:5432/gestione_corsi  
PORT=3000

---

## 🗄️ Prisma

Migrazione:
```bash
npx prisma migrate dev
```

Studio:
```bash
npx prisma studio
```

---

## 📡 API Endpoints

CORSI
- GET /corsi
- GET /corsi/:id
- POST /corsi
- PUT /corsi/:id
- DELETE /corsi/:id

DOCENTI (corso-docente)
- GET /corsi/:id/docenti
- POST /corsi/:id/docenti
- DELETE /corsi/:id/docenti/:docente_cf

SEDI (corso-sede)
- GET /corsi/:id/sedi
- POST /corsi/:id/sedi
- DELETE /corsi/:id/sedi/:sede_id

---

## 📁 Struttura progetto

src/  
controllers/  
routes/  
middlewares/  
validation/  
prisma/

---

## 🧠 Note

- Tabelle ponte:
  - corso_docente
  - corso_sede

- API nested REST:
  - /corsi/:id/docenti
  - /corsi/:id/sedi

---

## 📌 Esempi

POST /corsi/1/docenti

{
  "docente_cf": "RSSMRA85M01H501U",
  "n_ore": 20
}

---

POST /corsi/1/sedi

{
  "sede_id": 2
}

---
