/*
  Warnings:

  - You are about to drop the column `cliente` on the `corso` table. All the data in the column will be lost.
  - Added the required column `cliente_id` to the `corso` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "stato_commessa" AS ENUM ('APERTA', 'IN_CORSO', 'CHIUSA', 'ANNULLATA');

-- CreateEnum
CREATE TYPE "tipo_sede" AS ENUM ('LEGALE', 'OPERATIVA');

-- AlterTable
ALTER TABLE "corso" DROP COLUMN "cliente",
ADD COLUMN     "cliente_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "agente" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "cognome" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255),
    "telefono" VARCHAR(30),

    CONSTRAINT "agente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commessa" (
    "id" SERIAL NOT NULL,
    "codice_commessa" VARCHAR(255) NOT NULL,
    "codice_ft" VARCHAR(255),
    "codice_rlom" VARCHAR(255),
    "descrizione" TEXT,
    "scadenza" DATE,
    "cliente_id" INTEGER,
    "stato" "stato_commessa" NOT NULL DEFAULT 'APERTA',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(100),

    CONSTRAINT "commessa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cliente" (
    "id" SERIAL NOT NULL,
    "ragione_sociale" TEXT NOT NULL,
    "partita_iva" TEXT NOT NULL,
    "agente_id" INTEGER,

    CONSTRAINT "cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cliente_sede" (
    "id" SERIAL NOT NULL,
    "cliente_id" INTEGER NOT NULL,
    "tipo" "tipo_sede" NOT NULL DEFAULT 'OPERATIVA',
    "nome" TEXT,
    "indirizzo" TEXT NOT NULL,
    "civico" TEXT NOT NULL,
    "cap" TEXT NOT NULL,
    "citta" TEXT NOT NULL,
    "provincia" TEXT NOT NULL,

    CONSTRAINT "cliente_sede_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cliente_contatto" (
    "id" SERIAL NOT NULL,
    "sede_id" INTEGER NOT NULL,
    "nome" VARCHAR(150) NOT NULL,
    "email" VARCHAR(255),
    "telefono" VARCHAR(30),

    CONSTRAINT "cliente_contatto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cliente_partita_iva_key" ON "cliente"("partita_iva");

-- AddForeignKey
ALTER TABLE "corso" ADD CONSTRAINT "corso_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commessa" ADD CONSTRAINT "commessa_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cliente" ADD CONSTRAINT "cliente_agente_id_fkey" FOREIGN KEY ("agente_id") REFERENCES "agente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cliente_sede" ADD CONSTRAINT "cliente_sede_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cliente_contatto" ADD CONSTRAINT "cliente_contatto_sede_id_fkey" FOREIGN KEY ("sede_id") REFERENCES "cliente_sede"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
