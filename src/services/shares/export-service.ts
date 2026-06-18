import { prisma } from "@/lib/prisma/client";
import { Prisma } from "@prisma/client";

export interface PortfolioExportResult {
  fileName: string;
  csvStringPayload: string;
  totalRecordsCompiled: number;
  aggregatedCapitalValue: number;
}

export const SharePortfolioExporter = {
  /**
   * Compiles and outputs a raw structured CSV data payload representing 
   * the complete active shared equity profile ledger within the tenant isolation bounds.
   */
  async generateDistributionLedgerCSV(organizationId: string): Promise<PortfolioExportResult> {
    // 1. Extract raw active positions via our secure client instance
    const shareAccounts = await prisma.shareAccount.findMany({
      where: {
        organizationId,
        status: "ACTIVE"
      },
      include: {
        member: {
          select: {
            memberNo: true,
            firstName: true,
            lastName: true,
            phone: true
          }
        }
      },
      orderBy: { accountNo: "asc" }
    });

    // 2. Define standard RFC 4180 structural CSV escaping blocks
    const csvRowsHeader = [
      "Share Account Number",
      "Member Number",
      "Full Name",
      "Contact Phone",
      "Total Owned Volumes (Shares)",
      "Current Value Asset Balance"
    ];

    let processedSumAccumulator = 0;
    const dataLines = shareAccounts.map(account => {
      const currentShareCount = new Prisma.Decimal(account.shares).toNumber();
      const monetaryBalanceValue = new Prisma.Decimal(account.shareValue).toNumber();
      
      processedSumAccumulator += monetaryBalanceValue;

      const escapedFullName = `"${account.member.firstName.replace(/"/g, '""')} ${account.member.lastName.replace(/"/g, '""')}"`;
      
      return [
        account.accountNo,
        account.member.memberNo,
        escapedFullName,
        account.member.phone || "N/A",
        currentShareCount,
        monetaryBalanceValue
      ].join(",");
    });

    // 3. Assemble complete row layout string payload
    const csvStringPayload = [
      csvRowsHeader.join(","),
      ...dataLines
    ].join("\n");

    const formattedDateStamp = new Date().toISOString().split("T")[0];
    const fileName = `Share_Portfolio_Distribution_${organizationId}_${formattedDateStamp}.csv`;

    return {
      fileName,
      csvStringPayload,
      totalRecordsCompiled: shareAccounts.length,
      aggregatedCapitalValue: processedSumAccumulator
    };
  }
};