"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  Building,
  Edit2,
  Trash2,
  Eye,
  CheckCircle,
  X,
  RefreshCw,
  FolderKanban,
  Receipt,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/formatters";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "Mumbai",
    state: "Maharashtra",
    projectType: "Residential",
    propertyLocation: "",
    budget: "",
    requirement: "",
    notes: "",
  });

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/customers?search=${encodeURIComponent(search)}`);
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingCustomer
        ? `/api/customers/${editingCustomer.id}`
        : "/api/customers";
      const method = editingCustomer ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowAddModal(false);
        setEditingCustomer(null);
        resetForm();
        fetchCustomers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm("Are you sure you want to deactivate this customer?")) return;
    try {
      const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
      if (res.ok) fetchCustomers();
    } catch (err) {
      console.error(err);
    }
  };

  const openEdit = (customer: any) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name || "",
      phone: customer.phone || "",
      email: customer.email || "",
      address: customer.address || "",
      city: customer.city || "Mumbai",
      state: customer.state || "Maharashtra",
      projectType: customer.projectType || "Residential",
      propertyLocation: customer.propertyLocation || "",
      budget: customer.budget?.toString() || "",
      requirement: customer.requirement || "",
      notes: customer.notes || "",
    });
    setShowAddModal(true);
  };

  const viewDetails = async (id: string) => {
    try {
      const res = await fetch(`/api/customers/${id}`);
      if (res.ok) {
        const fullCust = await res.json();
        setSelectedCustomer(fullCust);
        setShowDetailModal(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      address: "",
      city: "Mumbai",
      state: "Maharashtra",
      projectType: "Residential",
      propertyLocation: "",
      budget: "",
      requirement: "",
      notes: "",
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Customer Directory
          </h1>
          <p className="text-xs font-medium text-slate-500">
            Manage clients, property locations, requirements, and payment records
          </p>
        </div>
        <button
          onClick={() => {
            setEditingCustomer(null);
            resetForm();
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, phone, email, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
          />
        </div>
        <button
          onClick={fetchCustomers}
          className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Customer Records Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Client Name & Contact</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Project Type</th>
                <th className="py-3 px-4">Budget</th>
                <th className="py-3 px-4">Projects</th>
                <th className="py-3 px-4">Registered</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <RefreshCw className="mx-auto h-6 w-6 animate-spin text-blue-600" />
                    <p className="mt-2 text-xs">Loading customer records...</p>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No customers found matching search criteria.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{c.name}</div>
                      <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-slate-400" />
                          {c.phone}
                        </span>
                        {c.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-slate-400" />
                            {c.email}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-slate-700 font-medium">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        <span>{c.propertyLocation || c.city || "-"}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{c.state}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                        {c.projectType || "Residential"}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {formatCurrency(c.budget)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                        {c.projects?.length || 0} active
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {formatDate(c.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          c.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => viewDetails(c.id)}
                          title="View Details"
                          className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-blue-600"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEdit(c)}
                          title="Edit Customer"
                          className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-emerald-600"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeactivate(c.id)}
                          title="Deactivate Customer"
                          className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-rose-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">
                {editingCustomer ? "Edit Customer Record" : "Add New Customer"}
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                    placeholder="e.g. Rajesh Singhania"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                    placeholder="name@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Project Type
                  </label>
                  <select
                    value={formData.projectType}
                    onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Residential">Residential Villa / High-Rise</option>
                    <option value="Commercial">Commercial / Office Complex</option>
                    <option value="Industrial">Industrial Warehouse / PEB</option>
                    <option value="Renovation">Turnkey Fitout & Renovation</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Property Location
                  </label>
                  <input
                    type="text"
                    value={formData.propertyLocation}
                    onChange={(e) => setFormData({ ...formData, propertyLocation: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                    placeholder="e.g. Worli Sea Face, Mumbai"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Budget (₹ INR)
                  </label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                    placeholder="e.g. 45000000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Requirement Description
                </label>
                <textarea
                  rows={3}
                  value={formData.requirement}
                  onChange={(e) => setFormData({ ...formData, requirement: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                  placeholder="Details of architectural requirement, plot area, structural specs..."
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
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
                  {editingCustomer ? "Save Changes" : "Create Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Details Drawer / Modal */}
      {showDetailModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {selectedCustomer.name}
                </h2>
                <p className="text-xs text-slate-500">
                  Customer ID: {selectedCustomer.id}
                </p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
              <div className="rounded-lg bg-slate-50 p-3">
                <span className="text-[11px] text-slate-400">Contact Details</span>
                <p className="font-semibold text-slate-800 mt-1">{selectedCustomer.phone}</p>
                <p className="text-slate-600">{selectedCustomer.email || "No email"}</p>
                <p className="text-slate-500 mt-1">{selectedCustomer.address}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <span className="text-[11px] text-slate-400">Project Preference</span>
                <p className="font-semibold text-slate-800 mt-1">
                  {selectedCustomer.projectType} • {selectedCustomer.propertyLocation}
                </p>
                <p className="font-bold text-emerald-600 mt-1">
                  Budget: {formatCurrency(selectedCustomer.budget)}
                </p>
              </div>
            </div>

            {/* Customer Projects */}
            <div className="mt-6">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <FolderKanban className="h-4 w-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-800">
                  Project History ({selectedCustomer.projects?.length || 0})
                </h3>
              </div>
              <div className="mt-2 divide-y divide-slate-100 text-xs">
                {selectedCustomer.projects?.length === 0 ? (
                  <p className="py-2 text-slate-400">No active projects assigned yet.</p>
                ) : (
                  selectedCustomer.projects?.map((p: any) => (
                    <div key={p.id} className="py-2 flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-slate-800">{p.name}</span>
                        <span className="ml-2 font-mono text-[10px] text-slate-400">
                          {p.projectCode}
                        </span>
                        <p className="text-[11px] text-slate-500">
                          Vendor: {p.vendor?.companyName || "BuildMaster In-house"}
                        </p>
                      </div>
                      <span className="rounded bg-blue-50 px-2 py-0.5 font-bold text-blue-700">
                        {p.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Customer Payment History */}
            <div className="mt-6">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <Receipt className="h-4 w-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-800">
                  Payment History ({selectedCustomer.transactions?.length || 0})
                </h3>
              </div>
              <div className="mt-2 divide-y divide-slate-100 text-xs">
                {selectedCustomer.transactions?.length === 0 ? (
                  <p className="py-2 text-slate-400">No payment transactions recorded.</p>
                ) : (
                  selectedCustomer.transactions?.map((t: any) => (
                    <div key={t.id} className="py-2 flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-slate-800">
                          {t.transactionNumber}
                        </span>
                        <p className="text-[11px] text-slate-500">
                          {t.description} • {formatDate(t.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-emerald-600">
                          + {formatCurrency(t.amount)}
                        </span>
                        <p className="text-[10px] uppercase font-bold text-slate-400">
                          {t.paymentMethod}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
