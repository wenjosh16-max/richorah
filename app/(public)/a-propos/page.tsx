import { prisma } from "@/lib/prisma"
import Image from "next/image"
import Link from "next/link"
import { Award, Shield, Users, Building2, Target, Heart } from "lucide-react"

async function getContenus() {
  const contenus = await prisma.contenu.findMany({
    where: {
      cle: { in: ["a_propos_texte", "a_propos_photo"] },
    },
  })
  return Object.fromEntries(contenus.map((c) => [c.cle, c.valeur]))
}

const VALEURS = [
  {
    icon: Shield,
    title: "Confiance",
    description:
      "Nous plaçons l'intégrité et la transparence au cœur de chaque transaction immobilière.",
  },
  {
    icon: Target,
    title: "Excellence",
    description:
      "Nous visons l'excellence dans chaque service rendu, avec rigueur et professionnalisme.",
  },
  {
    icon: Heart,
    title: "Proximité",
    description:
      "Une relation de proximité avec nos clients pour comprendre et anticiper leurs besoins.",
  },
  {
    icon: Users,
    title: "Engagement",
    description:
      "Un engagement total pour accompagner nos clients de la recherche à la signature.",
  },
]

export default async function AProposPage() {
  const contenus = await getContenus()
  const texte = contenus["a_propos_texte"] || ""
  const photo = contenus["a_propos_photo"] || null

  return (
    <div className="bg-white">
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1920&q=80"
            alt="Richorah Immobilier"
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/80" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white/80 text-xs tracking-widest uppercase font-medium mb-4">
            Qui sommes-nous
          </div>
          <h1 className="font-serif text-4xl lg:text-5xl font-bold text-white mb-4">
            À propos de Richorah
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Votre partenaire de confiance dans l'immobilier au Togo depuis plus de 10 ans.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-serif text-3xl lg:text-4xl font-bold text-[#1A1A2E] mb-6">
                Notre histoire
              </h2>
              <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed space-y-4">
                {texte ? (
                  <div dangerouslySetInnerHTML={{ __html: texte }} />
                ) : (
                  <>
                    <p>
                      Richorah Immobilier est une agence immobili&egrave;re de r&eacute;f&eacute;rence
                      &agrave; Lom&eacute;, au Togo. Forte de plus de 10 ann&eacute;es d&apos;exp&eacute;rience,
                      notre &eacute;quipe de professionnels passionn&eacute;s met son expertise &agrave;
                      votre service pour tous vos projets immobiliers.
                    </p>
                    <p>
                      Que vous cherchiez &agrave; acheter, vendre ou louer un bien, nous vous
                      accompagnons &agrave; chaque &eacute;tape avec un conseil personnalis&eacute; et une
                      connaissance approfondie du march&eacute; local.
                    </p>
                    <p>
                      Notre mission est de vous offrir une exp&eacute;rience immobili&egrave;re
                      transparente, s&eacute;curis&eacute;e et sans stress. Nous croyons en la force des
                      relations humaines et en l&apos;importance de comprendre les besoins uniques
                      de chaque client.
                    </p>
                  </>
                )}
              </div>
            </div>
            <div className="relative">
              {photo ? (
                <div className="relative h-[400px] lg:h-[500px] rounded-2xl overflow-hidden shadow-xl">
                  <Image
                    src={photo}
                    alt="Richorah Immobilier"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              ) : (
                <div className="h-[400px] lg:h-[500px] rounded-2xl bg-[#F8F7F4] flex items-center justify-center">
                  <Building2 className="h-24 w-24 text-[#FF385C]/30" />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-[#F8F7F4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl lg:text-4xl font-bold text-[#1A1A2E] mb-3">
              Nos valeurs
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Des principes qui guident chacune de nos actions
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALEURS.map((valeur) => (
              <div
                key={valeur.title}
                className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 group"
              >
                <div className="w-14 h-14 bg-[#FF385C]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#FF385C] transition-colors duration-300">
                  <valeur.icon className="h-7 w-7 text-[#FF385C] group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="font-bold text-lg text-[#1A1A2E] mb-2">
                  {valeur.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {valeur.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-[#1A1A2E] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Award className="h-16 w-16 mx-auto mb-6 text-[#FF385C]" />
          <h2 className="font-serif text-3xl lg:text-4xl font-bold mb-4">
            Votre satisfaction, notre priorit&eacute;
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto mb-8">
            Des centaines de clients nous ont fait confiance pour leurs projets
            immobiliers. Rejoignez-les et laissez-nous vous accompagner.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="tel:+22870628696"
              className="inline-flex items-center justify-center h-12 px-8 rounded-lg bg-[#FF385C] text-white font-medium hover:bg-[#E02D4F] transition-colors"
            >
              Nous contacter
            </a>
            <Link
              href="/biens"
              className="inline-flex items-center justify-center h-12 px-8 rounded-lg border border-white/30 text-white font-medium hover:bg-white/10 transition-colors"
            >
              Voir nos biens
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
