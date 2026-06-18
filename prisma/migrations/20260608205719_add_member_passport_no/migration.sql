/*
  Warnings:

  - A unique constraint covering the columns `[organizationId,passportNo]` on the table `Member` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "passportNo" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Member_organizationId_passportNo_key" ON "Member"("organizationId", "passportNo");
