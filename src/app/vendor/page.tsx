"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Truck,
  Building2,
  Compass,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  LogOut,
  ExternalLink,
  ChevronRight,
  Shield,
  FileText,
} from "lucide-react";
import { formatCurrency, formatCompactCurrency, formatDate } from "@/lib/formatters";

export default function VendorPortalPage() {
  const [vendorUser, setVendorUser] = useState<any>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"leads" | "projects" | "payments">("leads");
  const [rejectModalLead, setRejectModalLead] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    fetchVendorData();
  }, []);

  const fetchVendorData = async () => {
    setLoading(true);
    try {
      // 1. Get Me or fallback to default approved vendor
      const meRes = await fetch("/api/auth/me");
      let currentVendorId = "";
      if (meRes.ok) {
        const meData = await meRes.json();
        setVendorUser(meData.user);
        currentVendorId = meData.user?.vendor?.id || "";
      }

      // 2. Fetch leads assigned to this vendor
      const leadsRes = await fetch(
        currentVendorId ? `/api/leads?vendorId=${currentVendorId}` : "/api/leads"
      );
      if (leadsRes.ok) {
        setLeads(await leadsRes.json());
      }

      // 3. Fetch projects for this vendor
      const prjRes = await fetch(
        currentVendorId ? `/api/projects?vendorId=${currentVendorId}` : "/api/projects"
      );
      if (prjRes.ok) {
        setProjects(await prjRes.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRespondLead = async (leadId: string, action: "ACCEPT" | "REJECT", reason?: string) => {
    try {
      const res = await fetch(`/api/leads/${leadId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason }),
      });

      if (res.ok) {
        setRejectModalLead(null);
        setRejectionReason("");
        fetchVendorData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const acceptedLeads = leads.filter((l) => l.status === "CONTACTED" || l.status === "QUOTATION_SENT" || l.status === "CONVERTED");
  const pendingLeads = leads.filter((l) => l.status === "ASSIGNED" || l.status === "NEW");

  return (
    <div className="min-h-screen bg-slate-100/80">
      {/* Top Vendor Header */}
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-slate-900 px-6 text-white shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white shadow-sm">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight">
              BuildMaster <span className="text-orange-400">Vendor Partner Portal</span>
            </h1>
            <p className="text-[11px] text-slate-400">
              {vendorUser?.vendor?.companyName || "Apex Civil Infra Pvt Ltd"} • Priority Partner
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            <span>Admin View</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
          <button
            onClick={() => {
              fetch("/api/auth/logout", { method: "POST" });
              window.location.href = "/login";
            }}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-rose-400 hover:bg-slate-800"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl p-6 space-y-6">
        {/* KPI Summary Strip */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-400">
                Assigned Leads
              </span>
              <Compass className="h-4 w-4 text-orange-500" />
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">{leads.length}</p>
            <span className="text-[11px] text-amber-600 font-semibold">
              {pendingLeads.length} awaiting response
            </span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-400">
                Active Projects
              </span>
              <Building2 className="h-4 w-4 text-blue-600" />
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">{projects.length}</p>
            <span className="text-[11px] text-blue-600 font-semibold">
              Execution under contract
            </span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-400">
                Accepted Pipeline
              </span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="mt-2 text-2xl font-bold text-emerald-700">{acceptedLeads.length}</p>
            <span className="text-[11px] text-emerald-600 font-semibold">
              In active negotiation
            </span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-400">
                Partner Rating
              </span>
              <Shield className="h-4 w-4 text-indigo-600" />
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">★ 4.9</p>
            <span className="text-[11px] text-slate-500">Tier 1 Top Priority</span>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab("leads")}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              activeTab === "leads"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            Assigned Leads & Inquiries ({leads.length})
          </button>
          <button
            onClick={() => setActiveTab("projects")}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              activeTab === "projects"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            Under-Construction Sites ({projects.length})
          </button>
        </div>

        {/* LEADS TAB CONTENT */}
        {activeTab === "leads" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-slate-900 text-sm">
                    Inquiries Distributed to Your Firm
                  </h2>
                  <p className="text-xs text-slate-400">
                    Accept leads to contact client or submit quotations
                  </p>
                </div>
                <button
                  onClick={fetchVendorData}
                  className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {leads.length === 0 ? (
                  <p className="py-12 text-center text-xs text-slate-400">
                    No leads currently distributed to your queue.
                  </p>
                ) : (
                  leads.map((l) => {
                    const isPending = l.status === "ASSIGNED" || l.status === "NEW";
                    return (
                      <div key={l.id} className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:bg-slate-50 transition-colors">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-blue-600">
                              {l.leadNumber}
                            </span>
                            <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                              {l.constructionType}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {formatDate(l.createdAt)}
                            </span>
                          </div>

                          <h3 className="font-bold text-slate-900 text-base">{l.customerName}</h3>

                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                            <span className="flex items-center gap-1">
                              <Phone className="h-3.5 w-3.5 text-slate-400" />
                              {l.phone}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-slate-400" />
                              {l.projectLocation} {l.plotSize && `(${l.plotSize})`}
                            </span>
                            <span className="font-bold text-emerald-700">
                              Budget: {formatCurrency(l.budget)}
                            </span>
                          </div>

                          {l.requirement && (
                            <p className="text-xs text-slate-500 pt-1 italic">
                              "{l.requirement}"
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          {isPending ? (
                            <>
                              <button
                                onClick={() => handleRespondLead(l.id, "ACCEPT")}
                                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                <span>Accept Lead</span>
                              </button>
                              <button
                                onClick={() => setRejectModalLead(l)}
                                className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                              >
                                <XCircle className="h-4 w-4" />
                                <span>Decline</span>
                              </button>
                            </>
                          ) : (
                            <div className="text-right">
                              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                                Accepted ({l.status})
                              </span>
                              <p className="text-[10px] text-slate-400 mt-1">
                                Preferred Contact: {l.preferredContactTime || "Anytime"}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* PROJECTS TAB CONTENT */}
        {activeTab === "projects" && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {projects.map((p) => (
              <div key={p.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-xs font-bold text-blue-600">{p.projectCode}</span>
                    <h3 className="font-bold text-slate-900 text-sm mt-0.5">{p.name}</h3>
                  </div>
                  <span className="rounded bg-blue-50 px-2 py-0.5 font-bold text-blue-700 text-xs">
                    {p.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{p.location}</p>

                <div className="mt-4">
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>Progress</span>
                    <span className="text-blue-600">{p.progressPercent}%</span>
                  </div>
                  <div className="mt-1 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-blue-600" style={{ width: `${p.progressPercent}%` }} />
                  </div>
                </div>

                <div className="mt-4 flex justify-between border-t border-slate-100 pt-3 text-xs">
                  <span className="text-slate-500">Contract: {formatCurrency(p.budget)}</span>
                  <span className="text-slate-500">Target: {formatDate(p.expectedCompletionDate)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reject Lead Modal */}
        {rejectModalLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
              <h3 className="text-base font-bold text-slate-900">Decline Lead Assignment</h3>
              <p className="mt-1 text-xs text-slate-500">
                Declining lead {rejectModalLead.leadNumber} will recycle it into the BuildMaster pool for reassignment to another partner vendor.
              </p>

              <div className="mt-4">
                <label className="block text-xs font-semibold text-slate-700">Reason for Declining *</label>
                <select
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-blue-500 focus:outline-none"
                >
                  <option value="">-- Choose Reason --</option>
                  <option value="Over capacity / Workload full">Over capacity / Current Workload full</option>
                  <option value="Outside service radius">Outside immediate service radius</option>
                  <option value="Category mismatch">Category specialization mismatch</option>
                  <option value="Budget outside parameter">Client budget outside feasibility</option>
                </select>
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <button
                  onClick={() => setRejectModalLead(null)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRespondLead(rejectModalLead.id, "REJECT", rejectionReason)}
                  disabled={!rejectionReason}
                  className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
                >
                  Confirm Decline
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
