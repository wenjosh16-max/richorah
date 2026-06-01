import Link from "next/link"
import Image from "next/image"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { formatPrix } from "@/lib/utils"
import FavoriteButton from "@/components/public/FavoriteButton"
import CardShareButton from "@/components/public/CardShareButton"
import PromotionsCarousel from "@/components/public/PromotionsCarousel"
import type { BienData } from "@/types"
import {
  Building2,
  Users,
  Award,
  Shield,
  ArrowRight,
  Star,
  Home,
  MapPin,
  Ruler,
  Phone,
  SlidersHorizontal,
} from "lucide-react"

const CATEGORIES = [
  { label: "Villas", icon: Home, href: "/biens?type=vente" },
  { label: "Maisons", icon: Building2, href: "/biens?type=vente" },
  { label: "Apparts", icon: Building2, href: "/biens?type=location" },
  { label: "Terrains", icon: MapPin, href: "/biens" },
]

async function getBiensEnVedette() {
  return prisma.bien.findMany({
    where: { published: true, statut: "actif" },
    orderBy: { createdAt: "desc" },
    take: 6,
    include: {
      promotions: {
        include: { promotion: true },
        where: {
          promotion: {
            active: true,
            dateDebut: { lte: new Date() },
            dateFin: { gte: new Date() },
          },
        },
      },
    },
  })
}

async function getContenus() {
  const contenus = await prisma.contenu.findMany()
  return Object.fromEntries(contenus.map((c) => [c.cle, c.valeur]))
}

async function getTemoignages() {
  return prisma.temoignage.findMany({
    where: { actif: true },
    orderBy: { ordre: "asc" },
  })
}

async function getActivePromotions() {
  const now = new Date()
  return prisma.promotion.findMany({
    where: {
      active: true,
      dateDebut: { lte: now },
      dateFin: { gte: now },
    },
    orderBy: { createdAt: "desc" },
  })
}

export default async function AccueilPage() {
  const [biens, contenus, temoignages, promotions] = await Promise.all([
    getBiensEnVedette(),
    getContenus(),
    getTemoignages(),
    getActivePromotions(),
  ])

  return (
    <div className="bg-white">
      <section className="bg-[#FAFAFA] border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.label}
                href={cat.href}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-[#222] hover:border-primary hover:text-primary transition-colors whitespace-nowrap"
              >
                <cat.icon className="h-4 w-4" />
                {cat.label}
              </Link>
            ))}
            <Link
              href="/biens"
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-[#717171] hover:border-gray-400 transition-colors whitespace-nowrap ml-auto"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filtres
            </Link>
          </div>
        </div>
      </section>

      <PromotionsCarousel
        promotions={promotions.map((p) => ({
          id: p.id,
          titre: p.titre,
          description: p.description,
          reduction: p.reduction,
        }))}
      />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#222]">
              Biens en vedette
            </h2>
            <p className="text-sm text-[#717171] mt-0.5">
              Découvrez nos meilleures offres du moment
            </p>
          </div>
          <Link
            href="/biens"
            className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary hover:text-[#E02D4F] transition-colors"
          >
            Voir tout <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {biens.map((bien) => {
            const promo = bien.promotions[0]?.promotion
            const prixOriginal = bien.prix
            const prixPromo = promo && bien.prix
              ? bien.prix * (1 - promo.reduction / 100)
              : null

            return (
              <div
                key={bien.id}
                className="group bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300"
              >
                <Link
                  href={`/biens/${bien.slug}`}
                  className="block relative aspect-[4/3] overflow-hidden"
                >
                  {bien.photos[0] ? (
                    <Image
                      src={bien.photos[0]}
                      alt={bien.titre}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <Home className="h-12 w-12 text-gray-300" />
                    </div>
                  )}

                  <div className="absolute top-3 right-3 z-10">
                    <FavoriteButton slug={bien.slug} className="bg-white/90 hover:bg-white shadow-sm" />
                  </div>

                  <div className="absolute top-3 left-3 flex flex-wrap gap-2 z-10">
                    <CardShareButton bien={{
                      id: bien.id,
                      titre: bien.titre,
                      description: bien.description,
                      type: bien.type,
                      prix: bien.prix,
                      prixNegociable: bien.prixNegociable,
                      prixSurDemande: bien.prixSurDemande,
                      devise: bien.devise,
                      ville: bien.ville,
                      quartier: bien.quartier,
                      superficie: bien.superficie,
                      nbPieces: bien.nbPieces,
                      etage: bien.etage,
                      equipements: bien.equipements,
                      latitude: bien.latitude,
                      longitude: bien.longitude,
                      statut: bien.statut,
                      photos: bien.photos,
                      slug: bien.slug,
                      urlVisite360: bien.urlVisite360,
                      vues: bien.vues,
                      ordre: bien.ordre,
                      published: bien.published,
                      createdAt: bien.createdAt,
                      updatedAt: bien.updatedAt,
                      promotions: bien.promotions.map((pb) => ({
                        promotionId: pb.promotionId,
                        bienId: pb.bienId,
                        promotion: {
                          id: pb.promotion.id,
                          titre: pb.promotion.titre,
                          description: pb.promotion.description,
                          reduction: pb.promotion.reduction,
                          dateDebut: pb.promotion.dateDebut,
                          dateFin: pb.promotion.dateFin,
                          active: pb.promotion.active,
                        },
                      })),
                    }} />
                  </div>

                  <div className="absolute bottom-3 left-3 flex gap-1.5">
                    <span className="bg-primary text-white text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-sm">
                      {bien.type === "vente" ? "Vente" : "Location"}
                    </span>
                    {promo && (
                      <span className="bg-red-500 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-sm">
                        -{promo.reduction}%
                      </span>
                    )}
                  </div>
                </Link>

                <div className="p-4">
                  <Link href={`/biens/${bien.slug}`}>
                    <h3 className="font-semibold text-[#222] group-hover:text-primary transition-colors line-clamp-1">
                      {bien.titre}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium text-[#222]">4.9</span>
                    </div>
                    <span className="text-xs text-[#717171]">·</span>
                    <div className="flex items-center gap-1 text-sm text-[#717171]">
                      <MapPin className="h-3 w-3" />
                      <span>{bien.ville || "Lomé"}</span>
                    </div>
                  </div>

                  <div className="mt-2">
                    {promo && prixPromo && bien.prix ? (
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-[#222]">
                          {formatPrix(prixPromo)}
                        </span>
                        <span className="text-xs text-[#717171] line-through">
                          {formatPrix(prixOriginal)}
                        </span>
                      </div>
                    ) : prixOriginal ? (
                      <span className="text-lg font-bold text-[#222]">
                        {formatPrix(prixOriginal)}
                      </span>
                    ) : (
                      <span className="text-sm font-medium text-[#717171]">
                        Prix sur demande
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mt-2 text-xs text-[#717171]">
                    {bien.superficie && (
                      <span className="flex items-center gap-1">
                        <Ruler className="h-3 w-3" /> {bien.superficie} m²
                      </span>
                    )}
                    {bien.nbPieces && (
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" /> {bien.nbPieces} p.
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                      Titre foncier
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="text-center mt-6 sm:hidden">
          <Link href="/biens">
            <Button variant="outline" className="gap-2">
              Voir tout <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <section className="py-12 lg:py-16 bg-[#FAFAFA] border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-1">
                {contenus["chiffres_biens"] || "150+"}
              </div>
              <div className="text-sm text-[#717171]">Biens disponibles</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
              <div className="text-3xl font-bold text-[#222] mb-1">
                {contenus["chiffres_clients"] || "500+"}
              </div>
              <div className="text-sm text-[#717171]">Clients satisfaits</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
              <div className="text-3xl font-bold text-[#222] mb-1">
                {contenus["chiffres_annees"] || "10+"}
              </div>
              <div className="text-sm text-[#717171]">Années d&apos;expérience</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-1">
                {contenus["chiffres_quartiers"] || "20+"}
              </div>
              <div className="text-sm text-[#717171]">Quartiers couverts</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl lg:text-3xl font-bold text-[#222]">
              Pourquoi choisir Richorah ?
            </h2>
            <p className="text-[#717171] mt-2 max-w-xl mx-auto text-sm">
              Nous mettons tout en œuvre pour vous offrir le meilleur service
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: Shield,
                title: contenus["argument_1_titre"] || "Transactions sécurisées",
                desc: contenus["argument_1_texte"] || "Toutes nos transactions sont encadrées juridiquement",
              },
              {
                icon: Building2,
                title: contenus["argument_2_titre"] || "Large choix de biens",
                desc: contenus["argument_2_texte"] || "Un catalogue varié dans toute la ville de Lomé",
              },
              {
                icon: Users,
                title: contenus["argument_3_titre"] || "Accompagnement dédié",
                desc: contenus["argument_3_texte"] || "Un conseiller attitré pour chaque dossier",
              },
              {
                icon: Award,
                title: contenus["argument_4_titre"] || "Expertise locale",
                desc: contenus["argument_4_texte"] || "Une connaissance approfondie du marché togolais",
              },
            ].map((arg, i) => (
              <div
                key={i}
                className="bg-[#FAFAFA] rounded-xl p-6 border border-gray-100 hover:border-primary/20 hover:shadow-md transition-all duration-300 group"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-primary transition-colors duration-300">
                  <arg.icon className="h-5 w-5 text-primary group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="font-semibold text-[#222] mb-1.5 text-sm">{arg.title}</h3>
                <p className="text-[#717171] text-xs leading-relaxed">{arg.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-16 bg-[#FAFAFA] border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl lg:text-3xl font-bold text-[#222]">
              Ce que disent nos clients
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {temoignages.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-xl p-6 border border-gray-100"
              >
                <div className="flex mb-3">
                  {Array.from({ length: t.etoiles }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-[#717171] text-sm leading-relaxed mb-4 italic">
                  &ldquo;{t.texte}&rdquo;
                </p>
                <p className="font-semibold text-[#222] text-sm">
                  — {t.nom}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl lg:text-3xl font-bold text-[#222] mb-2">
            Prêt à trouver votre bien idéal ?
          </h2>
          <p className="text-[#717171] text-sm mb-6 max-w-md mx-auto">
            Contactez-nous dès maintenant pour un accompagnement personnalisé
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="https://wa.me/22870628696"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="bg-primary hover:bg-[#E02D4F] gap-2 w-full sm:w-auto">
                <Phone className="h-4 w-4" /> WhatsApp : 70 62 86 96
              </Button>
            </a>
            <a href="tel:+22870628696">
              <Button
                variant="outline"
                className="gap-2 w-full sm:w-auto border-gray-200"
              >
                <Phone className="h-4 w-4" /> Appeler : 70 62 86 96
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
