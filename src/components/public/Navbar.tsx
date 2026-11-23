"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, Menu, X, ArrowRight, ShieldCheck, Phone } from "lucide-react";

export default function PublicNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-slate-900">
              BUILD<span className="text-blue-600">MASTER</span>
            </span>
            <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Infrastructure & Construction
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <Link href="/" className="hover:text-blue-600 transition">
            Home
          </Link>
          <Link href="/about" className="hover:text-blue-600 transition">
            About Us
          </Link>
          <Link href="/services" className="hover:text-blue-600 transition">
            Services
          </Link>
          <Link href="/projects" className="hover:text-blue-600 transition">
            Our Projects
          </Link>
          <Link href="/contact" className="hover:text-blue-600 transition">
            Contact
          </Link>
          <Link href="/vendor-register" className="text-orange-600 hover:text-orange-700 transition">
            Partner With Us
          </Link>
        </div>

        {/* Action CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/inquiry"
            className="rounded-lg bg-orange-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-orange-700 transition"
          >
            Get a Quote
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition"
          >
            <span>ERP Portal</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg p-2 text-slate-700 md:hidden"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="border-b border-slate-200 bg-white p-6 space-y-4 md:hidden">
          <div className="flex flex-col space-y-3 text-sm font-semibold text-slate-700">
            <Link href="/" onClick={() => setMobileOpen(false)}>Home</Link>
            <Link href="/about" onClick={() => setMobileOpen(false)}>About Us</Link>
            <Link href="/services" onClick={() => setMobileOpen(false)}>Services</Link>
            <Link href="/projects" onClick={() => setMobileOpen(false)}>Our Projects</Link>
            <Link href="/contact" onClick={() => setMobileOpen(false)}>Contact</Link>
            <Link href="/vendor-register" onClick={() => setMobileOpen(false)}>Vendor Registration</Link>
          </div>
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
            <Link
              href="/inquiry"
              onClick={() => setMobileOpen(false)}
              className="text-center rounded-lg bg-orange-600 py-2.5 text-xs font-bold text-white"
            >
              Get a Free Quote
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="text-center rounded-lg bg-slate-900 py-2.5 text-xs font-bold text-white"
            >
              ERP Staff Portal
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
