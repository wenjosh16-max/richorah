import Link from "next/link"
import Image from "next/image"
import { Home, Building2, Calculator, ShieldCheck, ArrowRight, Star } from "lucide-react"

const SERVICES = [
  {
    icon: Home,
    title: "Achat immobilier",
    desc: "Trouvez la maison ou l'appartement de vos rêves à Lomé",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
    href: "/biens?type=vente",
    color: "from-amber-900/60 to-black/80",
  },
  {
    icon: Building2,
    title: "Location",
    desc: "Des logements de qualité pour tous vos besoins",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
    href: "/biens?type=location",
    color: "from-blue-900/60 to-black/80",
  },
  {
    icon: Calculator,
    title: "Estimation gratuite",
    desc: "Connaissez la valeur de votre bien en quelques clics",
    image: "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=800&q=80",
    href: "/contact",
    color: "from-emerald-900/60 to-black/80",
  },
  {
    icon: ShieldCheck,
    title: "Gestion locative",
    desc: "Confiez-nous la gestion de votre investissement",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
    href: "/contact",
    color: "from-purple-900/60 to-black/80",
  },
]

export default function LuxuryServicesSection() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-[#FF385C] text-xs tracking-[0.2em] uppercase font-medium">Services</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1A1A] mt-2">
            Nos services exclusifs
          </h2>
          <p className="text-gray-500 mt-2 max-w-xl mx-auto">
            Des solutions sur mesure pour chaque projet immobilier
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {SERVICES.map((s) => (
            <Link
              key={s.title}
              href={s.href}
              className="group relative h-72 rounded-2xl overflow-hidden"
            >
              <Image
                src={s.image}
                alt={s.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 640px) 100vw, 50vw"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${s.color}`} />
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <s.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-white mb-2">{s.title}</h3>
                <p className="text-white/70 text-sm mb-4 max-w-xs">{s.desc}</p>
                <div className="flex items-center gap-2 text-white/80 text-sm font-medium group-hover:gap-3 transition-all">
                  En savoir plus <ArrowRight className="h-4 w-4" />
                </div>
              </div>
              <div className="absolute top-4 right-4 bg-[#FF385C] text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg">
                Premium
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-[#1A1A1A] text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-[#333] transition-all shadow-lg hover:shadow-xl"
          >
            <Star className="h-4 w-4" /> Demander un conseil personnalisé
          </Link>
        </div>
      </div>
    </section>
  )
}
