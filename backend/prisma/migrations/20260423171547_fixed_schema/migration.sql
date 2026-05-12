-- CreateEnum
CREATE TYPE "competenza_enum" AS ENUM ('Tecnica', 'Teorica', 'Trasversale');

-- CreateEnum
CREATE TYPE "stato_sessione_enum" AS ENUM ('Bozza', 'Confermata', 'Annullata', 'Completata');

-- CreateTable
CREATE TABLE "aula" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "sede_id" INTEGER NOT NULL,
    "capienza" INTEGER,

    CONSTRAINT "aula_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "corso" (
    "id" SERIAL NOT NULL,
    "azienda" VARCHAR(150) NOT NULL,
    "programma_id" INTEGER,
    "n_ore" INTEGER,
    "inizio" DATE,
    "fine" DATE,
    "mattina_inizio" TIME(6),
    "mattina_fine" TIME(6),
    "pomeriggio_inizio" TIME(6),
    "pomeriggio_fine" TIME(6),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(100),

    CONSTRAINT "corso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "corso_docente" (
    "corso_id" INTEGER NOT NULL,
    "docente_cf" VARCHAR(16) NOT NULL,
    "n_ore" INTEGER,

    CONSTRAINT "corso_docente_pkey" PRIMARY KEY ("corso_id","docente_cf")
);

-- CreateTable
CREATE TABLE "corso_sede" (
    "corso_id" INTEGER NOT NULL,
    "sede_id" INTEGER NOT NULL,

    CONSTRAINT "corso_sede_pkey" PRIMARY KEY ("corso_id","sede_id")
);

-- CreateTable
CREATE TABLE "docente" (
    "codice_fiscale" VARCHAR(16) NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "cognome" VARCHAR(100) NOT NULL,
    "datanascita" DATE NOT NULL,
    "nazione" VARCHAR(100) NOT NULL,
    "regione" VARCHAR(100) NOT NULL,
    "provincia" VARCHAR(100) NOT NULL,
    "comune" VARCHAR(100) NOT NULL,
    "sesso" VARCHAR(20) NOT NULL,
    "cellulare" VARCHAR(20) NOT NULL,
    "mail" VARCHAR(100) NOT NULL,
    "cv" VARCHAR(255) NOT NULL,
    "contratto" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(100) NOT NULL,

    CONSTRAINT "docente_pkey" PRIMARY KEY ("codice_fiscale")
);

-- CreateTable
CREATE TABLE "docente_modulo" (
    "docente_cf" VARCHAR(16) NOT NULL,
    "modulo_id" INTEGER NOT NULL,

    CONSTRAINT "docente_modulo_pkey" PRIMARY KEY ("docente_cf","modulo_id")
);

-- CreateTable
CREATE TABLE "indisponibilita" (
    "id" SERIAL NOT NULL,
    "tipologia" VARCHAR(50) NOT NULL,
    "docente_cf" VARCHAR(16),
    "sede_id" INTEGER,
    "data_inizio" DATE NOT NULL,
    "data_fine" DATE NOT NULL,
    "ora_inizio" TIME(6) NOT NULL,
    "ora_fine" TIME(6) NOT NULL,
    "causale" VARCHAR(100) NOT NULL,
    "descrizione" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "indisponibilita_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materiale" (
    "id" SERIAL NOT NULL,
    "url" VARCHAR(255) NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "tipo" VARCHAR(50) NOT NULL,
    "descrizione" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(100),

    CONSTRAINT "materiale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modulo" (
    "id" SERIAL NOT NULL,
    "titolo" VARCHAR(150) NOT NULL,
    "n_ore" INTEGER NOT NULL,
    "competenza" "competenza_enum" NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(100),

    CONSTRAINT "modulo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modulo_materiale" (
    "modulo_id" INTEGER NOT NULL,
    "materiale_id" INTEGER NOT NULL,

    CONSTRAINT "modulo_materiale_pkey" PRIMARY KEY ("modulo_id","materiale_id")
);

-- CreateTable
CREATE TABLE "programma" (
    "id" SERIAL NOT NULL,
    "titolo" VARCHAR(150) NOT NULL,
    "descrizione" TEXT,
    "durata_totale" INTEGER NOT NULL,
    "ore_pratiche" INTEGER NOT NULL,
    "ore_teoriche" INTEGER NOT NULL,
    "ore_trasversali" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(100),

    CONSTRAINT "programma_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programma_modulo" (
    "programma_id" INTEGER NOT NULL,
    "modulo_id" INTEGER NOT NULL,
    "ordine" INTEGER NOT NULL,
    "obbligatorio" BOOLEAN DEFAULT true,

    CONSTRAINT "programma_modulo_pkey" PRIMARY KEY ("programma_id","ordine")
);

-- CreateTable
CREATE TABLE "sede" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(150) NOT NULL,
    "indirizzo" VARCHAR(150) NOT NULL,
    "civico" VARCHAR(20) NOT NULL,
    "cap" CHAR(5) NOT NULL,
    "citta" VARCHAR(100) NOT NULL,
    "provincia" CHAR(2) NOT NULL,
    "descrizione" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(100) NOT NULL,

    CONSTRAINT "sede_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessione" (
    "id" SERIAL NOT NULL,
    "corso_id" INTEGER NOT NULL,
    "docente_cf" VARCHAR(16) NOT NULL,
    "modulo_id" INTEGER NOT NULL,
    "sede_id" INTEGER NOT NULL,
    "aula_id" INTEGER NOT NULL,
    "data" DATE NOT NULL,
    "ora_inizio" TIME(6) NOT NULL,
    "ora_fine" TIME(6) NOT NULL,
    "stato" "stato_sessione_enum" DEFAULT 'Bozza',
    "priorita" INTEGER NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(100),

    CONSTRAINT "sessione_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "aula_nome_sede_id_key" ON "aula"("nome", "sede_id");

-- CreateIndex
CREATE UNIQUE INDEX "programma_modulo_programma_id_modulo_id_key" ON "programma_modulo"("programma_id", "modulo_id");

-- AddForeignKey
ALTER TABLE "aula" ADD CONSTRAINT "aula_sede_id_fkey" FOREIGN KEY ("sede_id") REFERENCES "sede"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "corso" ADD CONSTRAINT "corso_programma_id_fkey" FOREIGN KEY ("programma_id") REFERENCES "programma"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "corso_docente" ADD CONSTRAINT "corso_docente_corso_id_fkey" FOREIGN KEY ("corso_id") REFERENCES "corso"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "corso_docente" ADD CONSTRAINT "corso_docente_docente_cf_fkey" FOREIGN KEY ("docente_cf") REFERENCES "docente"("codice_fiscale") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "corso_sede" ADD CONSTRAINT "corso_sede_corso_id_fkey" FOREIGN KEY ("corso_id") REFERENCES "corso"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "corso_sede" ADD CONSTRAINT "corso_sede_sede_id_fkey" FOREIGN KEY ("sede_id") REFERENCES "sede"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "docente_modulo" ADD CONSTRAINT "docente_modulo_docente_cf_fkey" FOREIGN KEY ("docente_cf") REFERENCES "docente"("codice_fiscale") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "docente_modulo" ADD CONSTRAINT "docente_modulo_modulo_id_fkey" FOREIGN KEY ("modulo_id") REFERENCES "modulo"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "indisponibilita" ADD CONSTRAINT "indisponibilita_docente_cf_fkey" FOREIGN KEY ("docente_cf") REFERENCES "docente"("codice_fiscale") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "indisponibilita" ADD CONSTRAINT "indisponibilita_sede_id_fkey" FOREIGN KEY ("sede_id") REFERENCES "sede"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "modulo_materiale" ADD CONSTRAINT "modulo_materiale_materiale_id_fkey" FOREIGN KEY ("materiale_id") REFERENCES "materiale"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "modulo_materiale" ADD CONSTRAINT "modulo_materiale_modulo_id_fkey" FOREIGN KEY ("modulo_id") REFERENCES "modulo"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "programma_modulo" ADD CONSTRAINT "programma_modulo_modulo_id_fkey" FOREIGN KEY ("modulo_id") REFERENCES "modulo"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "programma_modulo" ADD CONSTRAINT "programma_modulo_programma_id_fkey" FOREIGN KEY ("programma_id") REFERENCES "programma"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sessione" ADD CONSTRAINT "sessione_aula_id_fkey" FOREIGN KEY ("aula_id") REFERENCES "aula"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sessione" ADD CONSTRAINT "sessione_corso_id_fkey" FOREIGN KEY ("corso_id") REFERENCES "corso"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sessione" ADD CONSTRAINT "sessione_docente_cf_fkey" FOREIGN KEY ("docente_cf") REFERENCES "docente"("codice_fiscale") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sessione" ADD CONSTRAINT "sessione_modulo_id_fkey" FOREIGN KEY ("modulo_id") REFERENCES "modulo"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sessione" ADD CONSTRAINT "sessione_sede_id_fkey" FOREIGN KEY ("sede_id") REFERENCES "sede"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
