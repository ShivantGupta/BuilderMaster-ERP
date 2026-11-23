"use client";

import { useState, useEffect } from "react";
import {
  CreditCard,
  Search,
  Plus,
  Filter,
  RefreshCw,
  Building2,
  Truck,
  HardHat,
  X,
  FileText,
  DollarSign,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/formatters";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [contractors, setContractors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    category: "Cement",
    amount: "",
    paymentMethod: "CASH",
    projectId: "",
    vendorId: "",
    contractorId: "",
    description: "",
    billUrl: "",
    date: new Date().toISOString().split("T")[0],
  });

  const categories = [
    "ALL",
    "Cement",
    "Sand",
    "Bricks",
    "Steel",
    "Labour",
    "Electrical",
    "Plumbing",
    "Transportation",
    "Machinery",
    "Other",
  ];

  useEffect(() => {
    fetchExpenses();
    fetchLookups();
  }, [categoryFilter]);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (categoryFilter !== "ALL") q.set("category", categoryFilter);
      const res = await fetch(`/api/expenses?${q.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setExpenses(data.expenses || []);
        setSummary(data.summary || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLookups = async () => {
    try {
      const [pRes, vRes, ctRes] = await Promise.all([
        fetch("/api/projects"),
        fetch("/api/vendors?status=APPROVED"),
        fetch("/api/contractors"),
      ]);
      if (pRes.ok) setProjects(await pRes.json());
      if (vRes.ok) setVendors(await vRes.json());
      if (ctRes.ok) setContractors(await ctRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowAddModal(false);
        fetchExpenses();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Material & Site Expense Tracking
          </h1>
          <p className="text-xs font-medium text-slate-500">
            Categorized procurement bills, site contractor disbursements, machinery hire and transport
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Total Incurred
          </span>
          <p className="mt-1 font-bold text-slate-900 text-lg">
            {formatCurrency(summary?.totalAmount)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Bill Entries
          </span>
          <p className="mt-1 font-bold text-slate-900 text-lg">
            {summary?.totalCount || 0} bills logged
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Top Category
          </span>
          <p className="mt-1 font-bold text-blue-600 text-lg">Cement & Steel</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Audit Status
          </span>
          <p className="mt-1 font-bold text-emerald-600 text-lg">100% Reconciled</p>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-1.5">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              categoryFilter === cat
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Expenses Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Expense # & Date</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Project</th>
                <th className="py-3 px-4">Party</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="mx-auto h-6 w-6 animate-spin text-blue-600" />
                    <p className="mt-2 text-xs">Loading expense vouchers...</p>
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No expense vouchers found.
                  </td>
                </tr>
              ) : (
                expenses.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-900">{e.expenseNumber}</div>
                      <div className="text-[10px] text-slate-400">{formatDate(e.date)}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                        {e.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-800">{e.description}</p>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">
                      {e.project?.name || "Corporate Overhead"}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {e.vendor?.companyName || e.contractor?.name || "-"}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-rose-600 text-sm">
                      {formatCurrency(e.amount)}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-600 uppercase text-[10px]">
                      {e.paymentMethod}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-base font-bold text-slate-900">Add Material / Site Expense</h2>
            <p className="text-xs text-slate-500">Record bill or disbursement against project</p>

            <form onSubmit={handleCreate} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-blue-500 focus:outline-none"
                  >
                    {categories.filter((c) => c !== "ALL").map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Amount (₹ INR) *</label>
                  <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs font-bold focus:border-blue-500 focus:outline-none"
                    placeholder="e.g. 75000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Site Project</label>
                <select
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-blue-500 focus:outline-none"
                >
                  <option value="">-- General Overhead --</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Bill Narration *</label>
                <textarea
                  rows={2}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-blue-500 focus:outline-none"
                  placeholder="Material specification or reason for disbursement"
                />
              </div>

              <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
