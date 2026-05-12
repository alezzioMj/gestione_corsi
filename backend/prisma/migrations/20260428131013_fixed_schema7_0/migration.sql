/*
  Warnings:

  - A unique constraint covering the columns `[docente_cf,data,ora_inizio,ora_fine]` on the table `sessione` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "sessione_docente_cf_data_ora_inizio_ora_fine_key" ON "sessione"("docente_cf", "data", "ora_inizio", "ora_fine");
