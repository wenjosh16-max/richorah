import { prisma } from "@/lib/prisma"
import { formatPrix, genererMessageWhatsApp } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { BienData } from "@/types"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  Home,
  MapPin,
  Ruler,
  Building2,
  Layers,
  Check,
  Eye,
  ChevronLeft,
  MessageCircle,
  Phone,
  Download,
} from "lucide-react"
import FavoriteButton from "@/components/public/FavoriteButton"
import SimulateurCredit from "@/components/public/SimulateurCredit"
import ClientPhotoGallery from "./ClientPhotoGallery"
import ClientShareButton from "./ClientShareButton"
import ContactForm from "./ContactForm"
import AnimatedSection from "./AnimatedSection"

async function getBien(slug: string) {
  const now = new Date()
  return prisma.bien.findUnique({
    where: { slug, published: true },
    include: {
      promotions: {
        include: { promotion: true },
        where: {
          promotion: {
            active: true,
            dateDebut: { lte: now },
            dateFin: { gte: now },
          },
        },
      },
    },
  })
}

async function getBiensSimilaires(type: string, prix: number | null, id: string) {
  const prixMin = prix ? prix * 0.7 : 0
  const prixMax = prix ? prix * 1.3 : 999999999
  return prisma.bien.findMany({
    where: {
      published: true,
      statut: "actif",
      type,
      id: { not: id },
      prix: { gte: prixMin, lte: prixMax },
    },
    orderBy: { createdAt: "desc" },
    take: 3,
  })
}

async function incrementerVues(slug: string) {
  try {
    await prisma.bien.update({
      where: { slug },
      data: { vues: { increment: 1 } },
    })
  } catch {
    // Silently fail
  }
}

interface DetailBienPageProps {
  params: Promise<{ slug: string }>
}

export default async function DetailBienPage({ params }: DetailBienPageProps) {
  const { slug } = await params

  const bien = await getBien(slug)
  if (!bien) notFound()

  const [similaires] = await Promise.all([
    getBiensSimilaires(bien.type, bien.prix, bien.id),
  ])

  // Fire and forget view increment
  incrementerVues(slug)

  const promo = bien.promotions[0]?.promotion ?? null
  const prixOriginal = bien.prix
  const prixPromo = promo && prixOriginal ? prixOriginal * (1 - promo.reduction / 100) : null

  const bienData: BienData = {
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
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      <ClientPhotoGallery photos={bien.photos} titre={bien.titre} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/biens"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#FF385C] transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Retour aux biens
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <AnimatedSection>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant={bien.type === "vente" ? "default" : "info"}>
                        {bien.type === "vente" ? "Vente" : "Location"}
                      </Badge>
                      {promo && (
                        <Badge variant="danger">-{promo.reduction}%</Badge>
                      )}
                    </div>
                    <h1 className="font-serif text-2xl lg:text-3xl font-bold text-[#1A1A2E]">
                      {bien.titre}
                    </h1>
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-2">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span>
                        {bien.ville || "Lomé"}{bien.quartier ? `, ${bien.quartier}` : ""}
                      </span>
                    </div>
                  </div>
                  <FavoriteButton slug={bien.slug} className="shrink-0" />
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-4">
                  {bien.prixSurDemande ? (
                    <div className="text-2xl font-bold text-gray-500">
                      Prix sur demande
                    </div>
                  ) : promo && prixPromo ? (
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-red-500">
                        {formatPrix(Math.round(prixPromo))}
                      </span>
                      <span className="text-lg text-gray-400 line-through">
                        {formatPrix(Math.round(prixOriginal ?? 0))}
                      </span>
                      <Badge variant="danger">-{promo.reduction}%</Badge>
                    </div>
                  ) : prixOriginal ? (
                    <div className="text-2xl font-bold text-[#FF385C]">
                      {formatPrix(prixOriginal)}
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-gray-500">
                      Prix sur demande
                    </div>
                  )}
                </div>

                {bien.prixNegociable && !bien.prixSurDemande && (
                  <div className="mt-3 inline-flex items-center gap-1.5 bg-[#FF385C]/10 text-[#FF385C] text-sm font-medium px-3 py-1 rounded-full">
                    <span className="w-2 h-2 bg-[#FF385C] rounded-full" />
                    Prix négociable
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
                  {bien.superficie && (
                    <div className="text-center p-3 bg-[#F8F7F4] rounded-lg">
                      <Ruler className="h-5 w-5 text-[#FF385C] mx-auto mb-1" />
                      <p className="text-sm font-semibold text-[#1A1A2E]">{bien.superficie} m²</p>
                      <p className="text-xs text-gray-500">Superficie</p>
                    </div>
                  )}
                  {bien.nbPieces && (
                    <div className="text-center p-3 bg-[#F8F7F4] rounded-lg">
                      <Building2 className="h-5 w-5 text-[#FF385C] mx-auto mb-1" />
                      <p className="text-sm font-semibold text-[#1A1A2E]">{bien.nbPieces}</p>
                      <p className="text-xs text-gray-500">Pièces</p>
                    </div>
                  )}
                  {bien.etage !== null && bien.etage !== undefined && (
                    <div className="text-center p-3 bg-[#F8F7F4] rounded-lg">
                      <Layers className="h-5 w-5 text-[#FF385C] mx-auto mb-1" />
                      <p className="text-sm font-semibold text-[#1A1A2E]">{bien.etage}</p>
                      <p className="text-xs text-gray-500">Étage</p>
                    </div>
                  )}
                  <div className="text-center p-3 bg-[#F8F7F4] rounded-lg">
                    <Eye className="h-5 w-5 text-[#FF385C] mx-auto mb-1" />
                    <p className="text-sm font-semibold text-[#1A1A2E]">{bien.vues}</p>
                    <p className="text-xs text-gray-500">Vues</p>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            {bien.description && (
              <AnimatedSection>
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="font-serif text-xl font-bold text-[#1A1A2E] mb-4">
                    Description
                  </h2>
                  <div
                    className="prose prose-sm max-w-none text-gray-600 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: bien.description }}
                  />
                </div>
              </AnimatedSection>
            )}

            {bien.equipements.length > 0 && (
              <AnimatedSection>
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="font-serif text-xl font-bold text-[#1A1A2E] mb-4">
                    Équipements
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {bien.equipements.map((eq) => (
                      <div key={eq} className="flex items-center gap-2.5 text-sm text-gray-700">
                        <div className="w-5 h-5 bg-green-50 rounded-full flex items-center justify-center shrink-0">
                          <Check className="h-3 w-3 text-green-600" />
                        </div>
                        {eq}
                      </div>
                    ))}
                  </div>
                </div>
              </AnimatedSection>
            )}

            {bien.urlVisite360 && (
              <AnimatedSection>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="p-6 pb-3">
                    <h2 className="font-serif text-xl font-bold text-[#1A1A2E]">
                      Visite virtuelle 360°
                    </h2>
                  </div>
                  <div className="relative w-full" style={{ height: "450px" }}>
                    <iframe
                      src={bien.urlVisite360}
                      className="absolute inset-0 w-full h-full"
                      allowFullScreen
                      loading="lazy"
                      title="Visite virtuelle 360°"
                    />
                  </div>
                </div>
              </AnimatedSection>
            )}

            {bien.latitude && bien.longitude && (
              <AnimatedSection>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="p-6 pb-3">
                    <h2 className="font-serif text-xl font-bold text-[#1A1A2E]">
                      Localisation
                    </h2>
                  </div>
                  <div className="relative w-full" style={{ height: "350px" }}>
                    <iframe
                      src={`https://maps.google.com/maps?q=${bien.latitude},${bien.longitude}&z=15&output=embed`}
                      className="absolute inset-0 w-full h-full"
                      allowFullScreen
                      loading="lazy"
                      title="Localisation du bien"
                    />
                  </div>
                </div>
              </AnimatedSection>
            )}

            <AnimatedSection>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="font-serif text-xl font-bold text-[#1A1A2E] mb-4">
                  Contacter l&rsquo;agence
                </h2>
                <ContactForm bienId={bien.id} bienTitre={bien.titre} />
              </div>
            </AnimatedSection>

            <div className="flex flex-wrap gap-3">
              <a
                href={`https://wa.me/22870628696?text=${genererMessageWhatsApp({ titre: bien.titre, slug: bien.slug })}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="gap-2 bg-green-500 hover:bg-green-600">
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </Button>
              </a>
              <a href="tel:+22870628696">
                <Button variant="outline" className="gap-2">
                  <Phone className="h-4 w-4" />
                  70 62 86 96
                </Button>
              </a>
              <a href={`/api/pdf/${bien.slug}`} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Télécharger PDF
                </Button>
              </a>
              <ClientShareButton bien={bienData} />
            </div>

            <AnimatedSection>
              <div className="flex items-center gap-2 text-sm text-gray-500 bg-[#F8F7F4] px-4 py-3 rounded-lg">
                <Eye className="h-4 w-4 text-[#FF385C]" />
                <span>
                  <strong className="text-[#1A1A2E]">{bien.vues}</strong> personne{bien.vues !== 1 ? "s" : ""} a{bien.vues === 1 ? "" : "ont"} consulté ce bien
                </span>
              </div>
            </AnimatedSection>

            {similaires.length > 0 && (
              <AnimatedSection>
                <div className="space-y-4">
                  <h2 className="font-serif text-xl font-bold text-[#1A1A2E]">
                    Biens similaires
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {similaires.map((b) => (
                      <Link
                        key={b.id}
                        href={`/biens/${b.slug}`}
                        className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                      >
                        <div className="relative h-40 overflow-hidden">
                          {b.photos[0] ? (
                            <Image
                              src={b.photos[0]}
                              alt={b.titre}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                              sizes="(max-width: 640px) 100vw, 33vw"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <Home className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <h3 className="font-semibold text-sm text-[#1A1A2E] group-hover:text-[#FF385C] transition-colors line-clamp-1">
                            {b.titre}
                          </h3>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                            {b.superficie && (
                              <span className="flex items-center gap-0.5">
                                <Ruler className="h-3 w-3" /> {b.superficie} m²
                              </span>
                            )}
                            {b.nbPieces && (
                              <span className="flex items-center gap-0.5">
                                <Building2 className="h-3 w-3" /> {b.nbPieces} pièces
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-bold text-[#FF385C] mt-1">
                            {b.prix ? formatPrix(b.prix) : "Sur demande"}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </AnimatedSection>
            )}
          </div>

          <div className="space-y-6">
            <div className="lg:sticky lg:top-24 space-y-6">
              {bien.prix && (
                <SimulateurCredit prix={bien.prix} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
