import { prisma } from "@/lib/prisma/client";
import bcrypt from "bcryptjs";
import {
  PlatformRole,
  OrganizationStatus,
  UserStatus,
  BranchStatus,
  MemberStatus,
  Gender,
  AccountStatus,
  TransactionType,
  TransactionStatus,
  LoanStatus,
  RepaymentStatus,
  InterestMethod,
  BillingCycle,
  SubscriptionStatus,
} from "@prisma/client";

const STATIC_PASSWORD_HASH = bcrypt.hashSync("Password123!", 10);

const PERMISSIONS_DICTIONARY = [
  // --- Members Module ---
  {
    key: "members.view",
    name: "View Members Directory",
    module: "members",
    description: "Allows viewing of member profiles and directories.",
  },
  {
    key: "members.create",
    name: "Create Members",
    module: "members",
    description: "Allows registering new members into the system.",
  },
  {
    key: "members.update",
    name: "Update Members",
    module: "members",
    description: "Allows editing existing member bio-data and status.",
  },

  // --- Savings Module ---
  {
    key: "savings.view",
    name: "View Savings",
    module: "savings",
    description: "Allows viewing savings ledger balances and statements.",
  },
  {
    key: "savings.create",
    name: "Create Deposits",
    module: "savings",
    description: "Allows processing client deposit transactions.",
  },
  {
    key: "savings.withdraw",
    name: "Process Withdrawals",
    module: "savings",
    description: "Allows authorizing cash withdrawal payouts.",
  },

  // --- Shares Module ---
  {
    key: "shares.view",
    name: "View Share Registers",
    module: "shares",
    description: "Allows tracking institutional share capital allocations.",
  },
  {
    key: "shares.manage",
    name: "Manage Share Adjustments",
    module: "shares",
    description: "Allows executing equity share transfers or adjustments.",
  },

  // --- Loans Module ---
  {
    key: "loans.view",
    name: "View Loans",
    module: "loans",
    description:
      "Allows assessing running credit books and application pipelines.",
  },
  {
    key: "loans.apply",
    name: "Submit Loan Applications",
    module: "loans",
    description: "Allows staging loan application parameters for review.",
  },
  {
    key: "loans.approve",
    name: "Approve Loans",
    module: "loans",
    description:
      "Critical permission to authorize capital underwriting and disbursement.",
  },

  // --- Repayments Module ---
  {
    key: "repayments.post",
    name: "Post Repayment Logs",
    module: "repayments",
    description: "Allows logging client loan installment remittances.",
  },

  // --- Core Logistical Branches & Staff ---
  {
    key: "branches.manage",
    name: "Manage Branches",
    module: "organization",
    description: "Allows creation and administrative teardown of office nodes.",
  },
  {
    key: "staff.manage",
    name: "Manage Staff Directory",
    module: "staff",
    description: "Allows configuring application console access for operators.",
  },

  // --- Analytics & Auditing ---
  {
    key: "reports.view",
    name: "View Reports",
    module: "reports",
    description: "Allows compilation and download of financial reports.",
  },
  {
    key: "audit.view",
    name: "View System Audit Logs",
    module: "system",
    description:
      "High-security access clearance to audit tenant mutation logs.",
  },
  {
    key: "settings.manage",
    name: "Manage Settings",
    module: "settings",
    description:
      "Allows modifying organization rules, thresholds, and variables.",
  },
];

async function main() {
  console.log("🚀 Starting database purification and seeding deployment...");

  // Clear existing entries to prevent primary key/unique clashes on repeat runs
  await prisma.financialTransaction.deleteMany();
  await prisma.loanSchedule.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.loanProduct.deleteMany();
  await prisma.savingsAccount.deleteMany();
  await prisma.shareAccount.deleteMany();
  await prisma.userPermission.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.user.deleteMany();
  await prisma.member.deleteMany();
  await prisma.role.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.organizationSubscription.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.subscriptionPlan.deleteMany();

  console.log("🧹 Database cleared cleanly.");

  // ==========================================
  // 1. GLOBAL SYSTEM FOUNDATIONS & PLANS MATRIX
  // ==========================================
  console.log("🌱 Seeding Global Foundations & Pricing Matrices...");

  await prisma.permission.createMany({
    data: PERMISSIONS_DICTIONARY.map((perm) => ({
      key: perm.key,
      name: perm.name,
      module: perm.module,
      description: perm.description,
    })),
    skipDuplicates: true,
  });

  const seededPermissions = await prisma.permission.findMany();

  const subscriptionPlansData = [
    {
      name: "Sacco Starter Core",
      slug: "sacco-starter-core",
      description: "Essential structural ledger infrastructure for newly formed savings groups and micro-Saccos.",
      price: 49,
      currency: "USD",
      billingCycle: BillingCycle.MONTHLY,
      maxBranches: 1,
      maxMembers: 500,
      maxStaff: 5,
      hasSms: true,
      hasAdvancedReports: false,
      hasApiAccess: false,
      isActive: true,
    },
    {
      name: "Sacco Growth Tier",
      slug: "sacco-growth-tier",
      description: "Optimized workspace layout plan for scaling mid-tier institutional credit networks.",
      price: 99,
      currency: "USD",
      billingCycle: BillingCycle.MONTHLY,
      maxBranches: 5,
      maxMembers: 5000,
      maxStaff: 25,
      hasSms: true,
      hasAdvancedReports: true,
      hasApiAccess: false,
      isActive: true,
    },
    {
      name: "Sacco Enterprise Pro",
      slug: "sacco-enterprise-pro",
      description: "Complete unconstrained multi-branch control framework with advanced audit tracing and API hooks.",
      price: 249,
      currency: "USD",
      billingCycle: BillingCycle.MONTHLY,
      maxBranches: 20,
      maxMembers: 50000,
      maxStaff: 100,
      hasSms: true,
      hasAdvancedReports: true,
      hasApiAccess: true,
      isActive: true,
    }
  ];

  console.log("💳 Provisioning commercial subscription matrices...");

  const createdPlans = [];
  for (const plan of subscriptionPlansData) {
    const p = await prisma.subscriptionPlan.create({ data: plan });
    createdPlans.push(p);
  }

  const growthPlan = createdPlans.find((p) => p.slug === "sacco-growth-tier")!;

  // ==========================================
  // 2. MULTI-TENANT REAL ESTATE
  // ==========================================
  console.log("🏢 Seeding Tenant Real Estate...");

  const targetOrg = await prisma.organization.create({
    data: {
      name: "Square Capital Sacco Ltd",
      slug: "square-capital",
      registrationNumber: "SOC/10924",
      email: "operations@squarecapital.co.ug",
      phone: "+256701234567",
      address: "Plot 45, Kampala Road, Sector 3",
      country: "Uganda",
      currency: "UGX",
      timezone: "Africa/Kampala",
      status: OrganizationStatus.ACTIVE,
      activatedAt: new Date(),
      trialEndsAt: new Date("2026-12-31"),
    },
  });

  await prisma.organizationSubscription.create({
    data: {
      organizationId: targetOrg.id,
      planId: growthPlan.id,
      status: SubscriptionStatus.ACTIVE,
      startedAt: new Date(),
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date("2026-07-09"),
    },
  });

  const mainBranch = await prisma.branch.create({
    data: {
      organizationId: targetOrg.id,
      name: "Kampala Central Branch",
      code: "KLA01",
      phone: "+256414987654",
      email: "kampala@squarecapital.co.ug",
      address: "Mukwano Courts, Floor 2",
      status: BranchStatus.ACTIVE,
    },
  });

  // ==========================================
  // 3. IAM - ROLES, SYSTEM USERS & MEMBERS
  // ==========================================
  console.log("🔑 Seeding IAM Framework Access Controls...");

  const adminRole = await prisma.role.create({
    data: {
      organizationId: targetOrg.id,
      name: "Sacco System Admin",
      key: "sacco_admin",
      description: "Full contextual operations control over this workspace environment.",
      isSystem: true,
    },
  });

  const rolePermissionsPayload = seededPermissions.map((perm) => ({
    roleId: adminRole.id,
    permissionId: perm.id,
  }));
  await prisma.rolePermission.createMany({
    data: rolePermissionsPayload,
  });

  // User 1: Platform Super Admin (Bypasses Tenant Boundaries Safely)
  await prisma.user.create({
    data: {
      name: "Albert Watbin Admin",
      email: "superadmin@akilinova.com",
      passwordHash: STATIC_PASSWORD_HASH,
      platformRole: PlatformRole.PLATFORM_SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
      organizationId: null, // FIXED: Explicit isolation escape parameter alignment
      branchId: null,
    },
  });

  // User 2: Tenant Executive Staff Account
  const staffUser = await prisma.user.create({
    data: {
      organizationId: targetOrg.id,
      branchId: mainBranch.id,
      name: "Nsubuga Moses",
      email: "moses@squarecapital.co.ug",
      passwordHash: STATIC_PASSWORD_HASH,
      roleId: adminRole.id,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
    },
  });

  // Member Base Setup
  const testMember = await prisma.member.create({
    data: {
      organizationId: targetOrg.id,
      branchId: mainBranch.id,
      memberNo: "KLA01-MBR-00001",
      firstName: "Brian",
      lastName: "Okello",
      middleName: "Emmanuel",
      gender: Gender.MALE,
      dateOfBirth: new Date("1992-04-15"),
      nationalId: "CM9203410283HJ",
      phone: "+256772111222",
      email: "brian.okello@gmail.com",
      address: "Ntinda, Kampala",
      occupation: "Agribusiness Manager",
      status: MemberStatus.ACTIVE,
      joinedAt: new Date("2025-01-10"),
    },
  });

  // User 3: Member Portal Self-Service Account
  await prisma.user.create({
    data: {
      organizationId: targetOrg.id,
      branchId: mainBranch.id,
      memberId: testMember.id,
      name: "Brian Okello",
      email: "brian.okello@gmail.com",
      passwordHash: STATIC_PASSWORD_HASH,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
    },
  });

  // ==========================================
  // 4. FINANCIAL INSTRUMENTS & OPERATIONALS
  // ==========================================
  console.log("💰 Seeding Financial Instruments & Operational Metrics...");

  const savingsAcc = await prisma.savingsAccount.create({
    data: {
      organizationId: targetOrg.id,
      branchId: mainBranch.id,
      memberId: testMember.id,
      accountNo: "SA-KLA-001-109",
      name: "Ordinary Savings Account",
      balance: 1450000.0,
      status: AccountStatus.ACTIVE,
    },
  });

  await prisma.shareAccount.create({
    data: {
      organizationId: targetOrg.id,
      branchId: mainBranch.id,
      memberId: testMember.id,
      accountNo: "SH-KLA-001-109",
      shares: 50.0,
      shareValue: 25000.0,
      status: AccountStatus.ACTIVE,
    },
  });

  const standardLoanProduct = await prisma.loanProduct.create({
    data: {
      organizationId: targetOrg.id,
      name: "Emergency Asset Development Loan",
      description: "Short-to-medium window financing structure targeted at micro-enterprise execution.",
      minAmount: 500000,
      maxAmount: 20000000,
      interestRate: 12.5,
      interestMethod: InterestMethod.REDUCING_BALANCE,
      minTermMonths: 3,
      maxTermMonths: 24,
      requiresGuarantor: true,
      isActive: true,
    },
  });

  const runningLoan = await prisma.loan.create({
    data: {
      organizationId: targetOrg.id,
      branchId: mainBranch.id,
      memberId: testMember.id,
      loanProductId: standardLoanProduct.id,
      loanNo: "LN-2026-0089",
      principalAmount: 5000000.0,
      interestAmount: 625000.0,
      totalPayable: 5625000.0,
      outstandingBalance: 3750000.0,
      interestRate: 12.5,
      interestMethod: InterestMethod.REDUCING_BALANCE,
      termMonths: 12,
      disbursedAt: new Date("2026-01-15"),
      dueDate: new Date("2027-01-15"),
      status: LoanStatus.ACTIVE,
    },
  });

  await prisma.loanSchedule.createMany({
    data: [
      {
        loanId: runningLoan.id,
        installmentNo: 1,
        dueDate: new Date("2026-07-15"),
        principalDue: 416666.67,
        interestDue: 52083.33,
        totalDue: 468750.0,
        amountPaid: 0,
        status: RepaymentStatus.PENDING,
      },
      {
        loanId: runningLoan.id,
        installmentNo: 2,
        dueDate: new Date("2026-08-15"),
        principalDue: 416666.67,
        interestDue: 52083.33,
        totalDue: 468750.0,
        amountPaid: 0,
        status: RepaymentStatus.PENDING,
      },
    ],
  });

  await prisma.financialTransaction.create({
    data: {
      organizationId: targetOrg.id,
      branchId: mainBranch.id,
      savingsAccountId: savingsAcc.id,
      type: TransactionType.DEPOSIT,
      status: TransactionStatus.COMPLETED,
      amount: 1450000.0,
      reference: "TRX-DEP-90823",
      description: "Initial cash account floating capital layout injection setup.",
      createdById: staffUser.id,
      approvedById: staffUser.id,
      approvedAt: new Date(),
    },
  });

  console.log(`\n✨ Seeding operational cycles completed successfully.`);
  console.log(`📊 Matrix deployment completed under Organization: "${targetOrg.name}" [${targetOrg.slug}]`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(
      "❌ Exception broken trace during migration seed sequence execute:",
      e,
    );
    await prisma.$disconnect();
    process.exit(1);
  });
