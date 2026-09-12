/*
  Warnings:

  - The primary key for the `programma_modulo` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[programma_id,ordine]` on the table `programma_modulo` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "programma_modulo_programma_id_modulo_id_key";

-- AlterTable
ALTER TABLE "docente" ADD COLUMN     "colore" TEXT NOT NULL DEFAULT '#1976d2';

-- AlterTable
ALTER TABLE "modulo" ADD COLUMN     "multiplo" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "programma_modulo" DROP CONSTRAINT "programma_modulo_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "programma_modulo_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "programma_modulo_programma_id_ordine_key" ON "programma_modulo"("programma_id", "ordine");
