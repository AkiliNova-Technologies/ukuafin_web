import { EmptyState } from "@/components/ui/empty-state"
import { LayoutDashboard } from "lucide-react"
import { prisma } from "@/lib/prisma/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

async function getBillingData(organizationId: string) {
  const data = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: {
      subscriptions: {
        include: { plan: true },
      },
      invoices: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
  return data;
}

export default async function TenantSettingsPage() {
       const currentOrgId = "org_sacco_example_id"; 
  const organization = await getBillingData(currentOrgId);

  if (!organization) return <div>Organization context missing.</div>;

  const currentSub = organization.subscriptions[0];

  return (
    <div className="space-y-6">
      {/* Clean Reusable Empty State */}
      <EmptyState 
        icon={LayoutDashboard}
        title="Settings Unavailable"
        description="Settings management functionality is currently being set up in the background."
      />

 
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Billing & Licensing</h1>
        <p className="text-slate-500 text-sm mt-1">Manage system package subscriptions, invoice settlements, and track payment histories.</p>
      </div>

      {/* Subscription Tier Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border border-slate-100 shadow-sm rounded-2xl">
          <CardHeader>
            <CardDescription>Current Operating Plan</CardDescription>
            <CardTitle className="text-2xl text-slate-900 mt-1">
              {currentSub?.plan?.name || "No Active License Plan Registered"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600 space-y-2">
            <div className="flex justify-between border-b pb-2 border-slate-50">
              <span>Subscription Status:</span>
              <Badge variant={currentSub?.status === "ACTIVE" ? "default" : "secondary"} className="rounded-full">
                {currentSub?.status || "INACTIVE"}
              </Badge>
            </div>
            {currentSub?.currentPeriodEnd && (
              <div className="flex justify-between pt-1">
                <span>Next Automatic Renewal Settlement Date:</span>
                <span className="font-semibold text-slate-900">
                  {format(new Date(currentSub.currentPeriodEnd), "PPP")}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-slate-100 shadow-sm rounded-2xl bg-slate-50/50">
          <CardHeader>
            <CardDescription>System Capacity Metrics</CardDescription>
            <CardTitle className="text-xl text-slate-800">Operational Pool</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-500 space-y-1">
            <p>• Multi-Branch Routing Status: <span className="font-semibold text-slate-700">Enabled</span></p>
            <p>• Ledger Integration Hooking: <span className="font-semibold text-slate-700">Active</span></p>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Ledger Data Listing Element */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 tracking-tight">Settlement Invoices Ledger</h3>
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm text-slate-500">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="p-4">Invoice Number</th>
                <th className="p-4">Date Issued</th>
                <th className="p-4">Outstanding Balances</th>
                <th className="p-4">Settlement Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {organization.invoices.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400 text-xs">
                    No system checkout invoice receipts generated yet.
                  </td>
                </tr>
              ) : (
                organization.invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4 font-mono text-xs text-slate-900">{inv.invoiceNo}</td>
                    <td className="p-4 text-xs">{format(new Date(inv.createdAt), "MMM dd, yyyy")}</td>
                    <td className="p-4 text-xs font-semibold text-slate-900">
                      {inv.currency} {Number(inv.amount).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className={cn(
                        "text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider",
                        inv.status === "PAID" && "bg-emerald-50 text-emerald-700 border border-emerald-100",
                        inv.status === "DRAFT" && "bg-amber-50 text-amber-700 border border-amber-100",
                        inv.status === "CANCELLED" && "bg-slate-100 text-slate-600",
                        inv.status === "FAILED" && "bg-rose-50 text-rose-700 border border-rose-100"
                      )}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    </div>
  )
}