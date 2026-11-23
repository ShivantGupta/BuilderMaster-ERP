# BUILDMASTER ERP
## Complete Builder, Contractor & Construction Management Enterprise Platform

**BuildMaster ERP** is a full-stack, production-ready enterprise construction management web application built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **Prisma ORM** supporting **PostgreSQL** (production) and **SQLite** (instant zero-dependency local development).

---

## 🌟 Key Features & Functional Modules

### 1. Multi-Role Authentication & Access Control (RBAC)
- **Super Admin**: Full administrative authority, high-value financial transaction authorization, user/vendor management, system settings, immutable audit log inspection.
- **Site Manager**: Project execution, daily site logs, contractor assignment, progress percentage updates.
- **Accountant**: Cash registers, bank accounts, deposit/withdrawal recording, non-destructive ledger reversals, financial reporting.
- **Vendor Partner**: Dedicated vendor portal (`/vendor`), assigned lead review with **Accept/Decline** triggers, active project milestone monitoring, payment history.
- **Contractor**: Labour force headcount, daily crew wages, assigned site work.
- **Customer / Client**: Public requirement submission, project milestone billing history.

### 2. CRM & Intelligent Lead Distribution Engine
- **Public Customer Inquiry Portal** (`/inquiry`): Customers submit project specifications without login.
- **Algorithmic Lead Matcher** (`src/lib/lead-engine.ts`): Automatically matches approved partner vendors based on:
  1. Service location / territory overlap.
  2. Construction category specialization (Civil, Steel PEB, Interior, Commercial).
  3. Vendor priority tier and customer rating.
  4. Active lead workload balancing.
- **Vendor Response Tracking**: Vendor accepts or rejects leads directly from the vendor portal. Rejected or unresponded leads are automatically recycled for reassignment.

### 3. Daily Deposit & Withdrawal Management (Financial Ledger)
- **Compliant Double-Entry Accounting**: Real-time reconciliation of:
  $$\text{Closing Balance} = \text{Opening Balance} + \text{Approved Deposits} - \text{Approved Withdrawals}$$
- **Multi-Account Tracking**: Main Cash in Hand, HDFC Current Account, ICICI Escrow Account.
- **High-Value Authorization Queue**: Configurable threshold (default: ₹50,000) requiring Super Admin authorization before affecting account balances.
- **Non-Destructive Reversals**: Financial transactions are never deleted. Reversal entries (`REV-TXN-...`) reverse ledger balances while maintaining a complete audit trail.
- **Printable Financial Vouchers**: Generate and print official payment receipts and expense vouchers.
- **Excel & PDF Export**: One-click `.xlsx` spreadsheet and printable statement export.

### 4. Construction Site & Project Tracking
- Project codes (`PRJ-2026-001`), customer, vendor, and contractor linkages.
- Daily work progress reporting with percentage tracking, labour headcount, weather, and execution notes.
- Project-wise income vs. expense tracking and net profitability calculation.

### 5. Expense & Material Stock Inventory
- Categorized procurement tracking: Cement, Sand, Bricks, Steel, Labour, Electrical, Plumbing, Machinery, Transportation.
- Live warehouse inventory with low-stock alerts and site disbursement tracking.

### 6. Employee & HR Management
- Engineering staff profiles (Site Engineers, QC Managers, Billing Executives).
- Daily attendance logging (Present / Absent) and payroll commitments.

### 7. Exportable Financial & P&L Reports
- Daily Cash Flow & Bank Reconciliation.
- Project Profit & Loss (P&L) statements with gross margin percentages.
- Cumulative Vendor & Subcontractor disbursement summaries.
- CRM Lead Funnel & Conversion analytics.

### 8. Public Corporate Website
- High-conversion responsive website:
  - **Home** (`/`): Hero banner, service highlights, completed projects, customer testimonials.
  - **About Us** (`/about`): Engineering quality standards (IS 456), leadership profiles.
  - **Services** (`/services`): Residential, Commercial, Industrial PEB, Renovation.
  - **Portfolio** (`/projects`): Filterable showcase of ongoing and delivered landmarks.
  - **Contact Us** (`/contact`): Inquiry form and head office contact information.
  - **Vendor Onboarding** (`/vendor-register`): Public vendor registration submitting to the admin approval queue.

---

## 🏗️ Technology Stack

- **Framework**: Next.js 14 (App Router, Server Actions, API Routes)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **ORM**: Prisma ORM 5.22
- **Database**:
  - **SQLite** (`dev.db`): Zero-configuration local development.
  - **PostgreSQL**: Production schema (`prisma/schema.postgres.prisma`) with `@db.Decimal(14, 2)`, normalized foreign keys, and indexes.
- **Authentication**: JWT (`jsonwebtoken`) with `httpOnly` secure cookies & `bcryptjs` password hashing.
- **Exports**: SheetJS (`xlsx`) for Excel reports and responsive `@media print` CSS for print/PDF vouchers.
- **Charts**: Recharts dynamic visual analytics.

---

## 🚀 Quick Start & Installation

### 1. Prerequisites
- Node.js 18.x, 20.x, or 22+
- npm, pnpm, or yarn

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Initialization (Default SQLite)
The repository comes pre-configured with SQLite for instant local execution:
```bash
# Push schema to create dev.db
npx prisma db push

# Seed database with complete realistic enterprise dataset
node prisma/seed.js
```

### 4. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔑 Default Seeded Accounts & Passwords

All demo accounts use password: **`admin123`**

| Role | Email | Password | Access Description |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@buildmaster.com` | `admin123` | Full access, financial approvals, settings, audit trail |
| **Accountant** | `accountant@buildmaster.com` | `admin123` | Daily transactions, bank accounts, financial reports |
| **Site Manager** | `manager@buildmaster.com` | `admin123` | Construction sites, daily progress logs |
| **Vendor Partner** | `apex@vendor.com` | `admin123` | Vendor Portal (`/vendor`), accept/decline leads |
| **Contractor** | `sharma@contractor.com` | `admin123` | Labour crew, daily rates, attendance |

> **Pro Tip**: Use the **"Switch Role"** button in the header user dropdown or the login page to instantaneously switch between personas without typing!

---

## 🔄 Switching Between PostgreSQL and SQLite

### Switching to PostgreSQL (Production)
1. Ensure you have your PostgreSQL connection string (local, Supabase, Neon, or AWS RDS).
2. Edit `.env`:
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/buildmaster?schema=public"
   ```
3. Run the switcher script:
   ```bash
   npm run switch:postgres
   ```
4. Push migrations and seed:
   ```bash
   npx prisma db push
   node prisma/seed.js
   ```

### Switching to SQLite (Local Zero-Config)
```bash
npm run switch:sqlite
npx prisma db push
node prisma/seed.js
```

---

## 📂 Project Directory Structure

```
├── prisma/
│   ├── schema.prisma           # Active schema (SQLite)
│   ├── schema.postgres.prisma  # PostgreSQL production schema (@db.Decimal)
│   └── seed.js                 # Complete enterprise seed data generator
├── scripts/
│   └── switch-db.js            # Database switcher script
├── src/
│   ├── app/
│   │   ├── (public)/           # Home, About, Services, Projects, Contact, Inquiry, Vendor Register
│   │   ├── admin/              # Executive ERP Dashboard and Modules
│   │   │   ├── page.tsx        # KPI Analytics & Recharts Visualizations
│   │   │   ├── customers/      # Customer directory & payment histories
│   │   │   ├── leads/          # CRM pipeline & vendor auto-assignment
│   │   │   ├── vendors/        # Partner vendors & verification queue
│   │   │   ├── contractors/    # Trade contractors & labour headcount
│   │   │   ├── projects/       # Construction site milestones & progress logs
│   │   │   ├── daily-transactions/ # Cash & bank ledger with reversal entries
│   │   │   ├── expenses/       # Procurement bills & site expenses
│   │   │   ├── materials/      # Inventory stock & site disbursement
│   │   │   ├── employees/      # HR roster & daily attendance
│   │   │   ├── reports/        # Exportable P&L and Cash Flow statements
│   │   │   ├── notifications/  # Internal notification center
│   │   │   └── settings/       # System rules & immutable audit log trail
│   │   ├── vendor/             # Dedicated Vendor Partner Portal
│   │   ├── login/              # Multi-role authentication portal
│   │   └── api/                # 28 REST API routes
│   ├── components/             # Reusable UI widgets, Sidebar, Header, Navbar, Footer
│   └── lib/                    # Prisma client, JWT auth, lead engine, audit logger, formatters
└── package.json
```

---

## 🛡️ Production Deployment (Vercel / Docker)

### Deploying to Vercel
1. Set the following Environment Variables in Vercel:
   - `DATABASE_URL`: Your PostgreSQL connection string.
   - `JWT_SECRET`: Random 64-character secret.
   - `NEXT_PUBLIC_APP_URL`: Your production domain.
2. Build Command: `npx prisma generate && next build`
3. Deploy!
