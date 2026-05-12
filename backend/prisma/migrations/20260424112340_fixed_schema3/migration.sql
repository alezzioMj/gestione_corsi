/*
  Warnings:

  - The values [Tecnica] on the enum `competenza_enum` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `azienda` on the `corso` table. All the data in the column will be lost.
  - Added the required column `cliente` to the `corso` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "competenza_enum_new" AS ENUM ('Pratica', 'Teorica', 'Trasversale');
ALTER TABLE "modulo" ALTER COLUMN "competenza" TYPE "competenza_enum_new" USING ("competenza"::text::"competenza_enum_new");
ALTER TYPE "competenza_enum" RENAME TO "competenza_enum_old";
ALTER TYPE "competenza_enum_new" RENAME TO "competenza_enum";
DROP TYPE "public"."competenza_enum_old";
COMMIT;

-- AlterTable
ALTER TABLE "corso" DROP COLUMN "azienda",
ADD COLUMN     "cliente" VARCHAR(150) NOT NULL;

-- AlterTable
ALTER TABLE "materiale" ALTER COLUMN "descrizione" DROP NOT NULL;
