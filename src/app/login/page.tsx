"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Lock,
  Mail,
  Shield,
  ArrowRight,
  CheckCircle2,
  HardHat,
  Truck,
  Wallet,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@buildmaster.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        if (data.user?.role === "VENDOR") {
          router.push("/vendor");
        } else {
          router.push("/admin");
        }
      } else {
        setError(data.error || "Authentication failed");
      }
    } catch (err: any) {
      setError("Network or server connection failed");
    } finally {
      setLoading(false);
    }
  };

  const setDemoRole = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword("admin123");
    setError("");
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-slate-900 py-12 sm:px-6 lg:px-8 text-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
            <Building2 className="h-7 w-7" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            BUILD<span className="text-blue-400">MASTER</span>
          </span>
        </Link>
        <h2 className="mt-4 text-xl font-bold tracking-tight text-white">
          Enterprise Construction ERP Portal
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Sign in with your role-authorized credentials
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-8 shadow-2xl backdrop-blur-md">
          {error && (
            <div className="mb-4 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs font-semibold text-rose-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300">
                Email Address
              </label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2.5 pl-9 pr-4 text-xs font-medium text-white placeholder-slate-500 focus:border-blue-500 focus:bg-slate-900/90 focus:outline-none"
                  placeholder="name@buildmaster.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-300">
                  Password
                </label>
                <span className="text-[11px] text-blue-400 hover:underline cursor-pointer">
                  Default: admin123
                </span>
              </div>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2.5 pl-9 pr-4 text-xs font-medium text-white placeholder-slate-500 focus:border-blue-500 focus:bg-slate-900/90 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-500 transition-colors disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Sign In to ERP Portal"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Quick Demo Switcher Buttons */}
          <div className="mt-6 border-t border-slate-800/80 pt-5">
            <span className="block text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Instant Demo Role Switcher
            </span>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setDemoRole("admin@buildmaster.com")}
                className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 p-2 text-left hover:bg-slate-800 hover:text-white text-slate-300 transition"
              >
                <Shield className="h-3.5 w-3.5 text-blue-400" />
                <span className="font-semibold text-[11px]">Super Admin</span>
              </button>

              <button
                type="button"
                onClick={() => setDemoRole("accountant@buildmaster.com")}
                className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 p-2 text-left hover:bg-slate-800 hover:text-white text-slate-300 transition"
              >
                <Wallet className="h-3.5 w-3.5 text-emerald-400" />
                <span className="font-semibold text-[11px]">Accountant</span>
              </button>

              <button
                type="button"
                onClick={() => setDemoRole("manager@buildmaster.com")}
                className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 p-2 text-left hover:bg-slate-800 hover:text-white text-slate-300 transition"
              >
                <Building2 className="h-3.5 w-3.5 text-indigo-400" />
                <span className="font-semibold text-[11px]">Site Manager</span>
              </button>

              <button
                type="button"
                onClick={() => setDemoRole("apex@vendor.com")}
                className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 p-2 text-left hover:bg-slate-800 hover:text-white text-slate-300 transition"
              >
                <Truck className="h-3.5 w-3.5 text-orange-400" />
                <span className="font-semibold text-[11px]">Apex Vendor</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-300 underline">
            ← Return to Public Website
          </Link>
        </div>
      </div>
    </div>
  );
}
