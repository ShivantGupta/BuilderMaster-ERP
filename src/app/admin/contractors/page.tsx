"use client";

import { useState, useEffect } from "react";
import {
  HardHat,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  Users,
  Calendar,
  CheckCircle,
  RefreshCw,
  X,
  CreditCard,
  Building2,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/formatters";

export default function ContractorsPage() {
  const [contractors, setContractors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    phone: "",
    email: "",
    specialization: "Civil Masonry & Shuttering",
    labourCount: "20",
    dailyRate: "15000",
    city: "Mumbai",
    address: "",
    bankDetails: "",
  });

  useEffect(() => {
    fetchContractors();
  }, [search]);

  const fetchContractors = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/contractors?search=${encodeURIComponent(search)}`);
      if (res.ok) {
        const data = await res.json();
        setContractors(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/contractors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowAddModal(false);
        fetchContractors();
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
            Contractor & Labour Force Management
          </h1>
          <p className="text-xs font-medium text-slate-500">
            Specialized trade contractors, labour headcount, daily wage rates, and site attendance
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>Add Contractor</span>
        </button>
      </div>

      {/* Search and stats */}
      <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, trade specialization, contact number, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
          />
        </div>
        <button
          onClick={fetchContractors}
          className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Contractors Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-blue-600" />
            <p className="mt-2 text-xs">Loading contractor roster...</p>
          </div>
        ) : contractors.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            No contractors registered yet.
          </div>
        ) : (
          contractors.map((c) => (
            <div
              key={c.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{c.name}</h3>
                  <p className="text-[11px] font-medium text-slate-500">{c.companyName || "Direct Labour Crew"}</p>
                </div>
                <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  {c.status}
                </span>
              </div>

              <div className="mt-3 space-y-1 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  <span>{c.phone}</span>
                </div>
                {c.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    <span className="truncate">{c.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span>{c.city}</span>
                </div>
              </div>

              <div className="mt-3 rounded-lg bg-slate-50 p-3">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Trade Specialization
                </span>
                <p className="font-semibold text-slate-800 text-xs mt-0.5">
                  {c.specialization}
                </p>
                <div className="mt-2 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-blue-600 flex items-center gap-1">
                    <Users className="h-3 w-3" /> {c.labourCount} Workers
                  </span>
                  <span className="font-bold text-slate-700">
                    Daily Rate: {formatCurrency(c.dailyRate)}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>{c.projects?.length || 0} Sites assigned</span>
                <span className="font-semibold text-slate-800">
                  {c.transactions?.length || 0} Payouts
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Contractor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Add New Contractor</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Contractor Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-blue-500 focus:outline-none"
                    placeholder="e.g. Ramesh Sharma"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Company / Firm Name</label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-blue-500 focus:outline-none"
                    placeholder="e.g. Sharma Masonry Works"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-blue-500 focus:outline-none"
                    placeholder="+91 98333 44455"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">City / Base</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-blue-500 focus:outline-none"
                    placeholder="Mumbai"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Trade Specialization</label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-blue-500 focus:outline-none"
                  placeholder="e.g. Shuttering, Plastering, Bar Bending, MEP"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Labour Crew Count</label>
                  <input
                    type="number"
                    value={formData.labourCount}
                    onChange={(e) => setFormData({ ...formData, labourCount: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-blue-500 focus:outline-none"
                    placeholder="25"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Daily Crew Rate (₹)</label>
                  <input
                    type="number"
                    value={formData.dailyRate}
                    onChange={(e) => setFormData({ ...formData, dailyRate: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-blue-500 focus:outline-none"
                    placeholder="18000"
                  />
                </div>
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
                  Save Contractor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
