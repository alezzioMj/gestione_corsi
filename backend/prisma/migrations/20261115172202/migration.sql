/*
  Warnings:

  - You are about to drop the column `cliente_id` on the `corso` table. All the data in the column will be lost.
  - Added the required column `commessa_id` to the `corso` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "corso" DROP CONSTRAINT "corso_cliente_id_fkey";

-- AlterTable
ALTER TABLE "corso" DROP COLUMN "cliente_id",
ADD COLUMN     "commessa_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "corso" ADD CONSTRAINT "corso_commessa_id_fkey" FOREIGN KEY ("commessa_id") REFERENCES "commessa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
