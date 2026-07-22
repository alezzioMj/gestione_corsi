/*
  Warnings:

  - Added the required column `nome` to the `corso` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "corso" ADD COLUMN     "descrizione" TEXT,
ADD COLUMN     "nome" VARCHAR(150) NOT NULL;

-- AlterTable
ALTER TABLE "programma_modulo" ADD COLUMN     "n_ripetizioni" INTEGER NOT NULL DEFAULT 1;
