"use client";

import { useState } from "react";
import Link from "next/link";
import PublicNavbar from "@/components/public/Navbar";
import PublicFooter from "@/components/public/Footer";
import {
  Compass,
  CheckCircle2,
  Building2,
  Phone,
  Mail,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

export default function CustomerInquiryPage() {
  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    email: "",
    projectLocation: "Mumbai",
    constructionType: "Residential",
    budget: "25000000",
    plotSize: "5,000 sq.ft",
    requirement: "",
    preferredContactTime: "Morning 10 AM - 12 PM",
    address: "",
    city: "Mumbai",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/public/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        alert(data.error || "Failed to submit inquiry");
      }
    } catch (err) {
      console.error(err);
      alert("Network error submitting inquiry");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicNavbar />

      <div className="py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
              <Compass className="h-3.5 w-3.5" />
              <span>Direct Customer Inquiry & Automated Vendor Match</span>
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Request a Construction Quotation
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              Submit your property details below. BuildMaster's algorithmic CRM will generate your unique Lead ID and auto-match the highest-rated approved vendor partner in your territory.
            </p>
          </div>

          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
            {result ? (
              <div className="text-center py-8 space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Inquiry Successfully Registered!
                </h2>
                <div className="inline-block rounded-xl bg-slate-100 px-4 py-2 font-mono text-sm font-bold text-blue-600">
                  Lead Reference ID: {result.leadNumber}
                </div>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  {result.message}
                </p>

                {result.assignment?.assigned && (
                  <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-xs text-left max-w-md mx-auto space-y-1">
                    <span className="font-bold text-blue-900 flex items-center gap-1.5">
                      <Zap className="h-4 w-4 text-blue-600" /> Auto-Assigned Vendor Partner:
                    </span>
                    <p className="font-bold text-slate-900 text-sm">
                      {result.assignment.vendorName}
                    </p>
                    <p className="text-slate-600">
                      Match score: {result.assignment.score} points • Match criteria: Location & Category
                    </p>
                  </div>
                )}

                <div className="pt-4 flex justify-center gap-3">
                  <button
                    onClick={() => setResult(null)}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Submit Another Inquiry
                  </button>
                  <Link
                    href="/login"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    Staff & Vendor Login →
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs focus:border-blue-500 focus:outline-none"
                      placeholder="e.g. Anand Mahindra"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Mobile Number (WhatsApp Enabled) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs focus:border-blue-500 focus:outline-none"
                      placeholder="+91 98200 12345"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs focus:border-blue-500 focus:outline-none"
                      placeholder="name@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Project Location / City *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.projectLocation}
                      onChange={(e) => setFormData({ ...formData, projectLocation: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs focus:border-blue-500 focus:outline-none"
                      placeholder="e.g. Mumbai, Pune, Navi Mumbai"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Construction Type *
                    </label>
                    <select
                      value={formData.constructionType}
                      onChange={(e) => setFormData({ ...formData, constructionType: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs focus:border-blue-500 focus:outline-none"
                    >
                      <option value="Residential">Residential Villa / High-Rise</option>
                      <option value="Commercial">Commercial Office / Showroom</option>
                      <option value="Industrial">Industrial Warehouse / PEB</option>
                      <option value="Renovation">Turnkey Interior Renovation</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Estimated Budget (₹ INR) *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs font-bold focus:border-blue-500 focus:outline-none"
                      placeholder="e.g. 25000000"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Plot / Built-up Area
                    </label>
                    <input
                      type="text"
                      value={formData.plotSize}
                      onChange={(e) => setFormData({ ...formData, plotSize: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs focus:border-blue-500 focus:outline-none"
                      placeholder="e.g. 5,000 sq.ft"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Requirement & Architectural Specifications
                  </label>
                  <textarea
                    rows={3}
                    value={formData.requirement}
                    onChange={(e) => setFormData({ ...formData, requirement: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs focus:border-blue-500 focus:outline-none"
                    placeholder="Describe number of floors, soil condition, preferred finishes, timeline expectations..."
                  />
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Preferred Contact Time Window
                    </label>
                    <select
                      value={formData.preferredContactTime}
                      onChange={(e) => setFormData({ ...formData, preferredContactTime: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs focus:border-blue-500 focus:outline-none"
                    >
                      <option value="Morning 10 AM - 12 PM">Morning 10 AM - 12 PM</option>
                      <option value="Afternoon 1 PM - 4 PM">Afternoon 1 PM - 4 PM</option>
                      <option value="Evening 4 PM - 7 PM">Evening 4 PM - 7 PM</option>
                      <option value="Anytime">Anytime during business hours</option>
                    </select>
                  </div>
                  <div className="flex items-center text-xs text-slate-500 pt-5">
                    <ShieldCheck className="h-5 w-5 text-emerald-600 mr-2 shrink-0" />
                    <span>Your privacy is protected. Contact details are strictly distributed only to the designated authorized partner vendor.</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-xl bg-orange-600 px-8 py-3.5 text-xs font-bold text-white shadow-lg shadow-orange-600/30 hover:bg-orange-500 transition-colors disabled:opacity-50"
                  >
                    {loading ? "Generating Lead & Matching..." : "Submit Inquiry & Trigger Auto-Match"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
