const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding BuildMaster ERP database...');

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.materialConsumption.deleteMany();
  await prisma.projectProgress.deleteMany();
  await prisma.transactionApproval.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.leadAssignment.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.project.deleteMany();
  await prisma.vendorDocument.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.material.deleteMany();
  await prisma.account.deleteMany();
  await prisma.systemSetting.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.contractor.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('admin123', 10);

  // 1. Users
  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@buildmaster.com',
      password: hashedPassword,
      name: 'Vikramaditya Singhania',
      phone: '+91 98765 43210',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
    },
  });

  const accountant = await prisma.user.create({
    data: {
      email: 'accountant@buildmaster.com',
      password: hashedPassword,
      name: 'Rohan Mehra',
      phone: '+91 98234 56789',
      role: 'ACCOUNTANT',
      status: 'ACTIVE',
    },
  });

  const manager = await prisma.user.create({
    data: {
      email: 'manager@buildmaster.com',
      password: hashedPassword,
      name: 'Sunil Deshmukh',
      phone: '+91 97123 45678',
      role: 'MANAGER',
      status: 'ACTIVE',
    },
  });

  const vendorUser1 = await prisma.user.create({
    data: {
      email: 'apex@vendor.com',
      password: hashedPassword,
      name: 'Anil Agarwal',
      phone: '+91 94111 22233',
      role: 'VENDOR',
      status: 'ACTIVE',
    },
  });

  const vendorUser2 = await prisma.user.create({
    data: {
      email: 'royal@vendor.com',
      password: hashedPassword,
      name: 'Manoj Bajpayee',
      phone: '+91 94222 33344',
      role: 'VENDOR',
      status: 'ACTIVE',
    },
  });

  const contractorUser1 = await prisma.user.create({
    data: {
      email: 'sharma@contractor.com',
      password: hashedPassword,
      name: 'Ramesh Sharma',
      phone: '+91 98333 44455',
      role: 'CONTRACTOR',
      status: 'ACTIVE',
    },
  });

  // 2. Vendors
  const vendor1 = await prisma.vendor.create({
    data: {
      userId: vendorUser1.id,
      vendorName: 'Apex Civil Infra Pvt Ltd',
      companyName: 'Apex Civil Infrastructure',
      contactPerson: 'Anil Agarwal',
      mobileNumber: '+91 94111 22233',
      email: 'apex@vendor.com',
      address: 'Plot 45, Sector 18, Industrial Estate',
      city: 'Mumbai',
      serviceAreas: 'Mumbai, Navi Mumbai, Thane, Pune',
      specialization: 'Civil Construction, Foundation, Structural Concrete',
      gstNumber: '27AABCU9603R1ZM',
      panNumber: 'AABCU9603R',
      bankName: 'HDFC Bank',
      accountNumber: '50200012345678',
      ifscCode: 'HDFC0000240',
      status: 'APPROVED',
      rating: 4.9,
      priority: 1,
    },
  });

  const vendor2 = await prisma.vendor.create({
    data: {
      userId: vendorUser2.id,
      vendorName: 'Royal Structural Works',
      companyName: 'Royal Steel & Precast Solutions',
      contactPerson: 'Manoj Bajpayee',
      mobileNumber: '+91 94222 33344',
      email: 'royal@vendor.com',
      address: 'B-12, Phase 2, MIDC',
      city: 'Pune',
      serviceAreas: 'Pune, PCMC, Nashik, Mumbai',
      specialization: 'Steel Fabrication, PEB Structures, Roofing',
      gstNumber: '27AAECR4512N1Z4',
      panNumber: 'AAECR4512N',
      bankName: 'ICICI Bank',
      accountNumber: '001105009876',
      ifscCode: 'ICIC0000011',
      status: 'APPROVED',
      rating: 4.7,
      priority: 2,
    },
  });

  const vendor3 = await prisma.vendor.create({
    data: {
      vendorName: 'Horizon Interiors & Finishes',
      companyName: 'Horizon Architectural Concepts',
      contactPerson: 'Kavita Reddy',
      mobileNumber: '+91 98111 77788',
      email: 'kavita@horizonfinishes.in',
      address: 'Level 3, Prime Plaza, Andheri West',
      city: 'Mumbai',
      serviceAreas: 'Mumbai, Bangalore, Hyderabad',
      specialization: 'Interior Finishing, Façade Glazing, Turnkey Fitouts',
      gstNumber: '27AABCH8745Q1ZP',
      panNumber: 'AABCH8745Q',
      bankName: 'Kotak Mahindra',
      accountNumber: '123487654321',
      ifscCode: 'KKBK0000958',
      status: 'APPROVED',
      rating: 4.8,
      priority: 1,
    },
  });

  // Vendor Documents
  await prisma.vendorDocument.createMany({
    data: [
      { vendorId: vendor1.id, docType: 'GST_CERTIFICATE', title: 'GST Registration Apex', fileUrl: '/docs/gst-apex.pdf', status: 'VERIFIED' },
      { vendorId: vendor1.id, docType: 'PAN_CARD', title: 'Company PAN Apex', fileUrl: '/docs/pan-apex.pdf', status: 'VERIFIED' },
      { vendorId: vendor2.id, docType: 'GST_CERTIFICATE', title: 'GST Certificate Royal', fileUrl: '/docs/gst-royal.pdf', status: 'VERIFIED' },
    ],
  });

  // 3. Contractors
  const contractor1 = await prisma.contractor.create({
    data: {
      userId: contractorUser1.id,
      name: 'Ramesh Sharma',
      companyName: 'Sharma Masonry & Civil Works',
      phone: '+91 98333 44455',
      email: 'sharma@contractor.com',
      specialization: 'Masonry, Plastering, Brickwork, Shuttering',
      labourCount: 28,
      dailyRate: 18500,
      status: 'ACTIVE',
      address: 'Chawl No. 4, Kurla West',
      city: 'Mumbai',
      bankDetails: 'SBI A/C 30987654321, IFSC: SBIN0001824',
    },
  });

  const contractor2 = await prisma.contractor.create({
    data: {
      name: 'Verma Electrical & MEP Contractors',
      companyName: 'Verma MEP Solutions',
      phone: '+91 98777 66655',
      email: 'contact@vermaelectrical.in',
      specialization: 'Electrical Wiring, Conduit, Plumbing & Fire Fighting',
      labourCount: 15,
      dailyRate: 14000,
      status: 'ACTIVE',
      address: 'Shop 8, Galaxy Arcade, Hinjawadi',
      city: 'Pune',
      bankDetails: 'Axis Bank A/C 914020087654321, IFSC: UTIB0000142',
    },
  });

  // 4. Employees
  await prisma.employee.createMany({
    data: [
      {
        name: 'Rahul Verma',
        email: 'rahul.verma@buildmaster.com',
        phone: '+91 98222 11100',
        roleTitle: 'Senior Site Engineer',
        department: 'Engineering',
        salary: 75000,
        status: 'ACTIVE',
        city: 'Mumbai',
        panNumber: 'ABCPV1234K',
        aadharNumber: '8765 4321 0987',
      },
      {
        name: 'Priya Sharma',
        email: 'priya.sharma@buildmaster.com',
        phone: '+91 98222 22200',
        roleTitle: 'Finance & Billing Executive',
        department: 'Finance',
        salary: 55000,
        status: 'ACTIVE',
        city: 'Mumbai',
        panNumber: 'BDPPS5678L',
        aadharNumber: '7654 3210 9876',
      },
      {
        name: 'Amit Patel',
        email: 'amit.patel@buildmaster.com',
        phone: '+91 98222 33300',
        roleTitle: 'Project Lead & QC Manager',
        department: 'Operations',
        salary: 90000,
        status: 'ACTIVE',
        city: 'Pune',
        panNumber: 'CPQPA9012M',
        aadharNumber: '6543 2109 8765',
      },
    ],
  });

  // 5. Customers
  const cust1 = await prisma.customer.create({
    data: {
      name: 'Rajesh Khanna',
      phone: '+91 99111 22334',
      email: 'rajesh.khanna@email.com',
      address: 'Bungalow 7, Juhu Tara Road',
      city: 'Mumbai',
      state: 'Maharashtra',
      projectType: 'Residential',
      propertyLocation: 'Juhu, Mumbai',
      budget: 45000000,
      requirement: 'Turnkey Luxury Villa Construction with Italian Marble and Swimming Pool',
      status: 'ACTIVE',
    },
  });

  const cust2 = await prisma.customer.create({
    data: {
      name: 'Sunita Rao',
      phone: '+91 99222 33445',
      email: 'sunita.rao@email.com',
      address: 'Flat 902, Baner Hills',
      city: 'Pune',
      state: 'Maharashtra',
      projectType: 'Commercial',
      propertyLocation: 'Hinjawadi IT Park, Pune',
      budget: 82000000,
      requirement: 'Corporate Office Building with 4 floors and underground parking',
      status: 'ACTIVE',
    },
  });

  const cust3 = await prisma.customer.create({
    data: {
      name: 'Vikram Malhotra',
      phone: '+91 99333 44556',
      email: 'v.malhotra@logistics.com',
      address: 'Malhotra Warehousing, Panvel',
      city: 'Navi Mumbai',
      state: 'Maharashtra',
      projectType: 'Industrial',
      propertyLocation: 'Panvel MIDC, Navi Mumbai',
      budget: 28000000,
      requirement: 'PEB Industrial Warehouse with high-load flooring',
      status: 'ACTIVE',
    },
  });

  // 6. Bank & Cash Accounts
  const cashAcc = await prisma.account.create({
    data: {
      name: 'Site Petty Cash Box',
      type: 'CASH',
      balance: 154000,
      isDefault: false,
    },
  });

  const hdfcAcc = await prisma.account.create({
    data: {
      name: 'HDFC Corporate Current A/C',
      type: 'BANK',
      accountNumber: '50200055443322',
      bankName: 'HDFC Bank Ltd',
      balance: 14850000,
      isDefault: true,
    },
  });

  const iciciAcc = await prisma.account.create({
    data: {
      name: 'ICICI Project Escrow A/C',
      type: 'BANK',
      accountNumber: '001105998877',
      bankName: 'ICICI Bank',
      balance: 6200000,
      isDefault: false,
    },
  });

  // 7. Projects
  const project1 = await prisma.project.create({
    data: {
      projectCode: 'PRJ-2026-001',
      name: 'Skyline Luxury Towers - Wing A',
      customerId: cust1.id,
      vendorId: vendor1.id,
      contractorId: contractor1.id,
      location: 'Plot 12, Worli Sea Face, Mumbai',
      projectType: 'Residential',
      budget: 45000000,
      startDate: new Date('2026-01-15'),
      expectedCompletionDate: new Date('2026-12-31'),
      status: 'IN_PROGRESS',
      progressPercent: 48,
      description: 'G+14 Residential High-Rise with earthquake-resistant RCC frame and premium amenities.',
    },
  });

  const project2 = await prisma.project.create({
    data: {
      projectCode: 'PRJ-2026-002',
      name: 'Apex Industrial Logistics Park',
      customerId: cust3.id,
      vendorId: vendor2.id,
      contractorId: contractor2.id,
      location: 'Gate 4, Panvel Logistics Corridor',
      projectType: 'Industrial',
      budget: 28000000,
      startDate: new Date('2026-02-01'),
      expectedCompletionDate: new Date('2026-09-30'),
      status: 'IN_PROGRESS',
      progressPercent: 72,
      description: 'Pre-Engineered Heavy Steel Shed with 12m clear height and laser-screeded heavy duty flooring.',
    },
  });

  const project3 = await prisma.project.create({
    data: {
      projectCode: 'PRJ-2026-003',
      name: 'Green Valley Premium Executive Villas',
      customerId: cust2.id,
      vendorId: vendor3.id,
      contractorId: contractor1.id,
      location: 'Baner Hills Road, Pune',
      projectType: 'Residential',
      budget: 82000000,
      startDate: new Date('2026-04-01'),
      expectedCompletionDate: new Date('2027-03-31'),
      status: 'STARTED',
      progressPercent: 20,
      description: 'Gated community of 12 bespoke villas with rainwater harvesting and solar roofing.',
    },
  });

  // 8. Leads and Auto Assignments
  const lead1 = await prisma.lead.create({
    data: {
      leadNumber: 'LEAD-2026-101',
      customerName: 'Anand Mahindra',
      phone: '+91 98200 12345',
      email: 'anand.m@outlook.com',
      projectLocation: 'Mumbai',
      constructionType: 'Commercial',
      budget: 65000000,
      plotSize: '25,000 sq.ft',
      requirement: 'Modern auto showroom and service facility with steel framing',
      preferredContactTime: 'Morning 10 AM - 12 PM',
      status: 'ASSIGNED',
      source: 'WEBSITE_INQUIRY',
      assignedVendorId: vendor1.id,
    },
  });

  await prisma.leadAssignment.create({
    data: {
      leadId: lead1.id,
      vendorId: vendor1.id,
      status: 'ACCEPTED',
      assignedAt: new Date(Date.now() - 3600000 * 24),
      respondedAt: new Date(Date.now() - 3600000 * 20),
    },
  });

  const lead2 = await prisma.lead.create({
    data: {
      leadNumber: 'LEAD-2026-102',
      customerName: 'Pooja Bhattacharya',
      phone: '+91 97300 55443',
      email: 'pooja.b@gmail.com',
      projectLocation: 'Pune',
      constructionType: 'Residential',
      budget: 18000000,
      plotSize: '3,500 sq.ft',
      requirement: 'Duplex bungalow construction with rooftop terrace garden',
      preferredContactTime: 'Evening 4 PM - 7 PM',
      status: 'CONTACTED',
      source: 'DIRECT_CALL',
      assignedVendorId: vendor2.id,
    },
  });

  await prisma.leadAssignment.create({
    data: {
      leadId: lead2.id,
      vendorId: vendor2.id,
      status: 'ACCEPTED',
      assignedAt: new Date(Date.now() - 3600000 * 48),
      respondedAt: new Date(Date.now() - 3600000 * 42),
    },
  });

  const lead3 = await prisma.lead.create({
    data: {
      leadNumber: 'LEAD-2026-103',
      customerName: 'Dr. Harsh Vardhan',
      phone: '+91 98450 77889',
      email: 'dr.harsh@clinic.org',
      projectLocation: 'Mumbai',
      constructionType: 'Renovation',
      budget: 8500000,
      plotSize: '4,000 sq.ft',
      requirement: 'Complete clinic interior renovation with acoustic partition and MEP',
      preferredContactTime: 'Anytime',
      status: 'NEW',
      source: 'WEBSITE_INQUIRY',
      assignedVendorId: vendor3.id,
    },
  });

  await prisma.leadAssignment.create({
    data: {
      leadId: lead3.id,
      vendorId: vendor3.id,
      status: 'PENDING',
      assignedAt: new Date(),
    },
  });

  // 9. Materials
  const mat1 = await prisma.material.create({
    data: {
      name: 'UltraTech OPC 53 Grade Cement',
      category: 'Raw Material',
      unit: 'Bags',
      currentStock: 1450,
      minStockLevel: 200,
      unitPrice: 420,
    },
  });

  const mat2 = await prisma.material.create({
    data: {
      name: 'Tata Tiscon 550D TMT Rebars 16mm',
      category: 'Structural',
      unit: 'Metric Ton',
      currentStock: 35.5,
      minStockLevel: 5,
      unitPrice: 68500,
    },
  });

  const mat3 = await prisma.material.create({
    data: {
      name: 'Washed River Sand (Zone II)',
      category: 'Raw Material',
      unit: 'Cu.Ft',
      currentStock: 3200,
      minStockLevel: 500,
      unitPrice: 65,
    },
  });

  const mat4 = await prisma.material.create({
    data: {
      name: 'Red Clay Kiln Burnt Bricks',
      category: 'Finishing',
      unit: 'Pcs',
      currentStock: 24000,
      minStockLevel: 3000,
      unitPrice: 9.5,
    },
  });

  // 10. Material Consumptions
  await prisma.materialConsumption.createMany({
    data: [
      { projectId: project1.id, materialId: mat1.id, quantity: 250, notes: '7th Floor Slab Casting', recordedBy: 'Rahul Verma' },
      { projectId: project1.id, materialId: mat2.id, quantity: 4.8, notes: 'Column Reinforcement Wing A', recordedBy: 'Rahul Verma' },
      { projectId: project2.id, materialId: mat1.id, quantity: 180, notes: 'Plinth Beam Grouting', recordedBy: 'Amit Patel' },
    ],
  });

  // 11. Project Progress Logs
  await prisma.projectProgress.createMany({
    data: [
      {
        projectId: project1.id,
        title: '7th Floor RCC Slab Casting Completed',
        description: 'Successfully poured 65 cubic meters of M30 grade concrete for the 7th floor deck. Cube samples collected for 7-day and 28-day curing tests.',
        percentage: 48,
        labourCount: 32,
        weather: 'Sunny, 31°C',
        reportedBy: 'Rahul Verma (Site Engg)',
      },
      {
        projectId: project2.id,
        title: 'Erection of Steel Portal Frames & Purlins',
        description: 'Completed erection of 8 steel trusses and secondary framing. Primer touch-up applied to high-strength bolted connections.',
        percentage: 72,
        labourCount: 22,
        weather: 'Clear, 28°C',
        reportedBy: 'Amit Patel (Project Lead)',
      },
      {
        projectId: project3.id,
        title: 'Foundation Excavation & Anti-Termite Treatment',
        description: 'Site layout pegged and isolated footings excavated for Villa 1 through Villa 4. Anti-termite emulsion sprayed according to IS specifications.',
        percentage: 20,
        labourCount: 18,
        weather: 'Overcast, 27°C',
        reportedBy: 'Sunil Deshmukh (Manager)',
      },
    ],
  });

  // 12. Financial Transactions (Deposits & Withdrawals)
  const tx1 = await prisma.transaction.create({
    data: {
      transactionNumber: 'TXN-2026-0001',
      type: 'DEPOSIT',
      category: 'Customer Advance Payment',
      amount: 2500000,
      paymentMethod: 'RTGS_NEFT',
      accountId: hdfcAcc.id,
      customerId: cust1.id,
      projectId: project1.id,
      description: 'Milestone 3 Advance received for 7th floor slab completion from Rajesh Khanna',
      receiptUrl: '/receipts/txn-001.pdf',
      status: 'APPROVED',
      createdById: accountant.id,
      approvedById: superAdmin.id,
      approvedAt: new Date(Date.now() - 3600000 * 24 * 3),
    },
  });

  const tx2 = await prisma.transaction.create({
    data: {
      transactionNumber: 'TXN-2026-0002',
      type: 'DEPOSIT',
      category: 'Customer Milestone Payment',
      amount: 1800000,
      paymentMethod: 'BANK_TRANSFER',
      accountId: icICIAcc = iciciAcc.id,
      customerId: cust3.id,
      projectId: project2.id,
      description: 'Progress milestone payment for PEB roof truss erection from Vikram Malhotra',
      receiptUrl: '/receipts/txn-002.pdf',
      status: 'APPROVED',
      createdById: accountant.id,
      approvedById: superAdmin.id,
      approvedAt: new Date(Date.now() - 3600000 * 24 * 2),
    },
  });

  const tx3 = await prisma.transaction.create({
    data: {
      transactionNumber: 'TXN-2026-0003',
      type: 'WITHDRAWAL',
      category: 'Material Purchase',
      amount: 320000,
      paymentMethod: 'BANK_TRANSFER',
      accountId: hdfcAcc.id,
      vendorId: vendor1.id,
      projectId: project1.id,
      description: 'Procurement of 750 bags of UltraTech 53 Grade Cement for slab cast',
      receiptUrl: '/bills/bill-cement-01.pdf',
      status: 'APPROVED',
      createdById: accountant.id,
      approvedById: superAdmin.id,
      approvedAt: new Date(Date.now() - 3600000 * 24 * 1),
    },
  });

  const tx4 = await prisma.transaction.create({
    data: {
      transactionNumber: 'TXN-2026-0004',
      type: 'WITHDRAWAL',
      category: 'Labour Payment',
      amount: 145000,
      paymentMethod: 'CASH',
      accountId: cashAcc.id,
      contractorId: contractor1.id,
      projectId: project1.id,
      description: 'Weekly labour wage settlement for 28 civil workers & shuttering team',
      receiptUrl: '/bills/labour-wage-wk47.pdf',
      status: 'APPROVED',
      createdById: accountant.id,
      approvedById: superAdmin.id,
      approvedAt: new Date(Date.now() - 3600000 * 12),
    },
  });

  const tx5 = await prisma.transaction.create({
    data: {
      transactionNumber: 'TXN-2026-0005',
      type: 'DEPOSIT',
      category: 'Customer Payment',
      amount: 750000,
      paymentMethod: 'UPI',
      accountId: hdfcAcc.id,
      customerId: cust2.id,
      projectId: project3.id,
      description: 'Site layout and excavation commencement advance from Sunita Rao',
      status: 'APPROVED',
      createdById: accountant.id,
      approvedById: superAdmin.id,
      approvedAt: new Date(),
    },
  });

  const tx6 = await prisma.transaction.create({
    data: {
      transactionNumber: 'TXN-2026-0006',
      type: 'WITHDRAWAL',
      category: 'Equipment & Machinery',
      amount: 85000,
      paymentMethod: 'BANK_TRANSFER',
      accountId: hdfcAcc.id,
      projectId: project2.id,
      description: 'Hydraulic mobile crane 40T rental charges for 4 days steel erection',
      status: 'PENDING',
      createdById: manager.id,
    },
  });

  // 13. Expenses
  await prisma.expense.createMany({
    data: [
      {
        expenseNumber: 'EXP-2026-101',
        category: 'Cement',
        amount: 320000,
        paymentMethod: 'BANK_TRANSFER',
        projectId: project1.id,
        vendorId: vendor1.id,
        description: '750 Bags UltraTech Cement batch #UT-4401',
        billUrl: '/bills/cement-bill-101.pdf',
        status: 'APPROVED',
        createdById: accountant.id,
      },
      {
        expenseNumber: 'EXP-2026-102',
        category: 'Labour',
        amount: 145000,
        paymentMethod: 'CASH',
        projectId: project1.id,
        contractorId: contractor1.id,
        description: 'Shuttering and concrete team weekly wage bill',
        billUrl: '/bills/wage-sheet-102.pdf',
        status: 'APPROVED',
        createdById: accountant.id,
      },
      {
        expenseNumber: 'EXP-2026-103',
        category: 'Machinery',
        amount: 85000,
        paymentMethod: 'BANK_TRANSFER',
        projectId: project2.id,
        description: 'Crane 40T hiring charges from ACE Crane Rentals',
        status: 'PENDING',
        createdById: manager.id,
      },
      {
        expenseNumber: 'EXP-2026-104',
        category: 'Steel',
        amount: 495000,
        paymentMethod: 'BANK_TRANSFER',
        projectId: project2.id,
        vendorId: vendor2.id,
        description: 'TMT Structural H-Beams and Angles 7.2 MT',
        status: 'APPROVED',
        createdById: accountant.id,
      },
    ],
  });

  // 14. Attendances
  const today = new Date();
  await prisma.attendance.createMany({
    data: [
      { contractorId: contractor1.id, date: today, status: 'PRESENT', hoursWorked: 8.5, notes: '28 workers on site' },
      { contractorId: contractor2.id, date: today, status: 'PRESENT', hoursWorked: 8.0, notes: '15 electricians on site' },
    ],
  });

  // 15. Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: superAdmin.id,
        title: 'New High-Value Lead Received',
        message: 'Lead LEAD-2026-101 received for Commercial project budget ₹6.5 Cr from Anand Mahindra.',
        type: 'LEAD',
        read: false,
        link: '/admin/leads',
      },
      {
        userId: superAdmin.id,
        title: 'Pending High-Value Withdrawal',
        message: 'Withdrawal TXN-2026-0006 of ₹85,000 for Equipment & Machinery awaits your authorization.',
        type: 'TRANSACTION',
        read: false,
        link: '/admin/daily-transactions',
      },
      {
        userId: vendorUser1.id,
        title: 'New Lead Auto-Assigned',
        message: 'Lead LEAD-2026-101 (Commercial construction, Mumbai) has been auto-assigned to Apex Civil Infra.',
        type: 'LEAD',
        read: true,
        link: '/vendor',
      },
    ],
  });

  // 16. Audit Log
  await prisma.auditLog.createMany({
    data: [
      {
        userId: superAdmin.id,
        action: 'SYSTEM_INITIALIZATION',
        entity: 'SYSTEM',
        details: 'BuildMaster ERP production database initialized and seeded with master records.',
        ipAddress: '127.0.0.1',
      },
      {
        userId: accountant.id,
        action: 'TRANSACTION_RECORDED',
        entity: 'TRANSACTION',
        entityId: tx1.id,
        details: 'Deposit TXN-2026-0001 recorded for ₹25,00,000 from customer Rajesh Khanna.',
        ipAddress: '127.0.0.1',
      },
    ],
  });

  // 17. System Settings
  await prisma.systemSetting.createMany({
    data: [
      { key: 'AUTO_LEAD_ASSIGNMENT', value: 'true', description: 'Enable smart vendor matching on new inquiry' },
      { key: 'LEAD_EXPIRY_HOURS', value: '24', description: 'Hours before unaccepted lead is reassigned' },
      { key: 'HIGH_VALUE_THRESHOLD', value: '50000', description: 'Amount above which transactions need Admin approval' },
      { key: 'CURRENCY_SYMBOL', value: '₹', description: 'Default display currency symbol' },
      { key: 'COMPANY_NAME', value: 'BuildMaster Construction & Infrastructure Corp', description: 'Enterprise Entity Name' },
    ],
  });

  console.log('BuildMaster ERP seeded successfully with complete enterprise dataset!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
