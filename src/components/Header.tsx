"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  Bell,
  Search,
  Plus,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  User,
  LogOut,
  ChevronDown,
} from "lucide-react";

interface HeaderProps {
  onToggleSidebar: () => void;
  user?: any;
  onRefresh?: () => void;
}

export default function Header({ onToggleSidebar, user, onRefresh }: HeaderProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "MARK_ALL_READ" }),
      });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const handleSwitchRole = async (email: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: "admin123" }),
      });
      if (res.ok) {
        setShowUserMenu(false);
        if (email.includes("vendor")) {
          router.push("/vendor");
        } else {
          router.push("/admin");
        }
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-sm sm:px-6">
      {/* Left side: Hamburger + Search */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Toggle Sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="relative hidden w-72 sm:block md:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects, customers, leads, transactions..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Right side: Actions, Notifications, Role Switcher, Profile */}
      <div className="flex items-center gap-3">
        {/* Quick Deposit/Withdrawal Shortcut */}
        <Link
          href="/admin/daily-transactions"
          className="hidden items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 sm:flex"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Transaction</span>
        </Link>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 focus:outline-none"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-xl sm:w-96 z-50">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-800">
                  Notifications ({unreadCount} new)
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-medium text-blue-600 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="mt-2 max-h-72 space-y-2 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="py-4 text-center text-xs text-slate-400">No notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`rounded-lg p-2.5 text-xs transition-colors ${
                        n.read ? "bg-slate-50 text-slate-600" : "bg-blue-50/60 text-slate-800 font-medium"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900">{n.title}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="mt-0.5 text-slate-600 text-[11px]">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Menu & Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : "SA"}
            </div>
            <span className="hidden font-semibold sm:inline">{user?.name || "Super Admin"}</span>
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
              {user?.role || "SUPER_ADMIN"}
            </span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-800">{user?.name || "Vikramaditya S."}</p>
                <p className="text-[11px] text-slate-500">{user?.email || "admin@buildmaster.com"}</p>
              </div>

              {/* Fast Demo Role Switcher for instant testing */}
              <div className="py-2 border-b border-slate-100">
                <span className="block px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Switch Role (Evaluation)
                </span>
                <div className="mt-1 space-y-0.5">
                  <button
                    onClick={() => handleSwitchRole("admin@buildmaster.com")}
                    className="flex w-full items-center justify-between rounded px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100"
                  >
                    <span>Super Admin</span>
                    <span className="text-[10px] text-blue-600 font-semibold">Full Access</span>
                  </button>
                  <button
                    onClick={() => handleSwitchRole("accountant@buildmaster.com")}
                    className="flex w-full items-center justify-between rounded px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100"
                  >
                    <span>Accountant</span>
                    <span className="text-[10px] text-emerald-600 font-semibold">Cash & P&L</span>
                  </button>
                  <button
                    onClick={() => handleSwitchRole("manager@buildmaster.com")}
                    className="flex w-full items-center justify-between rounded px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100"
                  >
                    <span>Site Manager</span>
                    <span className="text-[10px] text-indigo-600 font-semibold">Projects</span>
                  </button>
                  <button
                    onClick={() => handleSwitchRole("apex@vendor.com")}
                    className="flex w-full items-center justify-between rounded px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100"
                  >
                    <span>Apex Vendor</span>
                    <span className="text-[10px] text-orange-600 font-semibold">Vendor Portal</span>
                  </button>
                </div>
              </div>

              <div className="pt-1">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
