/*
  Warnings:

  - You are about to drop the column `created_at` on the `materiale` table. All the data in the column will be lost.
  - You are about to drop the column `created_by` on the `materiale` table. All the data in the column will be lost.
  - You are about to drop the column `file_name` on the `materiale` table. All the data in the column will be lost.
  - You are about to drop the column `tipo` on the `materiale` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `materiale` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[storageKey]` on the table `materiale` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `mimeType` to the `materiale` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalName` to the `materiale` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sizeBytes` to the `materiale` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storageKey` to the `materiale` table without a default value. This is not possible if the table is not empty.
  - Added the required column `titolo` to the `materiale` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CategoriaMateriale" AS ENUM ('SLIDE', 'DISPENSA', 'VIDEO', 'ESERCIZI', 'ALTRO');

-- AlterTable
ALTER TABLE "materiale" DROP COLUMN "created_at",
DROP COLUMN "created_by",
DROP COLUMN "file_name",
DROP COLUMN "tipo",
DROP COLUMN "url",
ADD COLUMN     "categoria" "CategoriaMateriale" NOT NULL DEFAULT 'ALTRO',
ADD COLUMN     "checksum" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "mimeType" TEXT NOT NULL,
ADD COLUMN     "originalName" TEXT NOT NULL,
ADD COLUMN     "sizeBytes" INTEGER NOT NULL,
ADD COLUMN     "storageKey" TEXT NOT NULL,
ADD COLUMN     "titolo" TEXT NOT NULL,
ADD COLUMN     "uploadedById" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "materiale_storageKey_key" ON "materiale"("storageKey");
