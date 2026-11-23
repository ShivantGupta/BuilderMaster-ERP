"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Compass,
  HardHat,
  Truck,
  Building2,
  Receipt,
  TrendingUp,
  CreditCard,
  Boxes,
  UserCheck,
  BarChart3,
  Bell,
  Settings,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  LogOut,
} from "lucide-react";

interface SidebarProps {
  user?: any;
  onLogout?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ user, onLogout, isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Customers", href: "/admin/customers", icon: Users },
    { name: "Leads CRM", href: "/admin/leads", icon: Compass, badge: "Auto-Match" },
    { name: "Vendors", href: "/admin/vendors", icon: Truck },
    { name: "Contractors", href: "/admin/contractors", icon: HardHat },
    { name: "Projects", href: "/admin/projects", icon: Building2 },
    { name: "Daily Transactions", href: "/admin/daily-transactions", icon: Receipt },
    { name: "Expenses", href: "/admin/expenses", icon: CreditCard },
    { name: "Materials & Stock", href: "/admin/materials", icon: Boxes },
    { name: "Employees & HR", href: "/admin/employees", icon: UserCheck },
    { name: "Reports & Analytics", href: "/admin/reports", icon: BarChart3 },
    { name: "Notifications", href: "/admin/notifications", icon: Bell },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm transition-opacity lg:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-slate-900 text-slate-200 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-6">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white">
                BUILD<span className="text-blue-400">MASTER</span>
              </span>
              <span className="block text-[10px] font-medium uppercase tracking-widest text-slate-400">
                ERP Enterprise
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Operations & Management
          </div>
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={`group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-400 group-hover:text-blue-400"}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="rounded-full bg-orange-500/20 px-2 py-0.5 text-[10px] font-bold text-orange-300">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Portals & Shortcuts
          </div>
          <div className="space-y-1">
            <Link
              href="/vendor"
              className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            >
              <span className="flex items-center gap-2.5">
                <Truck className="h-3.5 w-3.5 text-orange-400" />
                Vendor Portal View
              </span>
              <ChevronRight className="h-3 w-3" />
            </Link>
            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            >
              <span className="flex items-center gap-2.5">
                <ExternalLink className="h-3.5 w-3.5 text-emerald-400" />
                Public Website
              </span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Current User & Logout */}
        <div className="border-t border-slate-800 p-4">
          <div className="flex items-center gap-3 rounded-lg bg-slate-800/60 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : "AD"}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-xs font-semibold text-white">{user?.name || "Vikramaditya S."}</p>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-3 w-3 text-emerald-400" />
                <span className="truncate text-[11px] font-medium text-slate-400">
                  {user?.role || "SUPER_ADMIN"}
                </span>
              </div>
            </div>
            <button
              onClick={onLogout}
              title="Logout"
              className="rounded p-1 text-slate-400 hover:bg-slate-700 hover:text-rose-400"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
