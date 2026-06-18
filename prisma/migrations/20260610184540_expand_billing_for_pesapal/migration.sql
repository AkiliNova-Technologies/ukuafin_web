/*
  Warnings:

  - A unique constraint covering the columns `[pesapalTrackingId]` on the table `Invoice` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "InvoiceStatus" ADD VALUE 'FAILED';
ALTER TYPE "InvoiceStatus" ADD VALUE 'REFUNDED';

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "pesapalTrackingId" TEXT;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "confirmationCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_pesapalTrackingId_key" ON "Invoice"("pesapalTrackingId");
