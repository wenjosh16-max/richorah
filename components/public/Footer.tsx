import Link from "next/link"
import { Phone, Mail, MapPin, Clock } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-[#1A1A2E] text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="font-serif text-2xl font-bold">Richorah</span>
              <span className="font-serif text-lg text-[#FF385C]">Immobilier</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Agence immobilière de confiance à Lomé, Togo. 
              Nous vous accompagnons dans tous vos projets immobiliers 
              avec professionnalisme et transparence.
            </p>
          </div>

          <div>
            <h3 className="font-serif text-lg mb-4 text-[#FF385C]">Liens rapides</h3>
            <div className="space-y-3">
              <Link href="/" className="block text-sm text-gray-400 hover:text-[#FF385C] transition-colors">Accueil</Link>
              <Link href="/biens" className="block text-sm text-gray-400 hover:text-[#FF385C] transition-colors">Nos biens</Link>
              <Link href="/promotions" className="block text-sm text-gray-400 hover:text-[#FF385C] transition-colors">Promotions</Link>
              <Link href="/a-propos" className="block text-sm text-gray-400 hover:text-[#FF385C] transition-colors">À propos</Link>
              <Link href="/contact" className="block text-sm text-gray-400 hover:text-[#FF385C] transition-colors">Contact</Link>
              <Link href="/favoris" className="block text-sm text-gray-400 hover:text-[#FF385C] transition-colors">Mes favoris</Link>
              <Link href="/quartiers" className="block text-sm text-gray-400 hover:text-[#FF385C] transition-colors">Quartiers</Link>
              <Link href="/alerte" className="block text-sm text-gray-400 hover:text-[#FF385C] transition-colors">Alerte bien</Link>
            </div>
          </div>

          <div>
            <h3 className="font-serif text-lg mb-4 text-[#FF385C]">Contact</h3>
            <div className="space-y-3">
              <a href="tel:+22870628696" className="flex items-center gap-3 text-sm text-gray-400 hover:text-[#FF385C] transition-colors">
                <Phone className="h-4 w-4 text-[#FF385C]" /> 70 62 86 96
              </a>
              <a href="tel:+22897555582" className="flex items-center gap-3 text-sm text-gray-400 hover:text-[#FF385C] transition-colors">
                <Phone className="h-4 w-4 text-[#FF385C]" /> 97 55 55 82
              </a>
              <a href="mailto:Richorahimmobilier04@gmail.com" className="flex items-center gap-3 text-sm text-gray-400 hover:text-[#FF385C] transition-colors">
                <Mail className="h-4 w-4 text-[#FF385C]" /> Richorahimmobilier04@gmail.com
              </a>
              <div className="flex items-start gap-3 text-sm text-gray-400">
                <MapPin className="h-4 w-4 text-[#FF385C] mt-0.5" />
                <span>Lomé, Togo</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-gray-400">
                <Clock className="h-4 w-4 text-[#FF385C] mt-0.5" />
                <span>Lun-Sam : 8h00 - 18h00</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-8 text-center">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Richorah Immobilier. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  )
}
