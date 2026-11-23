"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Shield,
  Zap,
  Save,
  CheckCircle,
  Clock,
  History,
  DollarSign,
  Building,
  RefreshCw,
} from "lucide-react";
import { formatDateTime } from "@/lib/formatters";

export default function SettingsPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  // Editable settings map
  const [config, setConfig] = useState({
    AUTO_LEAD_ASSIGNMENT: "true",
    LEAD_EXPIRY_HOURS: "24",
    HIGH_VALUE_THRESHOLD: "50000",
    CURRENCY_SYMBOL: "₹",
    COMPANY_NAME: "BuildMaster Construction & Infrastructure Corp",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings || []);
        setAuditLogs(data.auditLogs || []);

        const map: any = { ...config };
        (data.settings || []).forEach((s: any) => {
          map[s.key] = s.value;
        });
        setConfig(map);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = Object.entries(config).map(([key, value]) => ({ key, value }));
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        fetchSettings();
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
            System Settings & Security Audit Trail
          </h1>
          <p className="text-xs font-medium text-slate-500">
            Configure automated CRM lead assignment rules, high-value financial thresholds, and view tamper-evident audit logs
          </p>
        </div>
      </div>

      {saved && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800">
          <CheckCircle className="h-4 w-4 text-emerald-600" />
          <span>System configuration updated and logged to audit trail!</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Zap className="h-5 w-5 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Automated CRM Lead Distribution Rules
            </h2>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Automatic Lead Matching Engine
              </label>
              <select
                value={config.AUTO_LEAD_ASSIGNMENT}
                onChange={(e) => setConfig({ ...config, AUTO_LEAD_ASSIGNMENT: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-blue-500 focus:outline-none"
              >
                <option value="true">Enabled (Auto-match on inquiry submit)</option>
                <option value="false">Disabled (Manual assignment only)</option>
              </select>
              <p className="mt-1 text-[11px] text-slate-400">
                Matches leads based on vendor location, specialization, priority tier, and active workload.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Lead Response Window (Hours)
              </label>
              <input
                type="number"
                value={config.LEAD_EXPIRY_HOURS}
                onChange={(e) => setConfig({ ...config, LEAD_EXPIRY_HOURS: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-blue-500 focus:outline-none"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Time allotted for partner vendor to accept or reject before lead is recycled for reassignment.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <DollarSign className="h-5 w-5 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Financial Compliance & Authorization Thresholds
            </h2>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                High-Value Transaction Approval Threshold (₹ INR)
              </label>
              <input
                type="number"
                value={config.HIGH_VALUE_THRESHOLD}
                onChange={(e) => setConfig({ ...config, HIGH_VALUE_THRESHOLD: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs font-bold focus:border-blue-500 focus:outline-none"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Transactions at or exceeding this value require Super Admin authorization before affecting balances.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Enterprise Entity Legal Name
              </label>
              <input
                type="text"
                value={config.COMPANY_NAME}
                onChange={(e) => setConfig({ ...config, COMPANY_NAME: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              <Save className="h-4 w-4" />
              <span>Save System Settings</span>
            </button>
          </div>
        </div>
      </form>

      {/* System Audit Log Trail */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-slate-700" />
            <h2 className="text-sm font-bold text-slate-900">
              Enterprise Security Audit Log Trail
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Immutable Historical Log
          </span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="p-2.5">Timestamp</th>
                <th className="p-2.5">User</th>
                <th className="p-2.5">Action</th>
                <th className="p-2.5">Entity</th>
                <th className="p-2.5">Audit Narration</th>
                <th className="p-2.5">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    No audit records logged yet.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-mono text-[11px] text-slate-500">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="p-2.5 font-semibold text-slate-800">
                      {log.user?.name || "System Automated"}
                      {log.user && (
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {log.user.role}
                        </span>
                      )}
                    </td>
                    <td className="p-2.5">
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono font-bold text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-2.5 text-slate-600 font-mono text-[11px]">{log.entity}</td>
                    <td className="p-2.5 max-w-sm text-slate-700">{log.details}</td>
                    <td className="p-2.5 font-mono text-slate-400 text-[10px]">{log.ipAddress}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
