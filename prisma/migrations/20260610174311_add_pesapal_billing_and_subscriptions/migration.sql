-- CreateEnum
CREATE TYPE "PaymentGateway" AS ENUM ('PESAPAL', 'STRIPE', 'CASH', 'BANK_TRANSFER');

-- CreateEnum
CREATE TYPE "WebhookProcessStatus" AS ENUM ('UNPROCESSED', 'PROCESSED', 'FAILED', 'SKIPPED');

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "subTotal" DECIMAL(18,2) NOT NULL DEFAULT 0.00,
ADD COLUMN     "tax" DECIMAL(18,2) NOT NULL DEFAULT 0.00;

-- AlterTable
ALTER TABLE "OrganizationSubscription" ADD COLUMN     "gracePeriodEndsAt" TIMESTAMP(3),
ADD COLUMN     "pesapalAccountToken" TEXT;

-- CreateTable
CREATE TABLE "InvoiceItem" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(18,2) NOT NULL,
    "totalPrice" DECIMAL(18,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvoiceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PesapalIpnRegistry" (
    "id" TEXT NOT NULL,
    "ipnId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "environment" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PesapalIpnRegistry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PesapalWebhookLog" (
    "id" TEXT NOT NULL,
    "orderTrackingId" TEXT NOT NULL,
    "merchantRef" TEXT NOT NULL,
    "eventType" TEXT,
    "payload" JSONB NOT NULL,
    "status" "WebhookProcessStatus" NOT NULL DEFAULT 'UNPROCESSED',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PesapalWebhookLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InvoiceItem_invoiceId_idx" ON "InvoiceItem"("invoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "PesapalIpnRegistry_ipnId_key" ON "PesapalIpnRegistry"("ipnId");

-- CreateIndex
CREATE INDEX "PesapalIpnRegistry_ipnId_idx" ON "PesapalIpnRegistry"("ipnId");

-- CreateIndex
CREATE INDEX "PesapalWebhookLog_orderTrackingId_idx" ON "PesapalWebhookLog"("orderTrackingId");

-- CreateIndex
CREATE INDEX "PesapalWebhookLog_merchantRef_idx" ON "PesapalWebhookLog"("merchantRef");

-- CreateIndex
CREATE INDEX "PesapalWebhookLog_status_idx" ON "PesapalWebhookLog"("status");

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
