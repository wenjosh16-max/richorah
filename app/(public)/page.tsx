import Link from "next/link"
import Image from "next/image"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { formatPrix, formatBienPrix } from "@/lib/utils"
import FavoriteButton from "@/components/public/FavoriteButton"
import CardShareButton from "@/components/public/CardShareButton"
import PromotionsCarousel from "@/components/public/PromotionsCarousel"
import HeroSection from "@/components/public/HeroSection"
import NeighborhoodsSection from "@/components/public/NeighborhoodsSection"
import LuxuryServicesSection from "@/components/public/LuxuryServicesSection"
import type { BienData } from "@/types"
export const dynamic = "force-dynamic"

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
  Sparkles,
} from "lucide-react"

const CATEGORIES = [
  { label: "Villas", icon: Home, href: "/biens?type=vente" },
  { label: "Maisons", icon: Building2, href: "/biens?type=vente" },
  { label: "Apparts", icon: Building2, href: "/biens?type=location" },
  { label: "Terrains", icon: MapPin, href: "/biens" },
]

async function getBiensEnVedette() {
  return prisma.bien.findMany({
    orderBy: { createdAt: "desc" },
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
      <HeroSection contenu={contenus} />

      <section className="bg-white border-b border-gray-100/80 sticky top-16 lg:top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.label}
                href={cat.href}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-[#222] hover:border-[#FF385C] hover:text-[#FF385C] hover:bg-[#FFF0F3] transition-all whitespace-nowrap"
              >
                <cat.icon className="h-4 w-4" />
                {cat.label}
              </Link>
            ))}
            <Link
              href="/biens"
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-500 hover:border-gray-400 transition-colors whitespace-nowrap"
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

      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-10 gap-4">
            <div>
              <span className="text-[#FF385C] text-xs tracking-[0.2em] uppercase font-medium">Sélection</span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-4xl font-bold text-[#1A1A1A] mt-1 leading-tight">
                Biens en vedette
              </h2>
              <p className="text-gray-500 mt-2 max-w-md">
                Découvrez nos meilleures offres du moment, sélectionnées avec soin
              </p>
            </div>
            <Link
              href="/biens"
              className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-[#FF385C] hover:text-[#E02D4F] transition-colors group"
            >
              Voir tout
              <span className="w-6 h-6 rounded-full border border-[#FF385C] flex items-center justify-center group-hover:bg-[#FF385C] group-hover:text-white transition-all">
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          </div>

          {biens.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {biens.map((bien) => {
                const promo = bien.promotions[0]?.promotion
                const prixOriginal = bien.prix
                const prixPromo = promo && bien.prix
                  ? bien.prix * (1 - promo.reduction / 100)
                  : null

                return (
                  <div
                    key={bien.id}
                    className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-[#FF385C]/20 card-hover"
                  >
                    <Link
                      href={`/biens/${bien.slug}`}
                      className="block relative aspect-[4/3] overflow-hidden bg-gray-50"
                    >
                      {bien.photos[0] ? (
                        <Image
                          src={bien.photos[0]}
                          alt={bien.titre}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <Home className="h-12 w-12 text-gray-300" />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      <div className="absolute top-3 right-3 z-10">
                        <FavoriteButton slug={bien.slug} className="bg-white/90 hover:bg-white shadow-sm backdrop-blur-sm" />
                      </div>

                      <div className="absolute top-3 left-3 flex flex-wrap gap-2 z-10">
                        <CardShareButton bien={bien as unknown as BienData} />
                      </div>

                      <div className="absolute bottom-3 left-3 flex gap-1.5 z-10">
                        <span className="bg-white/90 backdrop-blur-sm text-gray-900 text-[10px] font-semibold px-3 py-1 rounded-full shadow-sm">
                          {bien.type === "vente" ? "Vente" : "Location"}
                        </span>
                        {promo && (
                          <span className="bg-[#FF385C] text-white text-[10px] font-semibold px-3 py-1 rounded-full shadow-sm">
                            -{promo.reduction}%
                          </span>
                        )}
                      </div>
                    </Link>

                    <div className="p-5">
                      <Link href={`/biens/${bien.slug}`}>
                        <h3 className="font-semibold text-[#1A1A1A] group-hover:text-[#FF385C] transition-colors line-clamp-1 text-base">
                          {bien.titre}
                        </h3>
                      </Link>

                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium text-[#1A1A1A]">4.9</span>
                        </div>
                        <span className="text-xs text-gray-300">·</span>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <MapPin className="h-3 w-3" />
                          <span>{bien.ville || "Lomé"}{bien.quartier ? `, ${bien.quartier}` : ""}</span>
                        </div>
                      </div>

                      <div className="mt-3">
                        {promo && prixPromo && bien.prix ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-[#1A1A1A]">
                              {formatPrix(prixPromo, bien.prixPeriode)}
                            </span>
                            <span className="text-xs text-gray-400 line-through">
                              {formatPrix(prixOriginal, bien.prixPeriode)}
                            </span>
                          </div>
                        ) : prixOriginal ? (
                          <span className="text-xl font-bold text-[#1A1A1A]">
                            {formatPrix(prixOriginal, bien.prixPeriode)}
                          </span>
                        ) : (
                          <span className="text-sm font-medium text-gray-500">
                            {bien.prixSurDemande ? "Prix sur demande" : bien.prixTexte || "Prix sur demande"}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 mt-2.5 pt-3 border-t border-gray-50">
                        {bien.superficie && (
                          <span className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Ruler className="h-3.5 w-3.5 text-gray-400" />
                            {bien.superficie} m²
                          </span>
                        )}
                        {bien.nbPieces && (
                          <span className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Building2 className="h-3.5 w-3.5 text-gray-400" />
                            {bien.nbPieces} p.
                          </span>
                        )}
                        <span className="ml-auto flex items-center gap-1 text-xs text-gray-400">
                          <Sparkles className="h-3 w-3" />
                          Titre foncier
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
                <Home className="h-8 w-8 text-gray-300" />
              </div>
              <p className="text-gray-400 text-sm">Aucun bien disponible pour le moment</p>
              <p className="text-gray-300 text-xs mt-1">Revenez bientôt pour découvrir nos nouvelles offres</p>
            </div>
          )}

          <div className="text-center mt-8 sm:hidden">
            <Link href="/biens">
              <Button variant="outline" className="gap-2 rounded-full">
                Voir tout <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <NeighborhoodsSection />

      <LuxuryServicesSection />

      <section className="py-12 sm:py-16 lg:py-20 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#FF385C]/5 to-transparent rounded-3xl" />
            <div className="relative grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-100 rounded-3xl overflow-hidden">
              {[
                { value: contenus["chiffres_biens"] || "150+", label: "Biens disponibles" },
                { value: contenus["chiffres_clients"] || "500+", label: "Clients satisfaits" },
                { value: contenus["chiffres_annees"] || "10+", label: "Années d'expérience" },
                { value: contenus["chiffres_quartiers"] || "20+", label: "Quartiers couverts" },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-4 sm:p-8 text-center">
                  <div className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold text-[#FF385C] mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <span className="text-[#FF385C] text-xs tracking-[0.2em] uppercase font-medium">Pourquoi nous</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1A1A] mt-2">
              Pourquoi choisir Richorah ?
            </h2>
            <p className="text-gray-500 mt-2 max-w-xl mx-auto">
              Nous mettons tout en œuvre pour vous offrir le meilleur service
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {[
              {
                icon: Shield,
                title: contenus["argument_1_titre"] || "Transactions sécurisées",
                desc: contenus["argument_1_texte"] || "Toutes nos transactions sont encadrées juridiquement pour votre tranquillité",
              },
              {
                icon: Building2,
                title: contenus["argument_2_titre"] || "Large choix de biens",
                desc: contenus["argument_2_texte"] || "Un catalogue varié dans toute la ville de Lomé et ses environs",
              },
              {
                icon: Users,
                title: contenus["argument_3_titre"] || "Accompagnement dédié",
                desc: contenus["argument_3_texte"] || "Un conseiller attitré vous suit de A à Z dans votre projet",
              },
              {
                icon: Award,
                title: contenus["argument_4_titre"] || "Expertise locale",
                desc: contenus["argument_4_texte"] || "Une connaissance approfondie du marché immobilier togolais",
              },
            ].map((arg, i) => (
              <div
                key={i}
                className="group relative bg-[#FAFAFA] rounded-2xl p-6 border border-gray-100 hover:border-[#FF385C]/20 card-hover"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF385C] to-[#E02D4F] flex items-center justify-center mb-4 shadow-md shadow-[#FF385C]/20">
                  <arg.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-[#1A1A1A] mb-2">{arg.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{arg.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 lg:py-20 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <span className="text-[#FF385C] text-xs tracking-[0.2em] uppercase font-medium">Témoignages</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1A1A] mt-2">
              Ce que disent nos clients
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {temoignages.length > 0 ? (
              temoignages.map((t) => (
                <div
                  key={t.id}
                  className="bg-white rounded-2xl p-6 border border-gray-100 card-hover"
                >
                  <div className="flex mb-4">
                    {Array.from({ length: t.etoiles }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-5 italic">
                    &ldquo;{t.texte}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF385C]/20 to-[#E02D4F]/20 flex items-center justify-center">
                      <span className="text-sm font-bold text-[#FF385C]">
                        {t.nom.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-[#1A1A1A] text-sm">{t.nom}</p>
                      <p className="text-xs text-gray-400">Client Richorah</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-12 text-gray-400">
                <Star className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Soyez le premier à laisser un témoignage</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="relative py-16 sm:py-24 lg:py-28 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80"
            alt="Luxury living room"
            fill
            className="object-cover scale-105"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/80" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <div className="inline-block px-3 sm:px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white/80 text-xs tracking-widest uppercase font-medium mb-4 sm:mb-6">
            Contact
          </div>
          <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 leading-tight">
            Prêt à trouver votre bien idéal ?
          </h2>
          <p className="text-white/60 text-xs sm:text-base mb-6 sm:mb-8 max-w-lg mx-auto">
            Contactez-nous dès maintenant pour un accompagnement personnalisé
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="https://wa.me/22870628696" target="_blank" rel="noopener noreferrer">
              <Button className="bg-[#FF385C] hover:bg-[#E02D4F] gap-2 w-full sm:w-auto rounded-xl h-11 sm:h-12 px-6 sm:px-8 shadow-lg shadow-[#FF385C]/25 text-sm sm:text-base">
                <Phone className="h-4 w-4" /> WhatsApp : 70 62 86 96
              </Button>
            </a>
            <a href="tel:+22870628696">
              <Button
                variant="outline"
                className="gap-2 w-full sm:w-auto border-white/20 text-white hover:bg-white/10 rounded-xl h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base"
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
