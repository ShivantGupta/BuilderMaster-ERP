"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Users,
  Compass,
  Truck,
  HardHat,
  TrendingUp,
  TrendingDown,
  Wallet,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  AlertCircle,
  FileText,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { formatCurrency, formatCompactCurrency, formatDate } from "@/lib/formatters";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/stats");
      if (res.ok) {
        const stats = await res.json();
        setData(stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm font-medium text-slate-500">Loading live ERP statistics...</p>
        </div>
      </div>
    );
  }

  const { cards, charts, recentTransactions, recentNotifications } = data || {};

  const COLORS = ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#10b981"];

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Executive Operations Dashboard
          </h1>
          <p className="text-xs font-medium text-slate-500">
            Real-time Construction, CRM & Financial Analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchStats}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh Data</span>
          </button>
          <Link
            href="/admin/daily-transactions"
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm shadow-blue-500/20 hover:bg-blue-700"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Post Transaction</span>
          </Link>
        </div>
      </div>

      {/* Main KPI Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Available Business Balance */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Available Balance
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900">
              {formatCompactCurrency(cards?.availableBalance)}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Across Bank & Cash registers
            </p>
          </div>
        </div>

        {/* Today's Income / Deposits */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Today's Income
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <ArrowDownLeft className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-emerald-700">
              {formatCurrency(cards?.todayIncome)}
            </div>
            <div className="flex items-center gap-1 mt-0.5 text-[11px] font-medium text-emerald-600">
              <TrendingUp className="h-3 w-3" />
              <span>Real-time cleared</span>
            </div>
          </div>
        </div>

        {/* Today's Expenses / Withdrawals */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Today's Expenses
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
              <ArrowUpRight className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-rose-700">
              {formatCurrency(cards?.todayExpenses)}
            </div>
            <div className="flex items-center gap-1 mt-0.5 text-[11px] font-medium text-slate-500">
              <span>Materials, labour & vendor payouts</span>
            </div>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Pending Transactions
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-amber-700">
              {formatCurrency(cards?.pendingPayments)}
            </div>
            <p className="text-[11px] text-amber-600 font-medium mt-0.5">
              High-value threshold queue
            </p>
          </div>
        </div>
      </div>

      {/* Secondary Operational Counters */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
            <Building2 className="h-4 w-4 text-blue-600" />
            <span>Active Projects</span>
          </div>
          <div className="mt-1 text-xl font-bold text-slate-800">
            {cards?.activeProjects} <span className="text-xs font-normal text-slate-400">/ {cards?.totalProjects}</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
            <Users className="h-4 w-4 text-indigo-600" />
            <span>Total Customers</span>
          </div>
          <div className="mt-1 text-xl font-bold text-slate-800">
            {cards?.totalCustomers}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
            <Compass className="h-4 w-4 text-orange-600" />
            <span>Total Leads</span>
          </div>
          <div className="mt-1 text-xl font-bold text-slate-800">
            {cards?.totalLeads}{" "}
            <span className="text-[11px] font-semibold text-emerald-600">
              (+{cards?.newLeadsToday} today)
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
            <Truck className="h-4 w-4 text-emerald-600" />
            <span>Approved Vendors</span>
          </div>
          <div className="mt-1 text-xl font-bold text-slate-800">
            {cards?.totalVendors}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
            <HardHat className="h-4 w-4 text-amber-600" />
            <span>Contractors</span>
          </div>
          <div className="mt-1 text-xl font-bold text-slate-800">
            {cards?.totalContractors}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
            <FileText className="h-4 w-4 text-teal-600" />
            <span>Total Deposits</span>
          </div>
          <div className="mt-1 text-xl font-bold text-slate-800">
            {formatCompactCurrency(cards?.totalDeposits)}
          </div>
        </div>
      </div>

      {/* Interactive Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Monthly Income vs Expense Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Monthly Income vs Expenses
              </h2>
              <p className="text-[11px] text-slate-400">
                Financial performance and operational margin
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-blue-600">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> Income
              </span>
              <span className="flex items-center gap-1.5 text-rose-500">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> Expenses
              </span>
            </div>
          </div>
          <div className="mt-4 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.monthlyData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis
                  tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  formatter={(val: any) => formatCurrency(Number(val))}
                  contentStyle={{ borderRadius: "8px", fontSize: "12px" }}
                />
                <Bar dataKey="income" name="Income" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Conversion Funnel */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">
              Lead Conversion Funnel
            </h2>
            <p className="text-[11px] text-slate-400">
              Inquiries pipeline conversion
            </p>
          </div>
          <div className="mt-4 space-y-3">
            {(charts?.leadConversion || []).map((item: any, idx: number) => {
              const max = 10;
              const pct = Math.min(100, Math.max(15, (item.count / max) * 100));
              return (
                <div key={item.stage} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">{item.stage}</span>
                    <span className="font-bold text-slate-900">{item.count} leads</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: COLORS[idx % COLORS.length],
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-6 border-t border-slate-100 pt-3 text-center">
            <Link
              href="/admin/leads"
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              <span>Manage CRM Pipeline</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Projects Progress & Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Project Tracking */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Active Construction Sites
              </h2>
              <p className="text-[11px] text-slate-400">
                Milestones & Completion Progress
              </p>
            </div>
            <Link
              href="/admin/projects"
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="mt-3 divide-y divide-slate-100">
            {(charts?.projectProgress || []).map((project: any) => (
              <div key={project.id} className="py-3">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-900">{project.name}</span>
                    <span className="ml-2 font-mono text-[10px] text-slate-400">
                      {project.projectCode}
                    </span>
                  </div>
                  <span className="font-bold text-blue-600">
                    {project.progressPercent}%
                  </span>
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{project.location}</span>
                  <span className="font-semibold text-slate-700">
                    Budget: {formatCompactCurrency(project.budget)}
                  </span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{ width: `${project.progressPercent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Financial Transactions */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Recent Daily Transactions
              </h2>
              <p className="text-[11px] text-slate-400">
                Audit logged cash & bank activity
              </p>
            </div>
            <Link
              href="/admin/daily-transactions"
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              View Ledger
            </Link>
          </div>
          <div className="mt-3 divide-y divide-slate-100">
            {(recentTransactions || []).slice(0, 5).map((t: any) => {
              const isDeposit = t.type === "DEPOSIT";
              return (
                <div key={t.id} className="flex items-center justify-between py-2.5 text-xs">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        isDeposit
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-rose-50 text-rose-600"
                      }`}
                    >
                      {isDeposit ? (
                        <ArrowDownLeft className="h-4 w-4" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{t.category}</p>
                      <p className="text-[11px] text-slate-400">
                        {t.account?.name} • {formatDate(t.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold ${
                        isDeposit ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {isDeposit ? "+" : "-"} {formatCurrency(t.amount)}
                    </p>
                    <span
                      className={`inline-block rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        t.status === "APPROVED"
                          ? "bg-emerald-50 text-emerald-700"
                          : t.status === "PENDING"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
