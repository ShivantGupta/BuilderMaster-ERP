"use client";

import { useState, useEffect } from "react";
import {
  Receipt,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Search,
  Filter,
  Download,
  Printer,
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  Wallet,
  Landmark,
  Calendar,
  AlertCircle,
  RefreshCw,
  X,
  FileText,
  ShieldAlert,
} from "lucide-react";
import * as XLSX from "xlsx";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/formatters";

export default function DailyTransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [contractors, setContractors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [dateRange, setDateRange] = useState("today");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"DEPOSIT" | "WITHDRAWAL">("DEPOSIT");
  const [selectedTxn, setSelectedTxn] = useState<any>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showReversalModal, setShowReversalModal] = useState(false);
  const [reversalReason, setReversalReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    type: "DEPOSIT",
    category: "Customer Advance Payment",
    amount: "",
    paymentMethod: "BANK_TRANSFER",
    accountId: "",
    customerId: "",
    vendorId: "",
    contractorId: "",
    projectId: "",
    description: "",
    receiptUrl: "",
  });

  useEffect(() => {
    fetchTransactions();
    fetchLookups();
  }, [dateRange, startDate, endDate, typeFilter, statusFilter]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (dateRange !== "custom") q.set("dateRange", dateRange);
      if (dateRange === "custom" && startDate && endDate) {
        q.set("startDate", startDate);
        q.set("endDate", endDate);
      }
      if (typeFilter !== "ALL") q.set("type", typeFilter);
      if (statusFilter !== "ALL") q.set("status", statusFilter);

      const res = await fetch(`/api/transactions?${q.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
        setMetrics(data.metrics || null);
        setAccounts(data.accounts || []);
        if (data.accounts?.length > 0 && !formData.accountId) {
          setFormData((prev) => ({ ...prev, accountId: data.accounts[0].id }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLookups = async () => {
    try {
      const [pRes, cRes, vRes, ctRes] = await Promise.all([
        fetch("/api/projects"),
        fetch("/api/customers"),
        fetch("/api/vendors?status=APPROVED"),
        fetch("/api/contractors"),
      ]);
      if (pRes.ok) setProjects(await pRes.json());
      if (cRes.ok) setCustomers(await cRes.json());
      if (vRes.ok) setVendors(await vRes.json());
      if (ctRes.ok) setContractors(await ctRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, type: modalType }),
      });

      if (res.ok) {
        setShowModal(false);
        resetForm();
        fetchTransactions();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to submit transaction");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (txnId: string, action: "APPROVE" | "REJECT") => {
    try {
      const res = await fetch(`/api/transactions/${txnId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) fetchTransactions();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReverse = async () => {
    if (!selectedTxn) return;
    try {
      const res = await fetch(`/api/transactions/${selectedTxn.id}/reverse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reversalReason }),
      });

      if (res.ok) {
        setShowReversalModal(false);
        setSelectedTxn(null);
        setReversalReason("");
        fetchTransactions();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const exportExcel = () => {
    const rows = transactions.map((t) => ({
      "Txn Number": t.transactionNumber,
      Date: formatDate(t.createdAt),
      Type: t.type,
      Category: t.category,
      Amount: t.amount,
      Account: t.account?.name,
      "Payment Method": t.paymentMethod,
      Project: t.project?.name || "-",
      Customer: t.customer?.name || "-",
      Vendor: t.vendor?.companyName || "-",
      Status: t.status,
      Description: t.description,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DailyTransactions");
    XLSX.writeFile(workbook, `BuildMaster_Transactions_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const resetForm = () => {
    setFormData({
      type: modalType,
      category: modalType === "DEPOSIT" ? "Customer Advance Payment" : "Material Purchase",
      amount: "",
      paymentMethod: "BANK_TRANSFER",
      accountId: accounts[0]?.id || "",
      customerId: "",
      vendorId: "",
      contractorId: "",
      projectId: "",
      description: "",
      receiptUrl: "",
    });
  };

  const depositCategories = [
    "Customer Advance Payment",
    "Customer Milestone Payment",
    "Customer Final Settlement",
    "Direct Cash Deposit",
    "Bank Transfer / Capital Inflow",
    "Vendor Refund",
    "Scrap / Material Resale",
    "Other Income",
  ];

  const withdrawalCategories = [
    "Material Purchase",
    "Labour Weekly Payment",
    "Contractor Milestone Payment",
    "Vendor Payout",
    "Transportation & Logistics",
    "Equipment & Machinery Hiring",
    "Site Utilities & Fuel",
    "Office Administrative Expenses",
    "Other Site Expense",
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Daily Cash & Bank Ledger
          </h1>
          <p className="text-xs font-medium text-slate-500">
            Compliant double-entry tracking, non-destructive reversal entries, and daily balance reconciliation
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
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Ledger</span>
          </button>
          <button
            onClick={() => {
              setModalType("DEPOSIT");
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700"
          >
            <ArrowDownLeft className="h-4 w-4" />
            <span>Record Deposit</span>
          </button>
          <button
            onClick={() => {
              setModalType("WITHDRAWAL");
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-rose-700"
          >
            <ArrowUpRight className="h-4 w-4" />
            <span>Record Withdrawal</span>
          </button>
        </div>
      </div>

      {/* DAILY FINANCIAL DASHBOARD KPI STRIP */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {/* Opening Balance */}
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Opening Balance
          </span>
          <p className="mt-1 font-bold text-slate-900 text-base">
            {formatCurrency(metrics?.openingBalance)}
          </p>
          <span className="text-[10px] text-slate-400">Day start</span>
        </div>

        {/* Total Deposits Today */}
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-3.5 shadow-sm">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
            + Deposits Today
          </span>
          <p className="mt-1 font-bold text-emerald-700 text-base">
            {formatCurrency(metrics?.totalDepositsToday)}
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">Cleared inflows</span>
        </div>

        {/* Total Withdrawals Today */}
        <div className="rounded-xl border border-rose-100 bg-rose-50/30 p-3.5 shadow-sm">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-700">
            - Withdrawals Today
          </span>
          <p className="mt-1 font-bold text-rose-700 text-base">
            {formatCurrency(metrics?.totalWithdrawalsToday)}
          </p>
          <span className="text-[10px] text-rose-600 font-medium">Approved payouts</span>
        </div>

        {/* Closing Balance */}
        <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-3.5 shadow-sm">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-700">
            = Closing Balance
          </span>
          <p className="mt-1 font-bold text-blue-900 text-base">
            {formatCurrency(metrics?.closingBalance)}
          </p>
          <span className="text-[10px] text-blue-600 font-medium">Reconciled total</span>
        </div>

        {/* Cash Balance */}
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Cash in Hand
          </span>
          <p className="mt-1 font-bold text-slate-800 text-base">
            {formatCurrency(metrics?.cashBalance)}
          </p>
          <span className="text-[10px] text-slate-400">Petty Cash</span>
        </div>

        {/* Bank Balance */}
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Bank Balance
          </span>
          <p className="mt-1 font-bold text-slate-800 text-base">
            {formatCurrency(metrics?.bankBalance)}
          </p>
          <span className="text-[10px] text-slate-400">HDFC & ICICI</span>
        </div>

        {/* Pending Approval */}
        <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-3.5 shadow-sm">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-700">
            Pending Queue
          </span>
          <p className="mt-1 font-bold text-amber-700 text-base">
            {formatCurrency(metrics?.pendingAmount)}
          </p>
          <span className="text-[10px] text-amber-600 font-medium">
            {metrics?.pendingCount || 0} awaiting auth
          </span>
        </div>
      </div>

      {/* Date Filter & Status Filter Strip */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm md:flex-row md:items-center md:justify-between">
        {/* Date presets */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="font-semibold text-slate-500 mr-1 flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" /> Date:
          </span>
          {[
            { key: "today", label: "Today" },
            { key: "yesterday", label: "Yesterday" },
            { key: "this_month", label: "This Month" },
            { key: "custom", label: "Custom Range" },
          ].map((d) => (
            <button
              key={d.key}
              onClick={() => setDateRange(d.key)}
              className={`rounded-lg px-2.5 py-1 font-bold transition-all ${
                dateRange === d.key
                  ? "bg-slate-900 text-white"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {d.label}
            </button>
          ))}

          {dateRange === "custom" && (
            <div className="flex items-center gap-1.5 ml-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded border border-slate-200 p-1 text-xs"
              />
              <span className="text-slate-400">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded border border-slate-200 p-1 text-xs"
              />
            </div>
          )}
        </div>

        {/* Type & Status */}
        <div className="flex items-center gap-2 text-xs">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Transactions</option>
            <option value="DEPOSIT">Deposits Only (Inflow)</option>
            <option value="WITHDRAWAL">Withdrawals Only (Outflow)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="APPROVED">Approved Only</option>
            <option value="PENDING">Pending Auth Only</option>
            <option value="REVERSED">Reversed Only</option>
          </select>

          <button
            onClick={fetchTransactions}
            className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100"
            title="Refresh Ledger"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Transaction Records Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Txn # & Date</th>
                <th className="py-3 px-4">Category & Description</th>
                <th className="py-3 px-4">Account & Mode</th>
                <th className="py-3 px-4">Party / Project</th>
                <th className="py-3 px-4">Amount (₹)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="mx-auto h-6 w-6 animate-spin text-blue-600" />
                    <p className="mt-2 text-xs">Calculating ledger entries...</p>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    No transactions found for the selected date range.
                  </td>
                </tr>
              ) : (
                transactions.map((t) => {
                  const isDeposit = t.type === "DEPOSIT";
                  return (
                    <tr
                      key={t.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        t.isReversed ? "bg-slate-50/50 opacity-70" : ""
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-slate-900">
                          {t.transactionNumber}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {formatDateTime(t.createdAt)}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{t.category}</div>
                        <p className="text-[11px] text-slate-500 max-w-xs truncate">
                          {t.description}
                        </p>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{t.account?.name}</div>
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-600 uppercase">
                          {t.paymentMethod}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {t.project && (
                          <div className="font-semibold text-blue-600 truncate max-w-[140px]">
                            {t.project.name}
                          </div>
                        )}
                        <div className="text-[11px] text-slate-500">
                          {t.customer?.name || t.vendor?.companyName || t.contractor?.name || "-"}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-sm font-bold">
                        <span className={isDeposit ? "text-emerald-600" : "text-rose-600"}>
                          {isDeposit ? "+" : "-"} {formatCurrency(t.amount)}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            t.status === "APPROVED"
                              ? "bg-emerald-50 text-emerald-700"
                              : t.status === "PENDING"
                              ? "bg-amber-50 text-amber-700 animate-pulse"
                              : t.status === "REVERSED"
                              ? "bg-slate-200 text-slate-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Receipt voucher */}
                          <button
                            onClick={() => {
                              setSelectedTxn(t);
                              setShowReceiptModal(true);
                            }}
                            title="Print Voucher"
                            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-blue-600"
                          >
                            <FileText className="h-4 w-4" />
                          </button>

                          {/* Approval Actions if PENDING */}
                          {t.status === "PENDING" && (
                            <>
                              <button
                                onClick={() => handleApprove(t.id, "APPROVE")}
                                title="Approve Transaction"
                                className="rounded bg-emerald-50 p-1 text-emerald-700 hover:bg-emerald-100"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleApprove(t.id, "REJECT")}
                                title="Reject Transaction"
                                className="rounded bg-rose-50 p-1 text-rose-700 hover:bg-rose-100"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}

                          {/* Reversal entry button if APPROVED & NOT already reversed */}
                          {t.status === "APPROVED" && !t.isReversed && (
                            <button
                              onClick={() => {
                                setSelectedTxn(t);
                                setShowReversalModal(true);
                              }}
                              title="Reversal Entry (Correction)"
                              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-amber-600"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Deposit / Withdrawal Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">
                {modalType === "DEPOSIT" ? "Record Cash / Bank Deposit" : "Record Expense / Withdrawal"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-blue-500 focus:outline-none"
                  >
                    {(modalType === "DEPOSIT" ? depositCategories : withdrawalCategories).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Amount (₹ INR) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
                    placeholder="e.g. 250000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Target Account *</label>
                  <select
                    value={formData.accountId}
                    onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-blue-500 focus:outline-none"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({formatCurrency(acc.balance)})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Payment Mode *</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-blue-500 focus:outline-none"
                  >
                    <option value="BANK_TRANSFER">Bank Transfer (NEFT/RTGS/IMPS)</option>
                    <option value="UPI">UPI / QR Code</option>
                    <option value="CASH">Cash in Hand</option>
                    <option value="CHEQUE">Cheque / Demand Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Associated Project</label>
                <select
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-blue-500 focus:outline-none"
                >
                  <option value="">-- General Corporate / Overhead --</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.projectCode})
                    </option>
                  ))}
                </select>
              </div>

              {modalType === "DEPOSIT" ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Customer</label>
                  <select
                    value={formData.customerId}
                    onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">-- Direct Payment / Other --</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.phone})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Vendor (if material)</label>
                    <select
                      value={formData.vendorId}
                      onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">-- Select Vendor --</option>
                      {vendors.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.companyName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Contractor (if labour)</label>
                    <select
                      value={formData.contractorId}
                      onChange={(e) => setFormData({ ...formData, contractorId: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">-- Select Contractor --</option>
                      {contractors.map((ct) => (
                        <option key={ct.id} value={ct.id}>
                          {ct.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700">Narration / Description *</label>
                <textarea
                  rows={2}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-blue-500 focus:outline-none"
                  placeholder="e.g. Payment for 750 bags cement batch #24 against invoice #889"
                />
              </div>

              {parseFloat(formData.amount || "0") >= 50000 && (
                <div className="rounded-lg bg-amber-50 p-2.5 text-xs text-amber-800 flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600" />
                  <span>
                    High-value transaction (&ge; ₹50,000) will be submitted to the Admin authorization queue.
                  </span>
                </div>
              )}

              <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`rounded-lg px-4 py-2 text-xs font-semibold text-white ${
                    modalType === "DEPOSIT" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
                  }`}
                >
                  {isSubmitting ? "Posting to Ledger..." : "Post Transaction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reversal Entry Confirmation Modal */}
      {showReversalModal && selectedTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-2 text-amber-600 font-bold text-sm">
              <RotateCcw className="h-5 w-5" />
              <span>Post Accounting Reversal Entry</span>
            </div>
            <p className="mt-2 text-xs text-slate-600">
              In accordance with enterprise accounting standards, financial transactions are never deleted. A reversing entry will be generated to balance the ledger.
            </p>

            <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs">
              <p className="font-semibold text-slate-800">
                Target: {selectedTxn.transactionNumber}
              </p>
              <p className="text-slate-500">
                {selectedTxn.type} of {formatCurrency(selectedTxn.amount)}
              </p>
            </div>

            <div className="mt-3">
              <label className="block text-xs font-semibold text-slate-700">Reason for Reversal *</label>
              <input
                type="text"
                required
                value={reversalReason}
                onChange={(e) => setReversalReason(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-amber-500 focus:outline-none"
                placeholder="e.g. Duplicate entry by billing clerk"
              />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowReversalModal(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReverse}
                className="rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700"
              >
                Post Reversal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Receipt Voucher Modal */}
      {showReceiptModal && selectedTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="text-center border-b border-slate-200 pb-3">
              <h2 className="text-base font-bold text-slate-900">
                BUILDMASTER CONSTRUCTION ERP
              </h2>
              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                Official Financial Voucher
              </p>
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Voucher No:</span>
                <span className="font-mono font-bold text-slate-900">{selectedTxn.transactionNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date & Time:</span>
                <span className="font-semibold text-slate-800">{formatDateTime(selectedTxn.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction Type:</span>
                <span className="font-bold uppercase text-blue-600">{selectedTxn.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Category:</span>
                <span className="font-semibold text-slate-800">{selectedTxn.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Account Register:</span>
                <span className="font-semibold text-slate-800">{selectedTxn.account?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Mode:</span>
                <span className="font-bold text-slate-800">{selectedTxn.paymentMethod}</span>
              </div>

              <div className="mt-3 rounded-lg bg-slate-100 p-3 text-center">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Total Amount</span>
                <p className="text-xl font-bold text-slate-900 mt-0.5">
                  {formatCurrency(selectedTxn.amount)}
                </p>
              </div>

              <div className="mt-2 text-slate-600 text-[11px]">
                <span className="font-bold">Narration:</span> {selectedTxn.description}
              </div>
            </div>

            <div className="mt-6 flex justify-between border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Voucher</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
