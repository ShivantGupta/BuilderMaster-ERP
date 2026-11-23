import PublicNavbar from "@/components/public/Navbar";
import PublicFooter from "@/components/public/Footer";
import { Building2, Award, ShieldCheck, CheckCircle2, Users, HardHat } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      <section className="bg-slate-950 py-20 text-white text-center">
        <div className="mx-auto max-w-4xl px-6 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
            About BuildMaster Corporation
          </span>
          <h1 className="text-3xl font-extrabold sm:text-5xl">
            Shaping Modern Skylines & Industrial Infrastructure
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Founded with a vision to eliminate cost overruns, delays, and opacity in construction through disciplined engineering execution and integrated digital ERP workflows.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-5xl px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="rounded-2xl border border-slate-200 p-6 bg-slate-50/50">
              <Award className="mx-auto h-10 w-10 text-blue-600" />
              <h3 className="font-bold text-slate-900 mt-3 text-base">IS 456 Structural Rigor</h3>
              <p className="text-xs text-slate-500 mt-1">
                Every concrete pour undergoes 7-day and 28-day cube compression testing in NABL certified labs.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-6 bg-slate-50/50">
              <ShieldCheck className="mx-auto h-10 w-10 text-emerald-600" />
              <h3 className="font-bold text-slate-900 mt-3 text-base">Real-Time Financial Audit</h3>
              <p className="text-xs text-slate-500 mt-1">
                No hidden costs. Clients and stakeholders review itemized milestone disbursements via our ERP ledger.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-6 bg-slate-50/50">
              <HardHat className="mx-auto h-10 w-10 text-orange-600" />
              <h3 className="font-bold text-slate-900 mt-3 text-base">Safety First Culture</h3>
              <p className="text-xs text-slate-500 mt-1">
                Zero-tolerance safety policies with PPE compliance, scaffolding integrity, and daily toolbox talks.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900 p-8 text-white">
            <h2 className="text-xl font-bold">Our Executive Leadership</h2>
            <p className="text-xs text-slate-400 mt-1">
              Experienced civil engineers, chartered accountants, and project management professionals.
            </p>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="rounded-xl border border-slate-800 p-4 bg-slate-950">
                <p className="font-bold text-white text-sm">Vikramaditya Singhania</p>
                <p className="text-blue-400 text-[11px]">Chief Executive Officer</p>
                <p className="text-slate-400 mt-2">25+ years leading high-rise residential & commercial mega developments across Western India.</p>
              </div>
              <div className="rounded-xl border border-slate-800 p-4 bg-slate-950">
                <p className="font-bold text-white text-sm">Rohan Mehra, FCA</p>
                <p className="text-emerald-400 text-[11px]">Chief Financial Officer</p>
                <p className="text-slate-400 mt-2">Oversees financial engineering, escrow mechanisms, and vendor settlement accuracy.</p>
              </div>
              <div className="rounded-xl border border-slate-800 p-4 bg-slate-950">
                <p className="font-bold text-white text-sm">Sunil Deshmukh, M.Tech</p>
                <p className="text-indigo-400 text-[11px]">Head of Engineering & QC</p>
                <p className="text-slate-400 mt-2">Specialist in seismic-resistant structural design, soil mechanics, and precast assemblies.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
