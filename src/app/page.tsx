import Link from "next/link";
import PublicNavbar from "@/components/public/Navbar";
import PublicFooter from "@/components/public/Footer";
import {
  Building2,
  HardHat,
  ShieldCheck,
  Award,
  Clock,
  ArrowRight,
  CheckCircle,
  Truck,
  Users,
  Compass,
  Phone,
  Sparkles,
} from "lucide-react";

export default function HomePage() {
  const services = [
    {
      title: "Residential Construction",
      desc: "Turnkey luxury villas, gated townships, and high-rise apartment towers engineered to IS 456 standards.",
      icon: Building2,
      badge: "Turnkey Architecture",
    },
    {
      title: "Commercial & Office Spaces",
      desc: "Grade-A corporate headquarters, tech park developments, and modern institutional campuses.",
      icon: Award,
      badge: "High-Efficiency MEP",
    },
    {
      title: "Pre-Engineered Warehousing",
      desc: "Heavy industrial sheds, clear-span PEB structures, and laser-screeded heavy loading facilities.",
      icon: Truck,
      badge: "Fast-Track Steel PEB",
    },
    {
      title: "Complete Renovation & Fitouts",
      desc: "Comprehensive structural retrofitting, architectural façade glazing, and bespoke interior execution.",
      icon: HardHat,
      badge: "Interior & Façade",
    },
  ];

  const stats = [
    { label: "Completed Projects", value: "240+" },
    { label: "Built-up Area Delivered", value: "3.8M Sq.Ft" },
    { label: "Partner Vendors & Contractors", value: "85+" },
    { label: "Client Retention Rate", value: "99.4%" },
  ];

  const testimonials = [
    {
      quote:
        "BuildMaster delivered our 14-story residential high-rise 2 months ahead of schedule. The live ERP milestone tracking and financial transparency were unprecedented in our 20 years in real estate.",
      author: "Rajesh Khanna",
      title: "Chairman, Skyline Luxury Ventures",
    },
    {
      quote:
        "The automated procurement, vendor quality checks, and real-time site progress reporting eliminated all friction in constructing our 120,000 sq.ft industrial logistics warehouse.",
      author: "Vikram Malhotra",
      title: "Managing Director, Malhotra Logistics Hub",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 py-24 text-white lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(37,99,235,0.25),rgba(255,255,255,0))]" />
        
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Next-Generation Construction & Infrastructure Management</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-white leading-tight">
              Engineering Excellence. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-orange-400">
                Precision Construction.
              </span>
            </h1>

            <p className="text-base text-slate-300 leading-relaxed sm:text-lg">
              BuildMaster is a premier construction enterprise delivering residential high-rises, commercial office parks, and pre-engineered warehouses powered by real-time ERP site tracking and financial compliance.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                href="/inquiry"
                className="flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-600/30 hover:bg-orange-500 transition-colors"
              >
                <span>Request Project Inquiry</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/projects"
                className="rounded-xl border border-slate-700 bg-slate-900/80 px-6 py-3.5 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition"
              >
                Explore Projects
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-blue-500/30 bg-blue-600/20 px-6 py-3.5 text-sm font-semibold text-blue-300 hover:bg-blue-600/30 transition"
              >
                Live ERP Portal
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter Strip */}
      <section className="border-y border-slate-200 bg-slate-50 py-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
                  {s.value}
                </div>
                <div className="mt-1 text-xs font-semibold text-slate-500">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Construction Services Grid */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Our Capabilities
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Turnkey Construction Solutions
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              From architectural layout and RCC structural execution to interior MEP finishing and handover.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((svc) => {
              const Icon = svc.icon;
              return (
                <div
                  key={svc.title}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="mt-4 inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                      {svc.badge}
                    </span>
                    <h3 className="mt-2 text-base font-bold text-slate-900">{svc.title}</h3>
                    <p className="mt-2 text-xs text-slate-500 leading-relaxed">{svc.desc}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <Link
                      href="/services"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
                    >
                      <span>Learn more</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
                The BuildMaster Advantage
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Integrated Construction with Complete Financial Clarity
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Traditional construction often suffers from hidden cost escalations, material wastage, and lack of real-time milestone verification. BuildMaster integrates project execution with modern ERP technology.
              </p>

              <div className="space-y-3 pt-2">
                {[
                  "Automated smart CRM vendor matching and contractor allocation",
                  "Daily cash and bank reconciliation with transparent milestone billings",
                  "IS standard laboratory cube-testing and QC compliance at every slab cast",
                  "Centralized material inventory ensuring zero pilferage on site",
                ].map((pt) => (
                  <div key={pt} className="flex items-start gap-3 text-xs sm:text-sm text-slate-200">
                    <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-500"
                >
                  <span>Read About Our Engineering Methodology</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Testimonials Card */}
            <div className="space-y-4">
              {testimonials.map((t, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl backdrop-blur-sm"
                >
                  <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">
                    "{t.quote}"
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3">
                    <div>
                      <p className="font-bold text-white text-xs">{t.author}</p>
                      <p className="text-[11px] text-slate-400">{t.title}</p>
                    </div>
                    <div className="flex text-amber-400 text-xs">★★★★★</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Strip */}
      <section className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 py-16 text-white text-center">
        <div className="mx-auto max-w-4xl px-6 space-y-4">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to Build Your Next Landmark Project?
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 max-w-2xl mx-auto">
            Submit your construction requirement online. Our automated matching engine assigns the most qualified approved partner vendor within hours.
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-3">
            <Link
              href="/inquiry"
              className="rounded-xl bg-white px-6 py-3 text-xs font-bold text-blue-900 shadow-lg hover:bg-blue-50"
            >
              Submit Project Inquiry
            </Link>
            <Link
              href="/vendor-register"
              className="rounded-xl border border-white/30 bg-blue-800/40 px-6 py-3 text-xs font-bold text-white hover:bg-blue-800/60"
            >
              Vendor Partner Registration
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
