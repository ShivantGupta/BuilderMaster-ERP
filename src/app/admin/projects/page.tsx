"use client";

import { useState, useEffect } from "react";
import {
  Building2,
  Search,
  Plus,
  MapPin,
  Calendar,
  Users,
  Truck,
  HardHat,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  ChevronRight,
  RefreshCw,
  X,
  Camera,
  Layers,
} from "lucide-react";
import { formatCurrency, formatCompactCurrency, formatDate } from "@/lib/formatters";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [contractors, setContractors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);

  // New Project Form State
  const [newProject, setNewProject] = useState({
    name: "",
    customerId: "",
    vendorId: "",
    contractorId: "",
    location: "",
    projectType: "Residential",
    budget: "",
    startDate: new Date().toISOString().split("T")[0],
    expectedCompletionDate: "",
    status: "STARTED",
    progressPercent: 0,
    description: "",
  });

  // Daily Progress Form State
  const [progressForm, setProgressForm] = useState({
    title: "",
    description: "",
    percentage: 50,
    labourCount: 25,
    weather: "Sunny, 30°C",
    materialUsed: "",
    notes: "",
  });

  useEffect(() => {
    fetchProjects();
    fetchLookups();
  }, [statusFilter, search]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (statusFilter !== "ALL") query.set("status", statusFilter);
      if (search) query.set("search", search);

      const res = await fetch(`/api/projects?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLookups = async () => {
    try {
      const [cRes, vRes, ctRes] = await Promise.all([
        fetch("/api/customers"),
        fetch("/api/vendors?status=APPROVED"),
        fetch("/api/contractors"),
      ]);
      if (cRes.ok) setCustomers(await cRes.json());
      if (vRes.ok) setVendors(await vRes.json());
      if (ctRes.ok) setContractors(await ctRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProject),
      });

      if (res.ok) {
        setShowAddModal(false);
        fetchProjects();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openProjectDetails = async (id: string) => {
    try {
      const res = await fetch(`/api/projects/${id}`);
      if (res.ok) {
        const full = await res.json();
        setSelectedProject(full);
        setProgressForm((prev) => ({
          ...prev,
          percentage: full.progressPercent || 0,
        }));
        setShowDetailModal(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    try {
      const res = await fetch(`/api/projects/${selectedProject.id}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(progressForm),
      });

      if (res.ok) {
        setShowProgressModal(false);
        openProjectDetails(selectedProject.id);
        fetchProjects();
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
            Construction Project Sites
          </h1>
          <p className="text-xs font-medium text-slate-500">
            Monitor site progress, milestone billings, material consumption, and contractor performance
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>Launch Project</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects by name, code, site location, type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs">
            {["ALL", "STARTED", "IN_PROGRESS", "ON_HOLD", "COMPLETED"].map((st) => (
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
            onClick={fetchProjects}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-blue-600" />
            <p className="mt-2 text-xs">Loading projects portfolio...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            No active construction projects found.
          </div>
        ) : (
          projects.map((p) => (
            <div
              key={p.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[10px] font-bold text-blue-600 uppercase">
                      {p.projectCode}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mt-0.5">{p.name}</h3>
                  </div>
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      p.status === "COMPLETED"
                        ? "bg-emerald-50 text-emerald-700"
                        : p.status === "IN_PROGRESS"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {p.status}
                  </span>
                </div>

                <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span>{p.location}</span>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-600">Completion</span>
                    <span className="font-bold text-blue-600">{p.progressPercent}%</span>
                  </div>
                  <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all duration-500"
                      style={{ width: `${p.progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Budget and stakeholders */}
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-slate-50 p-2.5">
                    <span className="text-[10px] text-slate-400">Budget</span>
                    <p className="font-bold text-slate-900 mt-0.5">
                      {formatCompactCurrency(p.budget)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2.5">
                    <span className="text-[10px] text-slate-400">Client</span>
                    <p className="font-bold text-slate-900 truncate mt-0.5">
                      {p.customer?.name || "Direct Investor"}
                    </p>
                  </div>
                </div>

                <div className="mt-3 space-y-1 text-[11px] text-slate-500">
                  {p.vendor && (
                    <div className="flex items-center gap-1.5">
                      <Truck className="h-3 w-3 text-slate-400" />
                      <span className="font-medium text-slate-700">
                        Vendor: {p.vendor.companyName}
                      </span>
                    </div>
                  )}
                  {p.contractor && (
                    <div className="flex items-center gap-1.5">
                      <HardHat className="h-3 w-3 text-slate-400" />
                      <span className="font-medium text-slate-700">
                        Contractor: {p.contractor.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Started: {formatDate(p.startDate)}
                </span>
                <button
                  onClick={() => openProjectDetails(p.id)}
                  className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
                >
                  <span>Project Hub</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Project Detail Modal & Financial Hub */}
      {showDetailModal && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="font-mono text-xs font-bold text-blue-600">
                  {selectedProject.projectCode}
                </span>
                <h2 className="text-xl font-bold text-slate-900">{selectedProject.name}</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedProject.location} • {selectedProject.projectType}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowProgressModal(true)}
                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
                >
                  + Log Daily Work
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Financial Summary Strip */}
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                <span className="text-[11px] text-slate-500">Contract Budget</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">
                  {formatCurrency(selectedProject.financialSummary?.budget)}
                </p>
              </div>
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3">
                <span className="text-[11px] text-emerald-700 font-semibold">Total Cleared Income</span>
                <p className="font-bold text-emerald-700 text-sm mt-0.5">
                  {formatCurrency(selectedProject.financialSummary?.totalIncome)}
                </p>
              </div>
              <div className="rounded-xl border border-rose-100 bg-rose-50/40 p-3">
                <span className="text-[11px] text-rose-700 font-semibold">Total Expenses Incurred</span>
                <p className="font-bold text-rose-700 text-sm mt-0.5">
                  {formatCurrency(selectedProject.financialSummary?.totalExpense)}
                </p>
              </div>
              <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-3">
                <span className="text-[11px] text-blue-700 font-semibold">Project Net Profit</span>
                <p className="font-bold text-blue-700 text-sm mt-0.5">
                  {formatCurrency(selectedProject.financialSummary?.netProfit)}
                </p>
              </div>
            </div>

            {/* Daily Site Progress History */}
            <div className="mt-6">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Daily Work Progress Logs ({selectedProject.progressLogs?.length || 0})
              </h3>
              <div className="mt-3 space-y-3">
                {selectedProject.progressLogs?.length === 0 ? (
                  <p className="py-4 text-center text-xs text-slate-400">
                    No site work progress logged yet. Click "+ Log Daily Work" to add.
                  </p>
                ) : (
                  selectedProject.progressLogs?.map((log: any) => (
                    <div key={log.id} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{log.title}</span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {formatDate(log.date)} • {log.percentage}% Complete
                        </span>
                      </div>
                      <p className="text-slate-600 mt-1">{log.description}</p>
                      <div className="mt-2 flex items-center gap-4 text-[11px] text-slate-500">
                        <span>Reported by: {log.reportedBy || "Engineer"}</span>
                        <span>Workers: {log.labourCount}</span>
                        <span>Weather: {log.weather}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Log Daily Progress Modal */}
      {showProgressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">
              Record Daily Site Progress
            </h3>
            <p className="text-xs text-slate-500">
              Updates overall completion percentage and logs daily execution
            </p>

            <form onSubmit={handleAddProgress} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Milestone Title *</label>
                <input
                  type="text"
                  required
                  value={progressForm.title}
                  onChange={(e) => setProgressForm({ ...progressForm, title: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-blue-500 focus:outline-none"
                  placeholder="e.g. 8th Floor Deck Shuttering & Reinforcement"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Work Execution Description *</label>
                <textarea
                  rows={3}
                  required
                  value={progressForm.description}
                  onChange={(e) => setProgressForm({ ...progressForm, description: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-blue-500 focus:outline-none"
                  placeholder="Summary of concrete pouring, cube testing, steel placement..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Updated Overall %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={progressForm.percentage}
                    onChange={(e) => setProgressForm({ ...progressForm, percentage: parseInt(e.target.value) || 0 })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Labour Headcount</label>
                  <input
                    type="number"
                    value={progressForm.labourCount}
                    onChange={(e) => setProgressForm({ ...progressForm, labourCount: parseInt(e.target.value) || 0 })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setShowProgressModal(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  Submit Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-base font-bold text-slate-900">Launch New Construction Site</h2>
            <p className="text-xs text-slate-500">Initiate new project, assign stakeholders & contract budget</p>

            <form onSubmit={handleCreateProject} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Project Name *</label>
                <input
                  type="text"
                  required
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-blue-500 focus:outline-none"
                  placeholder="e.g. Skyline Luxury Towers - Wing B"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Site Location *</label>
                  <input
                    type="text"
                    required
                    value={newProject.location}
                    onChange={(e) => setNewProject({ ...newProject, location: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-blue-500 focus:outline-none"
                    placeholder="e.g. Bandra Kurla Complex"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Project Category</label>
                  <select
                    value={newProject.projectType}
                    onChange={(e) => setNewProject({ ...newProject, projectType: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Residential">Residential High-Rise</option>
                    <option value="Commercial">Commercial Office Complex</option>
                    <option value="Industrial">Industrial Warehouse / PEB</option>
                    <option value="Renovation">Turnkey Renovation</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Customer Client</label>
                  <select
                    value={newProject.customerId}
                    onChange={(e) => setNewProject({ ...newProject, customerId: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">-- Direct Developer / In-house --</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.phone})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Contract Budget (₹ INR) *</label>
                  <input
                    type="number"
                    required
                    value={newProject.budget}
                    onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-blue-500 focus:outline-none"
                    placeholder="e.g. 50000000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Assigned Vendor Partner</label>
                  <select
                    value={newProject.vendorId}
                    onChange={(e) => setNewProject({ ...newProject, vendorId: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">-- In-house Construction --</option>
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.companyName} ({v.specialization})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Assigned Contractor</label>
                  <select
                    value={newProject.contractorId}
                    onChange={(e) => setNewProject({ ...newProject, contractorId: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">-- Choose Contractor --</option>
                    {contractors.map((ct) => (
                      <option key={ct.id} value={ct.id}>
                        {ct.name} ({ct.specialization})
                      </option>
                    ))}
                  </select>
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
                  Launch Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
