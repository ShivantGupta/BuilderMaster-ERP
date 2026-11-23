"use client";

import { useState, useEffect } from "react";
import {
  Truck,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  Building,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileCheck,
  Star,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  X,
  CreditCard,
} from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

export default function VendorsPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);

  const [formData, setFormData] = useState({
    companyName: "",
    vendorName: "",
    contactPerson: "",
    mobileNumber: "",
    email: "",
    address: "",
    city: "Mumbai",
    serviceAreas: "Mumbai, Navi Mumbai, Thane, Pune",
    specialization: "Civil Construction, Foundation",
    gstNumber: "",
    panNumber: "",
    bankName: "HDFC Bank",
    accountNumber: "",
    ifscCode: "",
    priority: "1",
    rating: "5.0",
    createLogin: true,
  });

  useEffect(() => {
    fetchVendors();
  }, [statusFilter, search]);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (statusFilter !== "ALL") query.set("status", statusFilter);
      if (search) query.set("search", search);

      const res = await fetch(`/api/vendors?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setVendors(data);
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
      const res = await fetch("/api/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowAddModal(false);
        fetchVendors();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (vendorId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/vendors/${vendorId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchVendors();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Vendor & Partner Management
          </h1>
          <p className="text-xs font-medium text-slate-500">
            Verify documentation, manage service territories, rate performance, and distribute construction leads
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>Add Vendor Partner</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by company, contact person, specialization, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs">
            {["ALL", "APPROVED", "PENDING_APPROVAL", "SUSPENDED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`rounded px-2.5 py-1 text-[11px] font-bold transition-all ${
                  statusFilter === st ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
          <button
            onClick={fetchVendors}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Vendors Cards Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-blue-600" />
            <p className="mt-2 text-xs">Loading approved vendor directory...</p>
          </div>
        ) : vendors.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            No vendors found.
          </div>
        ) : (
          vendors.map((v) => (
            <div
              key={v.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{v.companyName}</h3>
                    <p className="text-[11px] text-slate-500">{v.contactPerson}</p>
                  </div>
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      v.status === "APPROVED"
                        ? "bg-emerald-50 text-emerald-700"
                        : v.status === "PENDING_APPROVAL"
                        ? "bg-amber-50 text-amber-700 animate-pulse"
                        : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {v.status}
                  </span>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    <span>{v.mobileNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    <span className="truncate">{v.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span>{v.city} ({v.serviceAreas})</span>
                  </div>
                </div>

                <div className="mt-4 rounded-lg bg-slate-50 p-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Specialization
                  </span>
                  <p className="font-semibold text-slate-800 text-xs mt-0.5">
                    {v.specialization}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                    <span>GST: {v.gstNumber || "Verified"}</span>
                    <span className="flex items-center gap-0.5 font-bold text-amber-500">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {v.rating}
                    </span>
                  </div>
                </div>

                {/* Counters */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="rounded border border-slate-100 p-2 bg-slate-50/50">
                    <span className="text-slate-400 text-[10px]">Assigned Leads</span>
                    <p className="font-bold text-slate-800 text-sm mt-0.5">
                      {v.assignedLeads?.length || 0}
                    </p>
                  </div>
                  <div className="rounded border border-slate-100 p-2 bg-slate-50/50">
                    <span className="text-slate-400 text-[10px]">Active Projects</span>
                    <p className="font-bold text-slate-800 text-sm mt-0.5">
                      {v.projects?.length || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                {v.status === "PENDING_APPROVAL" ? (
                  <button
                    onClick={() => handleUpdateStatus(v.id, "APPROVED")}
                    className="w-full rounded-lg bg-emerald-600 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                  >
                    Approve Partner
                  </button>
                ) : (
                  <div className="flex w-full items-center justify-between">
                    <span className="text-[11px] text-slate-400">Priority: Tier {v.priority}</span>
                    {v.status === "APPROVED" ? (
                      <button
                        onClick={() => handleUpdateStatus(v.id, "SUSPENDED")}
                        className="text-[11px] font-semibold text-rose-600 hover:underline"
                      >
                        Suspend
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateStatus(v.id, "APPROVED")}
                        className="text-[11px] font-semibold text-emerald-600 hover:underline"
                      >
                        Re-activate
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Vendor Partner Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">
                Register New Vendor Partner
              </h2>
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
                  <label className="block text-xs font-semibold text-slate-700">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-blue-500 focus:outline-none"
                    placeholder="e.g. Apex Civil Infra"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Contact Person *</label>
                  <input
                    type="text"
                    required
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-blue-500 focus:outline-none"
                    placeholder="e.g. Anil Agarwal"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.mobileNumber}
                    onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-blue-500 focus:outline-none"
                    placeholder="+91 94111 22233"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-blue-500 focus:outline-none"
                    placeholder="apex@vendor.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Service Areas</label>
                  <input
                    type="text"
                    value={formData.serviceAreas}
                    onChange={(e) => setFormData({ ...formData, serviceAreas: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-blue-500 focus:outline-none"
                    placeholder="Mumbai, Pune, Thane"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Specialization</label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-blue-500 focus:outline-none"
                  placeholder="e.g. Civil Construction, Steel PEB, Interior Finishing"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">GST Number</label>
                  <input
                    type="text"
                    value={formData.gstNumber}
                    onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-blue-500 focus:outline-none"
                    placeholder="27AABCU9603R1ZM"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">PAN Number</label>
                  <input
                    type="text"
                    value={formData.panNumber}
                    onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-blue-500 focus:outline-none"
                    placeholder="AABCU9603R"
                  />
                </div>
              </div>

              <div className="rounded-lg bg-slate-50 p-3 text-xs space-y-1">
                <span className="font-semibold text-slate-700">Vendor Login Credentials</span>
                <p className="text-[11px] text-slate-500">
                  Creates portal user account for {formData.email || "vendor email"}. Default password: <code className="bg-slate-200 px-1 py-0.5 rounded">vendor123</code>
                </p>
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
                  Save & Approve
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
