export interface BienData {
  id: string
  titre: string
  description?: string | null
  type: string
  prix?: number | null
  prixNegociable: boolean
  prixSurDemande: boolean
  prixPeriode?: string | null
  prixTexte?: string | null
  devise: string
  ville?: string | null
  quartier?: string | null
  superficie?: number | null
  nbPieces?: number | null
  etage?: number | null
  equipements: string[]
  latitude?: number | null
  longitude?: number | null
  statut: string
  photos: string[]
  slug: string
  urlVisite360?: string | null
  vues: number
  ordre: number
  published: boolean
  createdAt: Date | string
  updatedAt: Date | string
  promotions?: PromotionBienData[]
}

export interface PromotionData {
  id: string
  titre: string
  description?: string | null
  reduction: number
  dateDebut: Date | string
  dateFin: Date | string
  active: boolean
}

export interface PromotionBienData {
  promotionId: string
  bienId: string
  promotion: PromotionData
}

export interface MessageData {
  id: string
  nom: string
  telephone: string
  email?: string | null
  message: string
  note?: string | null
  bienId?: string | null
  bien?: BienData | null
  statut: string
  createdAt: Date | string
  updatedAt: Date | string
}

export interface ContenuData {
  cle: string
  valeur: string
}

export interface TemoignageData {
  id: string
  nom: string
  texte: string
  etoiles: number
  ordre: number
  actif: boolean
}

export interface AlerteData {
  id: string
  email: string
  type?: string | null
  ville?: string | null
  budgetMax?: number | null
  superficieMin?: number | null
}

export interface JournalData {
  id: string
  action: string
  description: string
  createdAt: Date | string
}

export interface FiltresRecherche {
  type?: string
  ville?: string
  prixMin?: number
  prixMax?: number
  superficieMin?: number
  superficieMax?: number
  nbPieces?: number
  equipements?: string[]
  tri?: string
  page?: number
}
