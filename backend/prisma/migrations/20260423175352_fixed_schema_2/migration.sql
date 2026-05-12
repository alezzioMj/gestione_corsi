-- AlterTable
ALTER TABLE "docente" ALTER COLUMN "created_by" DROP NOT NULL;

-- AlterTable
ALTER TABLE "sede" ALTER COLUMN "descrizione" DROP NOT NULL,
ALTER COLUMN "created_by" DROP NOT NULL;
