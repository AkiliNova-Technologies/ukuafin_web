import { prisma } from "@/lib/prisma/client";
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, AlertTriangle, ArrowRight, RefreshCw } from "lucide-react";
import Link from "next/link";

async function getTransactionStatus(merchantRef: string) {
  // Look up the invoice related to the merchant reference to determine success status
  const invoice = await prisma.invoice.findFirst({
    where: { invoiceNo: merchantRef },
    include: { organization: true }
  });
  return invoice;
}

interface CallbackPageProps {
  searchParams: Promise<{ OrderTrackingId?: string; OrderMerchantReference?: string }>;
}

export default async function CheckoutCallbackPage({ searchParams }: CallbackPageProps) {
  const resolvedParams = await searchParams;
  const trackingId = resolvedParams.OrderTrackingId;
  const merchantRef = resolvedParams.OrderMerchantReference;

  if (!merchantRef) {
    return <FallbackErrorCard message="Invalid callback context parameters received." />;
  }

  const invoice = await getTransactionStatus(merchantRef);

  // Fallback Case A: SUCCESSFUL payment confirmation
  if (invoice?.status === "PAID") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-xl rounded-2xl p-6 text-center space-y-6 bg-white animate-scale-up">
          <div className="mx-auto size-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="size-6" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-xl font-bold text-slate-900">Payment Settled Successfully</CardTitle>
            <CardDescription className="text-xs">
              Your billing invoice <span className="font-mono text-slate-700">{merchantRef}</span> has cleared.
            </CardDescription>
          </div>
          <CardContent className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs text-slate-600 text-left space-y-1.5">
            <p>• Organization: <span className="font-bold text-slate-900">{invoice.organization.name}</span></p>
            <p>• Reference ID: <span className="font-mono text-slate-500">{trackingId?.substring(0, 8)}...</span></p>
            <p>• Provisioned Nodes: <span className="text-emerald-700 font-semibold">Active & Operational</span></p>
          </CardContent>
          <CardFooter className="pt-2">
            <Link href="/tenant/dashboard" className="w-full">
              <Button className="w-full h-11 bg-primary text-white hover:bg-primary/90 font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm">
                Enter Core Workspace <ArrowRight className="size-3.5" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Fallback Case B: CANCELLED or FAILED payment confirmations
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-xl rounded-2xl p-6 text-center space-y-6 bg-white animate-scale-up">
        <div className="mx-auto size-12 bg-rose-50 rounded-full flex items-center justify-center text-rose-600">
          <XCircle className="size-6" />
        </div>
        <div className="space-y-2">
          <CardTitle className="text-xl font-bold text-slate-900">Transaction Not Completed</CardTitle>
          <CardDescription className="text-xs">
            The clearing network returned an incomplete or cancelled processing state for this request.
          </CardDescription>
        </div>
        <CardContent className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
          No funds were deducted from your mobile money account or credit card. This occurs if a session times out, a prompt is dismissed, or account balances are insufficient.
        </CardContent>
        <CardFooter className="pt-2 flex flex-col sm:flex-row gap-3">
          <Link href={`/checkout?orgId=${invoice?.organizationId}`} className="w-full">
            <Button className="w-full h-11 bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2">
              <RefreshCw className="size-3.5" /> Retry Payment Session
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

// Private layout safety handler helper
function FallbackErrorCard({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border border-slate-100 text-center p-6 space-y-4">
        <AlertTriangle className="size-8 text-amber-500 mx-auto" />
        <CardTitle className="text-sm font-bold text-slate-900">System Trace Mismatch</CardTitle>
        <CardDescription className="text-xs">{message}</CardDescription>
      </Card>
    </div>
  );
}