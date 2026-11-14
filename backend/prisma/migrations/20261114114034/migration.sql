-- DropForeignKey
ALTER TABLE "cliente_contatto" DROP CONSTRAINT "cliente_contatto_sede_id_fkey";

-- DropForeignKey
ALTER TABLE "cliente_sede" DROP CONSTRAINT "cliente_sede_cliente_id_fkey";

-- AddForeignKey
ALTER TABLE "cliente_sede" ADD CONSTRAINT "cliente_sede_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cliente_contatto" ADD CONSTRAINT "cliente_contatto_sede_id_fkey" FOREIGN KEY ("sede_id") REFERENCES "cliente_sede"("id") ON DELETE CASCADE ON UPDATE CASCADE;
