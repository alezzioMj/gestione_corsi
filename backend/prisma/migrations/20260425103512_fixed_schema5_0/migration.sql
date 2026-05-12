-- AlterTable
ALTER TABLE "indisponibilita" ADD COLUMN     "aula_id" INTEGER;

-- AddForeignKey
ALTER TABLE "indisponibilita" ADD CONSTRAINT "indisponibilita_aula_id_fkey" FOREIGN KEY ("aula_id") REFERENCES "aula"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
