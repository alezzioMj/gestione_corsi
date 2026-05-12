/*
  Warnings:

  - Made the column `mattina_inizio` on table `corso` required. This step will fail if there are existing NULL values in that column.
  - Made the column `mattina_fine` on table `corso` required. This step will fail if there are existing NULL values in that column.
  - Made the column `pomeriggio_inizio` on table `corso` required. This step will fail if there are existing NULL values in that column.
  - Made the column `pomeriggio_fine` on table `corso` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "corso" ALTER COLUMN "mattina_inizio" SET NOT NULL,
ALTER COLUMN "mattina_inizio" SET DATA TYPE TEXT,
ALTER COLUMN "mattina_fine" SET NOT NULL,
ALTER COLUMN "mattina_fine" SET DATA TYPE TEXT,
ALTER COLUMN "pomeriggio_inizio" SET NOT NULL,
ALTER COLUMN "pomeriggio_inizio" SET DATA TYPE TEXT,
ALTER COLUMN "pomeriggio_fine" SET NOT NULL,
ALTER COLUMN "pomeriggio_fine" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "indisponibilita" ALTER COLUMN "ora_inizio" SET DATA TYPE TEXT,
ALTER COLUMN "ora_fine" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "sessione" ALTER COLUMN "ora_inizio" SET DATA TYPE TEXT,
ALTER COLUMN "ora_fine" SET DATA TYPE TEXT;
