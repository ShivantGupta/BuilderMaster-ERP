"use client";

import { useState } from "react";
import Link from "next/link";
import PublicNavbar from "@/components/public/Navbar";
import PublicFooter from "@/components/public/Footer";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicNavbar />

      <section className="bg-slate-950 py-20 text-white text-center">
        <div className="mx-auto max-w-4xl px-6 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
            Get In Touch
          </span>
          <h1 className="text-3xl font-extrabold sm:text-5xl">
            Contact Our Engineering Headquarters
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Reach out to our project directors, architectural consultants, or vendor relations team.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6 grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Office Details */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">
              Corporate Headquarters & Regional Offices
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Our central operations hub manages engineering design, BIM modeling, vendor qualification, and financial audits across all active regional sites.
            </p>

            <div className="space-y-4 pt-2 text-xs">
              <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
                <MapPin className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Mumbai Headquarters</h3>
                  <p className="text-slate-600 mt-1">
                    Level 14, Worli Horizon Tower, Dr. Annie Besant Road, Worli, Mumbai, Maharashtra 400018
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
                <Phone className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Direct Phone & WhatsApp</h3>
                  <p className="text-slate-600 mt-1">
                    Board: +91 98765 43210 / Site Ops: 022-49112233
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
                <Mail className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Department Inquiries</h3>
                  <p className="text-slate-600 mt-1">
                    General: contact@buildmaster.com • Tenders: tenders@buildmaster.com
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Message Form */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            {submitted ? (
              <div className="text-center py-12 space-y-3">
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
                <h3 className="text-xl font-bold text-slate-900">Message Received!</h3>
                <p className="text-xs text-slate-600">
                  Our regional project engineer will review your note and respond within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-base font-bold text-slate-900">Send an Advisory Note</h3>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-blue-500 focus:outline-none"
                    placeholder="Your name"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-blue-500 focus:outline-none"
                      placeholder="name@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Phone *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-blue-500 focus:outline-none"
                      placeholder="+91 98000 00000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Subject</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-blue-500 focus:outline-none"
                    placeholder="e.g. Turnkey Villa Construction Proposal"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Message *</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-blue-500 focus:outline-none"
                    placeholder="Describe your inquiry..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition"
                >
                  Send Inquiry Note
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
