"use client";

import { useState, useEffect } from "react";
import {
  BarChart3,
  Calendar,
  Download,
  Printer,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Building2,
  FileSpreadsheet,
} from "lucide-react";
import * as XLSX from "xlsx";
import { formatCurrency, formatDate } from "@/lib/formatters";

export default function ReportsPage() {
  const [reportType, setReportType] = useState("daily_cash");
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, [reportType]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports?type=${reportType}`);
      if (res.ok) {
        const data = await res.json();
        setReportData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportExcel = () => {
    if (!reportData) return;
    let rows: any[] = [];

    if (reportType === "project_pnl") {
      rows = (reportData.rows || []).map((r: any) => ({
        "Project Code": r.projectCode,
        "Project Name": r.name,
        Client: r.customer,
        "Budget (₹)": r.budget,
        "Income (₹)": r.income,
        "Cost (₹)": r.cost,
        "Net Profit (₹)": r.profit,
        Margin: r.margin,
        Status: r.status,
      }));
    } else if (reportType === "vendor_payments") {
      rows = (reportData.rows || []).map((r: any) => ({
        Vendor: r.vendorName,
        Contact: r.contact,
        Phone: r.phone,
        Specialization: r.specialization,
        "Total Paid (₹)": r.totalPaid,
        Transactions: r.transactionCount,
      }));
    } else {
      rows = [
        ...(reportData.deposits || []).map((d: any) => ({
          Type: "DEPOSIT",
          Txn: d.transactionNumber,
          Category: d.category,
          Amount: d.amount,
          Party: d.customer?.name || "Direct",
          Date: formatDate(d.createdAt),
        })),
        ...(reportData.withdrawals || []).map((w: any) => ({
          Type: "WITHDRAWAL",
          Txn: w.transactionNumber,
          Category: w.category,
          Amount: w.amount,
          Party: w.vendor?.companyName || w.contractor?.name || "-",
          Date: formatDate(w.createdAt),
        })),
      ];
    }

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, `BuildMaster_${reportType}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Financial & Operational Reports
          </h1>
          <p className="text-xs font-medium text-slate-500">
            Exportable audits, cash flow reconciliation, and construction project profitability analysis
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportExcel}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Excel Export</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Report Selector Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          { key: "daily_cash", label: "Daily Cash Flow & Reconciliation" },
          { key: "project_pnl", label: "Project Profit & Loss (P&L)" },
          { key: "vendor_payments", label: "Vendor & Contractor Payouts" },
          { key: "lead_conversion", label: "Lead Conversion & Funnel" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setReportType(tab.key)}
            className={`rounded-lg px-3.5 py-2 text-xs font-bold transition-all ${
              reportType === tab.key
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Report Content */}
      {loading ? (
        <div className="flex h-72 items-center justify-center rounded-xl border border-slate-200 bg-white">
          <div className="flex flex-col items-center gap-2">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
            <p className="text-xs text-slate-500">Generating report calculations...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* DAILY CASH REPORT VIEW */}
          {reportType === "daily_cash" && reportData && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    Total Cleared Deposits
                  </span>
                  <p className="text-2xl font-bold text-emerald-700 mt-1">
                    {formatCurrency(reportData.summary?.totalDeposits)}
                  </p>
                </div>
                <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-4">
                  <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">
                    Total Approved Withdrawals
                  </span>
                  <p className="text-2xl font-bold text-rose-700 mt-1">
                    {formatCurrency(reportData.summary?.totalWithdrawals)}
                  </p>
                </div>
                <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4">
                  <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">
                    Net Operating Cash Flow
                  </span>
                  <p className="text-2xl font-bold text-blue-700 mt-1">
                    {formatCurrency(reportData.summary?.netCashFlow)}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
                  Detailed Reconciled Inflows & Outflows
                </h3>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 uppercase font-semibold">
                      <tr>
                        <th className="p-2.5">Date</th>
                        <th className="p-2.5">Txn #</th>
                        <th className="p-2.5">Category</th>
                        <th className="p-2.5">Party / Project</th>
                        <th className="p-2.5">Account</th>
                        <th className="p-2.5 text-right">Inflow (+)</th>
                        <th className="p-2.5 text-right">Outflow (-)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {[
                        ...(reportData.deposits || []).map((d: any) => ({ ...d, isDep: true })),
                        ...(reportData.withdrawals || []).map((w: any) => ({ ...w, isDep: false })),
                      ]
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map((t: any) => (
                          <tr key={t.id} className="hover:bg-slate-50">
                            <td className="p-2.5">{formatDate(t.createdAt)}</td>
                            <td className="p-2.5 font-mono font-bold">{t.transactionNumber}</td>
                            <td className="p-2.5 font-semibold text-slate-900">{t.category}</td>
                            <td className="p-2.5">
                              {t.customer?.name || t.vendor?.companyName || t.contractor?.name || "-"}
                            </td>
                            <td className="p-2.5">{t.account?.name}</td>
                            <td className="p-2.5 text-right font-bold text-emerald-600">
                              {t.isDep ? formatCurrency(t.amount) : "-"}
                            </td>
                            <td className="p-2.5 text-right font-bold text-rose-600">
                              {!t.isDep ? formatCurrency(t.amount) : "-"}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* PROJECT P&L REPORT VIEW */}
          {reportType === "project_pnl" && reportData && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
                Construction Site Profit & Loss Performance
              </h3>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-semibold">
                    <tr>
                      <th className="p-2.5">Code</th>
                      <th className="p-2.5">Project Name</th>
                      <th className="p-2.5">Client</th>
                      <th className="p-2.5">Budget</th>
                      <th className="p-2.5">Income Billed</th>
                      <th className="p-2.5">Total Cost</th>
                      <th className="p-2.5">Net Profit</th>
                      <th className="p-2.5">Margin</th>
                      <th className="p-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {(reportData.rows || []).map((r: any) => (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <td className="p-2.5 font-mono font-bold text-blue-600">{r.projectCode}</td>
                        <td className="p-2.5 font-bold text-slate-900">{r.name}</td>
                        <td className="p-2.5">{r.customer}</td>
                        <td className="p-2.5 font-mono">{formatCurrency(r.budget)}</td>
                        <td className="p-2.5 font-mono font-semibold text-emerald-600">
                          {formatCurrency(r.income)}
                        </td>
                        <td className="p-2.5 font-mono font-semibold text-rose-600">
                          {formatCurrency(r.cost)}
                        </td>
                        <td className="p-2.5 font-mono font-bold text-slate-900">
                          {formatCurrency(r.profit)}
                        </td>
                        <td className="p-2.5 font-bold text-blue-600">{r.margin}</td>
                        <td className="p-2.5">
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold">
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VENDOR PAYMENTS REPORT VIEW */}
          {reportType === "vendor_payments" && reportData && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
                Cumulative Vendor & Subcontractor Disbursements
              </h3>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-semibold">
                    <tr>
                      <th className="p-2.5">Vendor / Contractor</th>
                      <th className="p-2.5">Contact Person</th>
                      <th className="p-2.5">Phone</th>
                      <th className="p-2.5">Specialization</th>
                      <th className="p-2.5">Total Paid Out</th>
                      <th className="p-2.5">Transactions Count</th>
                      <th className="p-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {(reportData.rows || []).map((r: any) => (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <td className="p-2.5 font-bold text-slate-900">{r.vendorName}</td>
                        <td className="p-2.5">{r.contact}</td>
                        <td className="p-2.5">{r.phone}</td>
                        <td className="p-2.5 text-slate-600">{r.specialization}</td>
                        <td className="p-2.5 font-mono font-bold text-slate-900 text-sm">
                          {formatCurrency(r.totalPaid)}
                        </td>
                        <td className="p-2.5 font-semibold text-blue-600">
                          {r.transactionCount} vouchers
                        </td>
                        <td className="p-2.5">
                          <span className="rounded bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700">
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* LEAD CONVERSION FUNNEL REPORT */}
          {reportType === "lead_conversion" && reportData && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <span className="text-xs text-slate-400 font-semibold uppercase">Total Inquiries</span>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{reportData.summary?.totalLeads}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <span className="text-xs text-slate-400 font-semibold uppercase">Converted Won</span>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">{reportData.summary?.convertedCount}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <span className="text-xs text-slate-400 font-semibold uppercase">Conversion Rate</span>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{reportData.summary?.conversionRate}</p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
                  Inquiries Pipeline Details
                </h3>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 uppercase font-semibold">
                      <tr>
                        <th className="p-2.5">Lead Number</th>
                        <th className="p-2.5">Customer Name</th>
                        <th className="p-2.5">Category</th>
                        <th className="p-2.5">Location</th>
                        <th className="p-2.5">Budget</th>
                        <th className="p-2.5">Assigned Vendor</th>
                        <th className="p-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {(reportData.leads || []).map((l: any) => (
                        <tr key={l.id} className="hover:bg-slate-50">
                          <td className="p-2.5 font-mono font-bold text-blue-600">{l.leadNumber}</td>
                          <td className="p-2.5 font-bold text-slate-900">{l.customerName}</td>
                          <td className="p-2.5">{l.constructionType}</td>
                          <td className="p-2.5">{l.projectLocation}</td>
                          <td className="p-2.5 font-mono font-bold">{formatCurrency(l.budget)}</td>
                          <td className="p-2.5">{l.assignedVendor?.companyName || "Unassigned"}</td>
                          <td className="p-2.5">
                            <span className="rounded bg-slate-100 px-2 py-0.5 font-bold text-[10px]">
                              {l.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
