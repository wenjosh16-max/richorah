import Link from "next/link"
import { Phone, Mail, MapPin, Clock, Building2, ArrowUpRight } from "lucide-react"

export default function Footer({ logoUrl }: { logoUrl?: string | null }) {
  return (
    <footer className="relative bg-[#0A0A0A] text-white">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FF385C]/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-5">
              {logoUrl ? (
                <img src={logoUrl} alt="Richorah" className="h-10 w-auto max-w-[180px] object-contain" />
              ) : (
                <>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF385C] to-[#E02D4F] flex items-center justify-center shadow-lg shadow-[#FF385C]/20">
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-serif text-xl font-bold tracking-tight">Richorah</div>
                    <div className="text-[10px] text-[#FF385C] tracking-[0.2em] uppercase font-medium">Immobilier</div>
                  </div>
                </>
              )}
            </div>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Agence immobilière de confiance à Lomé, Togo. Nous vous accompagnons dans tous vos projets immobiliers avec professionnalisme et transparence.
            </p>
            <div className="flex gap-3">
              {[
                { label: "WhatsApp", href: "https://wa.me/22870628696" },
                { label: "Email", href: "mailto:Richorahimmobilier04@gmail.com" },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#FF385C] transition-colors border border-gray-800 hover:border-[#FF385C]/30 rounded-full px-3.5 py-1.5"
                >
                  {item.label}
                  <ArrowUpRight className="h-3 w-3" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-serif text-base font-semibold mb-5 text-white/90">Navigation</h3>
            <div className="space-y-3">
              {[
                { href: "/", label: "Accueil" },
                { href: "/biens", label: "Nos biens" },
                { href: "/promotions", label: "Promotions" },
                { href: "/a-propos", label: "À propos" },
                { href: "/contact", label: "Contact" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-sm text-gray-500 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-serif text-base font-semibold mb-5 text-white/90">Services</h3>
            <div className="space-y-3">
              {[
                { href: "/biens?type=vente", label: "Achat" },
                { href: "/biens?type=location", label: "Location" },
                { href: "/quartiers", label: "Quartiers" },
                { href: "/favoris", label: "Mes favoris" },
                { href: "/alerte", label: "Alerte bien" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-sm text-gray-500 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-serif text-base font-semibold mb-5 text-white/90">Contact</h3>
            <div className="space-y-4">
              <a href="tel:+22870628696" className="flex items-center gap-3 text-sm text-gray-400 hover:text-white transition-colors group">
                <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-[#FF385C]/10 transition-colors">
                  <Phone className="h-4 w-4 text-[#FF385C]" />
                </span>
                <span>70 62 86 96</span>
              </a>
              <a href="tel:+22897555582" className="flex items-center gap-3 text-sm text-gray-400 hover:text-white transition-colors group">
                <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-[#FF385C]/10 transition-colors">
                  <Phone className="h-4 w-4 text-[#FF385C]" />
                </span>
                <span>97 55 55 82</span>
              </a>
              <a href="mailto:Richorahimmobilier04@gmail.com" className="flex items-center gap-3 text-sm text-gray-400 hover:text-white transition-colors group">
                <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-[#FF385C]/10 transition-colors">
                  <Mail className="h-4 w-4 text-[#FF385C]" />
                </span>
                <span className="break-all">Richorahimmobilier04@gmail.com</span>
              </a>
              <div className="flex items-start gap-3 text-sm text-gray-400">
                <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-4 w-4 text-[#FF385C]" />
                </span>
                <span>Lomé, Togo</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-gray-400">
                <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-4 w-4 text-[#FF385C]" />
                </span>
                <span>Lun-Sam : 8h00 - 18h00</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative mt-14 pt-8">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              &copy; {new Date().getFullYear()} Richorah Immobilier. Tous droits réservés.
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <span>Lomé, Togo</span>
              <span className="w-1 h-1 rounded-full bg-gray-700" />
              <span>Design par Richorah</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
