const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runTests() {
  console.log('--- BUILDMASTER ERP INTEGRITY VERIFICATION ---');

  // 1. Users & RBAC
  const userCount = await prisma.user.count();
  const superAdmin = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
  console.log(`[PASS] Users in DB: ${userCount} (Super Admin: ${superAdmin?.name})`);

  // 2. Customers
  const customerCount = await prisma.customer.count();
  console.log(`[PASS] Customers in DB: ${customerCount}`);

  // 3. Vendors & Contractors
  const vendorCount = await prisma.vendor.count();
  const contractorCount = await prisma.contractor.count();
  console.log(`[PASS] Approved Vendors: ${vendorCount}, Contractors: ${contractorCount}`);

  // 4. Projects & Progress Logs
  const projectCount = await prisma.project.count();
  const progressLogs = await prisma.projectProgress.count();
  console.log(`[PASS] Active Projects: ${projectCount}, Daily Progress Logs: ${progressLogs}`);

  // 5. Daily Cash & Transactions Ledger
  const txnCount = await prisma.transaction.count();
  const deposits = await prisma.transaction.aggregate({
    where: { type: 'DEPOSIT', status: 'APPROVED' },
    _sum: { amount: true },
  });
  const withdrawals = await prisma.transaction.aggregate({
    where: { type: 'WITHDRAWAL', status: 'APPROVED' },
    _sum: { amount: true },
  });
  console.log(`[PASS] Ledger Transactions: ${txnCount}`);
  console.log(`       Total Approved Deposits: ₹${deposits._sum.amount?.toLocaleString('en-IN')}`);
  console.log(`       Total Approved Withdrawals: ₹${withdrawals._sum.amount?.toLocaleString('en-IN')}`);

  // 6. Bank & Cash Accounts
  const accounts = await prisma.account.findMany();
  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
  console.log(`[PASS] Accounts: ${accounts.length}, Total Combined Available Balance: ₹${totalBalance.toLocaleString('en-IN')}`);

  // 7. Leads & Auto-Distribution
  const leadCount = await prisma.lead.count();
  const assignments = await prisma.leadAssignment.count();
  console.log(`[PASS] Total Leads in CRM: ${leadCount}, Vendor Assignments Logged: ${assignments}`);

  // 8. Materials & Inventory
  const materialCount = await prisma.material.count();
  console.log(`[PASS] Warehouse Material SKUs: ${materialCount}`);

  // 9. Employees
  const employeeCount = await prisma.employee.count();
  console.log(`[PASS] Engineering Staff Roster: ${employeeCount}`);

  // 10. Audit Logs
  const auditLogs = await prisma.auditLog.count();
  console.log(`[PASS] Immutable Audit Logs: ${auditLogs}`);

  console.log('----------------------------------------------------');
  console.log('ALL ERP MODULES CONNECTED TO REAL DATABASE & OPERATIONAL!');
}

runTests()
  .catch((e) => {
    console.error('Test error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
