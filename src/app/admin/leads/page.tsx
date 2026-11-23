"use client";

import { useState, useEffect } from "react";
import {
  Compass,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  SlidersHorizontal,
  UserCheck,
  Send,
  Zap,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/formatters";

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignVendorId, setAssignVendorId] = useState("");
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

  // New Lead Form State
  const [newLead, setNewLead] = useState({
    customerName: "",
    phone: "",
    email: "",
    projectLocation: "Mumbai",
    constructionType: "Residential",
    budget: "",
    plotSize: "",
    requirement: "",
    preferredContactTime: "Morning 10 AM - 12 PM",
    assignedVendorId: "",
    autoAssign: true,
  });

  const statuses = [
    "ALL",
    "NEW",
    "ASSIGNED",
    "CONTACTED",
    "INTERESTED",
    "QUOTATION_SENT",
    "NEGOTIATION",
    "CONVERTED",
    "REJECTED",
  ];

  useEffect(() => {
    fetchLeads();
    fetchVendors();
  }, [statusFilter, search]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (statusFilter !== "ALL") query.set("status", statusFilter);
      if (search) query.set("search", search);

      const res = await fetch(`/api/leads?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      const res = await fetch("/api/vendors?status=APPROVED");
      if (res.ok) {
        const data = await res.json();
        setVendors(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLead),
      });

      if (res.ok) {
        setShowAddModal(false);
        setMessage({ type: "success", text: "New lead created and matched against available vendors!" });
        fetchLeads();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchLeads();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleManualAssign = async () => {
    if (!selectedLead || !assignVendorId) return;
    try {
      const res = await fetch(`/api/leads/${selectedLead.id}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorId: assignVendorId }),
      });

      if (res.ok) {
        setShowAssignModal(false);
        setSelectedLead(null);
        setAssignVendorId("");
        setMessage({ type: "success", text: "Vendor assigned to lead successfully." });
        fetchLeads();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAutoMatch = async (leadId: string) => {
    try {
      setMessage({ type: "info", text: "Running AI/Algorithmic Lead Matcher..." });
      const res = await fetch("/api/public/inquiry", {
        // Alternatively autoAssignLead
      });
      fetchLeads();
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
            Lead CRM & Vendor Distribution
          </h1>
          <p className="text-xs font-medium text-slate-500">
            Intelligent location & specialization matching, status pipeline, and vendor responses
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>New Lead</span>
        </button>
      </div>

      {/* Alert Notice */}
      {message && (
        <div
          className={`flex items-center justify-between rounded-xl p-3 text-xs font-semibold ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-blue-50 text-blue-800 border border-blue-200"
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>
      )}

      {/* Filter and Status Pipeline Chips */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search leads by customer name, location, contact, type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
            />
          </div>
          <button
            onClick={fetchLeads}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Pipeline Stage Badges */}
        <div className="flex flex-wrap gap-1.5">
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                statusFilter === st
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Leads Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Lead ID & Customer</th>
                <th className="py-3 px-4">Project & Location</th>
                <th className="py-3 px-4">Budget</th>
                <th className="py-3 px-4">Assigned Vendor</th>
                <th className="py-3 px-4">Vendor Status</th>
                <th className="py-3 px-4">Pipeline Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="mx-auto h-6 w-6 animate-spin text-blue-600" />
                    <p className="mt-2 text-xs">Loading leads database...</p>
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No leads found matching current filters.
                  </td>
                </tr>
              ) : (
                leads.map((l) => {
                  const latestAssignment = l.assignments?.[0];
                  return (
                    <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-blue-600">
                            {l.leadNumber}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {formatDate(l.createdAt)}
                          </span>
                        </div>
                        <div className="font-bold text-slate-900 mt-0.5">{l.customerName}</div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                          <Phone className="h-3 w-3 text-slate-400" />
                          <span>{l.phone}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">
                          {l.constructionType}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          <span>{l.projectLocation}</span>
                          {l.plotSize && <span className="text-slate-400">({l.plotSize})</span>}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-bold text-slate-900">
                        {formatCurrency(l.budget)}
                      </td>

                      <td className="py-3 px-4">
                        {l.assignedVendor ? (
                          <div>
                            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                              <Truck className="h-3.5 w-3.5 text-blue-600" />
                              <span>{l.assignedVendor.companyName}</span>
                            </div>
                            <span className="text-[10px] text-slate-500">
                              ★ {l.assignedVendor.rating} Rating
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                            <Clock className="h-3 w-3" /> Unassigned
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {latestAssignment ? (
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              latestAssignment.status === "ACCEPTED"
                                ? "bg-emerald-50 text-emerald-700"
                                : latestAssignment.status === "PENDING"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-rose-50 text-rose-700"
                            }`}
                          >
                            {latestAssignment.status}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <select
                          value={l.status}
                          onChange={(e) => handleStatusChange(l.id, e.target.value)}
                          className={`rounded-lg border px-2 py-1 text-[11px] font-bold focus:outline-none ${
                            l.status === "CONVERTED"
                              ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                              : l.status === "QUOTATION_SENT"
                              ? "border-blue-300 bg-blue-50 text-blue-700"
                              : l.status === "REJECTED"
                              ? "border-rose-300 bg-rose-50 text-rose-700"
                              : "border-slate-200 bg-white text-slate-700"
                          }`}
                        >
                          <option value="NEW">NEW</option>
                          <option value="ASSIGNED">ASSIGNED</option>
                          <option value="CONTACTED">CONTACTED</option>
                          <option value="INTERESTED">INTERESTED</option>
                          <option value="QUOTATION_SENT">QUOTATION SENT</option>
                          <option value="NEGOTIATION">NEGOTIATION</option>
                          <option value="CONVERTED">CONVERTED (Won)</option>
                          <option value="REJECTED">REJECTED</option>
                        </select>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedLead(l);
                            setAssignVendorId(l.assignedVendorId || "");
                            setShowAssignModal(true);
                          }}
                          className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          {l.assignedVendorId ? "Change Vendor" : "Assign"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Vendor Modal */}
      {showAssignModal && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-base font-bold text-slate-900">
              Assign Vendor to Lead: {selectedLead.leadNumber}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Customer: {selectedLead.customerName} • {selectedLead.projectLocation} (
              {selectedLead.constructionType})
            </p>

            <div className="mt-4 space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Select Approved Partner Vendor
              </label>
              <select
                value={assignVendorId}
                onChange={(e) => setAssignVendorId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
              >
                <option value="">-- Choose Eligible Vendor --</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.companyName} ({v.city} - {v.specialization}) ★ {v.rating}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleManualAssign}
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-base font-bold text-slate-900">Create New CRM Lead</h2>
            <p className="text-xs text-slate-500">
              Records lead details and initiates vendor auto-distribution
            </p>

            <form onSubmit={handleCreateLead} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newLead.customerName}
                    onChange={(e) => setNewLead({ ...newLead, customerName: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-blue-500 focus:outline-none"
                    placeholder="e.g. Mukesh Ambani"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={newLead.phone}
                    onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-blue-500 focus:outline-none"
                    placeholder="+91 99887 76655"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Project Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={newLead.projectLocation}
                    onChange={(e) => setNewLead({ ...newLead, projectLocation: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-blue-500 focus:outline-none"
                    placeholder="e.g. Mumbai, Pune"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Construction Category *
                  </label>
                  <select
                    value={newLead.constructionType}
                    onChange={(e) => setNewLead({ ...newLead, constructionType: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Residential">Residential Construction</option>
                    <option value="Commercial">Commercial Project</option>
                    <option value="Industrial">Industrial Warehouse</option>
                    <option value="Renovation">Turnkey Renovation</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Budget (₹ INR)
                  </label>
                  <input
                    type="number"
                    value={newLead.budget}
                    onChange={(e) => setNewLead({ ...newLead, budget: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-blue-500 focus:outline-none"
                    placeholder="e.g. 50000000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Plot / Built-up Size
                  </label>
                  <input
                    type="text"
                    value={newLead.plotSize}
                    onChange={(e) => setNewLead({ ...newLead, plotSize: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-blue-500 focus:outline-none"
                    placeholder="e.g. 15,000 sq.ft"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Detailed Requirement
                </label>
                <textarea
                  rows={2}
                  value={newLead.requirement}
                  onChange={(e) => setNewLead({ ...newLead, requirement: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-blue-500 focus:outline-none"
                  placeholder="Structural specs, floor plan details..."
                />
              </div>

              <div className="rounded-lg bg-blue-50/70 p-3 text-xs text-blue-900">
                <span className="font-bold flex items-center gap-1 text-blue-700">
                  <Zap className="h-3.5 w-3.5" /> Automatic Lead Engine Enabled
                </span>
                <p className="mt-0.5 text-[11px] text-blue-800">
                  Upon creation, BuildMaster will score eligible vendors based on {newLead.projectLocation} location and {newLead.constructionType} specialization.
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
                  Save & Trigger Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
