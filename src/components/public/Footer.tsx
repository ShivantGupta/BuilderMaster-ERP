import Link from "next/link";
import { Building2, Phone, Mail, MapPin, ShieldCheck } from "lucide-react";

export default function PublicFooter() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold">
                <Building2 className="h-6 w-6" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                BUILD<span className="text-blue-400">MASTER</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Leading construction, builder, and engineering infrastructure firm delivering turnkey residential, commercial high-rise, and pre-engineered warehouses.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Construction Services
            </h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li><Link href="/services" className="hover:text-white">Residential Villas & Apartments</Link></li>
              <li><Link href="/services" className="hover:text-white">Commercial Office Hubs</Link></li>
              <li><Link href="/services" className="hover:text-white">Industrial Warehousing & PEB</Link></li>
              <li><Link href="/services" className="hover:text-white">Turnkey Interior Renovation</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Portals & Partners
            </h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li><Link href="/inquiry" className="hover:text-white">Customer Inquiry Form</Link></li>
              <li><Link href="/vendor-register" className="hover:text-white">Vendor Onboarding Application</Link></li>
              <li><Link href="/login" className="hover:text-white">Admin & Vendor ERP Portal</Link></li>
              <li><Link href="/about" className="hover:text-white">Quality Assurance & IS Standards</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Head Office Contact
            </h4>
            <div className="mt-3 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-400 shrink-0" />
                <span>Level 14, Worli Horizon Tower, Mumbai, MH - 400018</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-blue-400 shrink-0" />
                <span>+91 98765 43210 / 022-49112233</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-400 shrink-0" />
                <span>projects@buildmaster.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 BuildMaster Construction & Infrastructure Corp. All rights reserved.</p>
          <div className="mt-2 sm:mt-0 flex gap-4">
            <Link href="/login" className="text-slate-400 hover:text-white">ERP Staff Sign-In</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
