-- DropForeignKey
ALTER TABLE "sessione" DROP CONSTRAINT "sessione_aula_id_fkey";

-- DropForeignKey
ALTER TABLE "sessione" DROP CONSTRAINT "sessione_corso_id_fkey";

-- DropForeignKey
ALTER TABLE "sessione" DROP CONSTRAINT "sessione_docente_cf_fkey";

-- DropForeignKey
ALTER TABLE "sessione" DROP CONSTRAINT "sessione_modulo_id_fkey";

-- DropForeignKey
ALTER TABLE "sessione" DROP CONSTRAINT "sessione_sede_id_fkey";

-- AlterTable
ALTER TABLE "sessione" ALTER COLUMN "docente_cf" DROP NOT NULL,
ALTER COLUMN "aula_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "sessione" ADD CONSTRAINT "sessione_aula_id_fkey" FOREIGN KEY ("aula_id") REFERENCES "aula"("id") ON DELETE SET NULL ON UPDATE SET NULL;

-- AddForeignKey
ALTER TABLE "sessione" ADD CONSTRAINT "sessione_corso_id_fkey" FOREIGN KEY ("corso_id") REFERENCES "corso"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessione" ADD CONSTRAINT "sessione_docente_cf_fkey" FOREIGN KEY ("docente_cf") REFERENCES "docente"("codice_fiscale") ON DELETE SET NULL ON UPDATE SET NULL;

-- AddForeignKey
ALTER TABLE "sessione" ADD CONSTRAINT "sessione_modulo_id_fkey" FOREIGN KEY ("modulo_id") REFERENCES "modulo"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "sessione" ADD CONSTRAINT "sessione_sede_id_fkey" FOREIGN KEY ("sede_id") REFERENCES "sede"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
