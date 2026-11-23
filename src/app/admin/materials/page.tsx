"use client";

import { useState, useEffect } from "react";
import {
  Boxes,
  Search,
  Plus,
  AlertTriangle,
  MinusCircle,
  RefreshCw,
  Building2,
  X,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/formatters";

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showConsumeModal, setShowConsumeModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "Raw Material",
    unit: "Bags",
    currentStock: "1000",
    minStockLevel: "100",
    unitPrice: "400",
  });

  const [consumeData, setConsumeData] = useState({
    projectId: "",
    quantity: "",
    notes: "",
  });

  useEffect(() => {
    fetchMaterials();
    fetchProjects();
  }, []);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/materials");
      if (res.ok) {
        const data = await res.json();
        setMaterials(data.materials || []);
        setLowStockCount(data.lowStockCount || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      if (res.ok) setProjects(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowAddModal(false);
        fetchMaterials();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleConsume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaterial) return;

    try {
      const res = await fetch("/api/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CONSUME",
          materialId: selectedMaterial.id,
          ...consumeData,
        }),
      });

      if (res.ok) {
        setShowConsumeModal(false);
        fetchMaterials();
      } else {
        const err = await res.json();
        alert(err.error);
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
            Construction Material & Stock Inventory
          </h1>
          <p className="text-xs font-medium text-slate-500">
            Live warehouse stock, reorder levels, unit rates, and site consumption disbursements
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>Add Material Item</span>
        </button>
      </div>

      {lowStockCount > 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <span>
            <strong>Inventory Alert:</strong> {lowStockCount} materials are at or below minimum reorder thresholds.
          </span>
        </div>
      )}

      {/* Materials Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-blue-600" />
            <p className="mt-2 text-xs">Loading warehouse inventory...</p>
          </div>
        ) : (
          materials.map((m) => {
            const isLowStock = m.currentStock <= m.minStockLevel;
            return (
              <div
                key={m.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400">
                        {m.category}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm mt-0.5">{m.name}</h3>
                    </div>
                    {isLowStock && (
                      <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[9px] font-bold text-rose-600">
                        Low Stock
                      </span>
                    )}
                  </div>

                  <div className="mt-4 rounded-lg bg-slate-50 p-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-bold text-slate-900">
                        {m.currentStock}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">{m.unit}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Min Level: {m.minStockLevel} {m.unit}</span>
                      <span className="font-bold text-slate-700">
                        {formatCurrency(m.unitPrice)} / {m.unit}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Value: {formatCurrency(m.currentStock * m.unitPrice)}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedMaterial(m);
                      setConsumeData({ projectId: projects[0]?.id || "", quantity: "", notes: "" });
                      setShowConsumeModal(true);
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
                  >
                    <MinusCircle className="h-3.5 w-3.5" />
                    <span>Disburse to Site</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Disburse / Consume Modal */}
      {showConsumeModal && selectedMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-base font-bold text-slate-900">
              Disburse {selectedMaterial.name}
            </h2>
            <p className="text-xs text-slate-500">
              Available Stock: {selectedMaterial.currentStock} {selectedMaterial.unit}
            </p>

            <form onSubmit={handleConsume} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Target Project Site *</label>
                <select
                  required
                  value={consumeData.projectId}
                  onChange={(e) => setConsumeData({ ...consumeData, projectId: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-blue-500 focus:outline-none"
                >
                  <option value="">-- Choose Project Site --</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.projectCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Quantity ({selectedMaterial.unit}) *
                </label>
                <input
                  type="number"
                  required
                  min="0.1"
                  max={selectedMaterial.currentStock}
                  step="any"
                  value={consumeData.quantity}
                  onChange={(e) => setConsumeData({ ...consumeData, quantity: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-blue-500 focus:outline-none font-bold"
                  placeholder={`Max: ${selectedMaterial.currentStock}`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Execution Purpose</label>
                <input
                  type="text"
                  value={consumeData.notes}
                  onChange={(e) => setConsumeData({ ...consumeData, notes: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-blue-500 focus:outline-none"
                  placeholder="e.g. 5th Floor Slab Casting"
                />
              </div>

              <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setShowConsumeModal(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  Confirm Disbursement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Material Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-base font-bold text-slate-900">Add Warehouse Material Item</h2>
            <p className="text-xs text-slate-500">Configure new inventory SKU and alert threshold</p>

            <form onSubmit={handleCreateMaterial} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Material Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-blue-500 focus:outline-none"
                  placeholder="e.g. UltraTech 53 Grade Cement"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Raw Material">Raw Material</option>
                    <option value="Structural">Structural Steel</option>
                    <option value="Finishing">Finishing & Masonry</option>
                    <option value="Electrical">Electrical & MEP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Unit of Measure *</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Bags">Bags (Cement)</option>
                    <option value="Metric Ton">Metric Ton (Steel)</option>
                    <option value="Cu.Ft">Cu.Ft (Sand / Aggregate)</option>
                    <option value="Pcs">Pcs (Bricks / Blocks)</option>
                    <option value="Liters">Liters (Paint / Chemical)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Stock</label>
                  <input
                    type="number"
                    value={formData.currentStock}
                    onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Min Alert</label>
                  <input
                    type="number"
                    value={formData.minStockLevel}
                    onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Rate (₹)</label>
                  <input
                    type="number"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-blue-500 focus:outline-none"
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
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
