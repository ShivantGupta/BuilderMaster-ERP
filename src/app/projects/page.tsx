"use client";

import { useState } from "react";
import Link from "next/link";
import PublicNavbar from "@/components/public/Navbar";
import PublicFooter from "@/components/public/Footer";
import { Building2, MapPin, Calendar, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

export default function PublicProjectsPage() {
  const [filter, setFilter] = useState("ALL");

  const portfolio = [
    {
      title: "Skyline Luxury Towers - Wing A",
      category: "Residential",
      location: "Worli Sea Face, Mumbai",
      budget: 45000000,
      completion: "December 2026",
      status: "Under Construction (48% Complete)",
      description: "G+14 ultra-luxury residential high-rise with earthquake-resistant RCC frame, triple-height grand lobby, and panoramic sea views.",
    },
    {
      title: "Apex Industrial Logistics Park",
      category: "Industrial",
      location: "Panvel Logistics Corridor, Navi Mumbai",
      budget: 28000000,
      completion: "September 2026",
      status: "In Progress (72% Complete)",
      description: "Pre-Engineered Heavy Steel Shed with 12m clear height, 8 loading docks with hydraulic levelers, and FM2 heavy duty laser-screeded flooring.",
    },
    {
      title: "Green Valley Premium Executive Villas",
      category: "Residential",
      location: "Baner Hills Road, Pune",
      budget: 82000000,
      completion: "March 2027",
      status: "Commenced (20% Complete)",
      description: "Gated enclave of 12 bespoke architectural villas featuring private infinity pools, rooftop solar arrays, and automated smart-home HVAC systems.",
    },
    {
      title: "Palm Grove Corporate Suites",
      category: "Commercial",
      location: "Bandra Kurla Complex, Mumbai",
      budget: 55000000,
      completion: "Completed (2025)",
      status: "Successfully Delivered",
      description: "Grade-A 8-story commercial headquarters development featuring double-glazed acoustic structural façade and high-efficiency VRV air conditioning.",
    },
    {
      title: "Metro Logistics Center - Phase 2",
      category: "Industrial",
      location: "Bhiwandi Warehousing Zone, Thane",
      budget: 34000000,
      completion: "Completed (2025)",
      status: "Successfully Delivered",
      description: "160,000 sq.ft state-of-the-art e-commerce distribution hub with automated sprinkler protection and heavy asphalt trailer parking yard.",
    },
  ];

  const filtered = filter === "ALL" ? portfolio : portfolio.filter((p) => p.category === filter);

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicNavbar />

      <section className="bg-slate-950 py-20 text-white text-center">
        <div className="mx-auto max-w-4xl px-6 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
            Portfolio Showcase
          </span>
          <h1 className="text-3xl font-extrabold sm:text-5xl">
            Our Landmark Construction Projects
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto">
            Discover our portfolio of residential luxury landmarks, commercial corporate hubs, and industrial pre-engineered structures.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          {/* Filter Pills */}
          <div className="flex justify-center gap-2 mb-10">
            {["ALL", "Residential", "Commercial", "Industrial"].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                  filter === cat
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700">
                      {item.category}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {item.status}
                    </span>
                  </div>

                  <h3 className="mt-3 text-base font-bold text-slate-900 leading-snug">
                    {item.title}
                  </h3>

                  <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span>{item.location}</span>
                  </div>

                  <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400">Contract Value</span>
                    <p className="font-bold text-slate-900">{formatCurrency(item.budget)}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400">Target Handover</span>
                    <p className="font-semibold text-slate-700">{item.completion}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center rounded-2xl bg-slate-900 p-8 text-white">
            <h3 className="text-xl font-bold">Have a Plot or Infrastructure Project in Mind?</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-lg mx-auto">
              Our engineering advisory team provides complimentary feasibility assessment, preliminary structural estimates, and timeline projections.
            </p>
            <div className="mt-4">
              <Link
                href="/inquiry"
                className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-3 text-xs font-bold text-white hover:bg-orange-500 transition"
              >
                <span>Request Project Proposal</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
