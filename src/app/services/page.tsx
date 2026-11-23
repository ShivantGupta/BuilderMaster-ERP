import Link from "next/link";
import PublicNavbar from "@/components/public/Navbar";
import PublicFooter from "@/components/public/Footer";
import { Building2, Award, Truck, HardHat, CheckCircle2, ArrowRight } from "lucide-react";

export default function ServicesPage() {
  const categories = [
    {
      id: "residential",
      title: "Residential Construction & Luxury Villas",
      badge: "Gated Communities & High-Rises",
      desc: "Turnkey residential contracting from deep foundation piling to RCC frame, brickwork, waterproofing, and high-end Italian marble finishes. We specialize in bespoke private villas, multi-family apartment towers, and sustainable green homes.",
      specs: [
        "M25/M30 Grade Ready Mix Concrete with computerized batching",
        "Anti-termite soil treatment & chemical injection barriers",
        "Seismic Zone 3 & 4 compliant earthquake-resistant RCC design",
        "Premium bathroom waterproofing with 10-year warranty",
      ],
    },
    {
      id: "commercial",
      title: "Commercial High-Rises & Tech Parks",
      badge: "Corporate Headquarters & Retail Hubs",
      desc: "Grade-A institutional infrastructure engineered for maximum floor efficiency and LEED certification. Full integration with HVAC chilled-water loops, fire-fighting sprinkler networks, high-speed elevator shafts, and automated BMS controls.",
      specs: [
        "Heavy post-tensioned (PT) slabs for large column-free spans",
        "DGU structural acoustic façade glazing",
        "Advanced electrical sub-stations & redundant DG backup systems",
        "Basement mechanical multi-level stack parking solutions",
      ],
    },
    {
      id: "industrial",
      title: "Industrial PEB Warehousing & Logistics",
      badge: "Pre-Engineered Heavy Steel Sheds",
      desc: "Rapid-deployment pre-engineered buildings (PEB) engineered with high-tensile steel, 12-meter clear heights, and laser-screeded vacuum dewatered flooring (VDF) capable of sustaining heavy container reach-stacker wheel loads.",
      specs: [
        "High-tensile Grade 345/450 structural steel framing",
        "Laser-screeded FM2 high-tolerance heavy loading floors",
        "Galvalume standing seam insulated roof sheeting",
        "Dock levellers & automated rolling shutter logistics bays",
      ],
    },
    {
      id: "renovation",
      title: "Turnkey Interior Fitouts & Structural Retrofit",
      badge: "Commercial & High-End Residential",
      desc: "Complete interior transformations, structural column jacketing, carbon-fiber composite retrofitting, and turnkey fitouts for corporate headquarters, luxury residences, and retail flagships.",
      specs: [
        "Structural health monitoring & non-destructive rebound hammer tests",
        "Acoustic gypsum partitions & baffle ceilings",
        "Smart lighting automation & IoT climate control",
        "Zero-downtime execution scheduling for operational facilities",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicNavbar />

      <section className="bg-slate-950 py-20 text-white text-center">
        <div className="mx-auto max-w-4xl px-6 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
            Comprehensive Engineering Services
          </span>
          <h1 className="text-3xl font-extrabold sm:text-5xl">
            Building with Precision, Durability & Integrity
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto">
            Explore our specialized construction verticals. Every project is backed by digital ERP milestone tracking and itemized financial transparency.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-5xl px-6 space-y-12">
          {categories.map((c, idx) => (
            <div
              key={c.id}
              className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                    {c.badge}
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 mt-1">{c.title}</h2>
                </div>
                <Link
                  href="/inquiry"
                  className="rounded-lg bg-orange-600 px-4 py-2 text-xs font-bold text-white hover:bg-orange-500 transition"
                >
                  Request Quote
                </Link>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 mt-4 leading-relaxed">
                {c.desc}
              </p>

              <div className="mt-6 rounded-xl bg-slate-50 p-4">
                <span className="text-xs font-bold text-slate-900 block mb-2">
                  Technical Specifications & Quality Standards:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                  {c.specs.map((sp, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>{sp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
