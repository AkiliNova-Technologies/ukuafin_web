import {
  LayoutDashboard,
  Building2,
  Users,
  UserCheck,
  PiggyBank,
  Coins,
  HandCoins,
  Receipt,
  FileBarChart,
  ShieldAlert,
  Settings,
  Layers,
  LifeBuoy,
  User,
  FileText,
  LucideIcon
} from "lucide-react"

export type DashboardRole = "tenant" | "member" | "platform"

export interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }> | LucideIcon;
}

export const NAVIGATION_MAPS: Record<DashboardRole, {
  brand: { name: string; description: string };
  main: NavItem[];
  secondary: NavItem[];
  user?: NavItem[];
}> = {
  tenant: {
    brand: { name: "Square Sacco Workspace", description: "Operations Terminal" },
    main: [
      { title: "Overview", url: "/tenant/dashboard", icon: LayoutDashboard },
      { title: "Branches", url: "/tenant/branches", icon: Building2 },
      { title: "Staff Directory", url: "/tenant/staff", icon: UserCheck },
      { title: "Members Registry", url: "/tenant/members", icon: Users },
      { title: "Savings Accounts", url: "/tenant/savings", icon: PiggyBank },
      { title: "Share Ledger", url: "/tenant/shares", icon: Coins },
      { title: "Loan Portfolios", url: "/tenant/loans", icon: HandCoins },
      { title: "Repayments Engine", url: "/tenant/repayments", icon: Receipt },
    ],
    secondary: [
      { title: "Reporting Engine", url: "/tenant/reports", icon: FileBarChart },
      { title: "Audit Trail", url: "/tenant/audit-logs", icon: ShieldAlert },
      { title: "Sacco Settings", url: "/tenant/settings", icon: Settings },
    ],
    user: [
      { title: "Account", url: "/tenant/account", icon: User },
      { title: "Billing & Subscription", url: "/tenant/billing", icon: User }
    ],
  },
  member: {
    brand: { name: "Member Portal", description: "Self Service Hub" },
    main: [
      { title: "My Dashboard", url: "/member/dashboard", icon: LayoutDashboard },
      { title: "Savings Ledger", url: "/member/savings", icon: PiggyBank },
      { title: "My Share Capital", url: "/member/shares", icon: Coins },
      { title: "Loan Application", url: "/member/loans", icon: HandCoins },
      { title: "Repayment Tracker", url: "/member/repayments", icon: Receipt },
    ],
    secondary: [
      { title: "Statements", url: "/member/statements", icon: FileText },
      { title: "My KYC Profile", url: "/member/profile", icon: User },
    ],
    user: [{ title: "Account Settings", url: "/member/profile", icon: Settings }]
  },
  platform: {
    brand: { name: "AkiliNova Admin", description: "SaaS Control Plane" },
    main: [
      { title: "SaaS Overview", url: "/platform/dashboard", icon: LayoutDashboard },
      { title: "Sacco Tenants", url: "/platform/organizations", icon: Building2 },
      { title: "Billing & Invoices", url: "/platform/billing", icon: Receipt },
      { title: "Subscription Plans", url: "/platform/subscriptions", icon: Layers },
    ],
    secondary: [
      { title: "Support Tickets", url: "/platform/support", icon: LifeBuoy },
      { title: "Global Configuration", url: "/platform/settings", icon: Settings },
    ],
    user: [{ title: "Admin Profile", url: "/platform/account", icon: User }],
  }
}