import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  const adminPassword = await bcrypt.hash("Richorah2024!", 12)

  await prisma.admin.upsert({
    where: { email: "admin@richorah.com" },
    update: {},
    create: {
      email: "admin@richorah.com",
      password: adminPassword,
    },
  })

  console.log("Admin created: admin@richorah.com / Richorah2024!")

  const biens = [
    {
      titre: "Villa moderne à Tokoin",
      description:
        "<p>Magnifique villa moderne située dans le quartier résidentiel de Tokoin à Lomé. Cette propriété exceptionnelle offre tout le confort moderne avec des finitions de haute qualité.</p><p>Le bien dispose d'un grand salon lumineux, d'une cuisine américaine entièrement équipée, de 4 chambres spacieuses dont une suite parentale avec dressing et salle d'eau privative.</p><p>À l'extérieur, vous profiterez d'une piscine, d'un jardin tropical entretenu et d'un parking pour deux véhicules. Idéal pour une famille recherchant calme et confort.</p>",
      type: "vente",
      prix: 85000000,
      devise: "FCFA",
      ville: "Lomé",
      quartier: "Tokoin",
      superficie: 250,
      nbPieces: 4,
      etage: 1,
      equipements: ["Climatisation", "Parking", "Piscine", "Jardin", "Terrasse", "Cuisine équipée", "Balcon", "Groupe électrogène"],
      latitude: 6.1728,
      longitude: 1.2234,
      statut: "actif",
      slug: "villa-moderne-tokoin",
      photos: [
        "https://picsum.photos/seed/villa-tokoin1/800/600",
        "https://picsum.photos/seed/villa-tokoin2/800/600",
        "https://picsum.photos/seed/villa-tokoin3/800/600",
      ],
      vues: 234,
      ordre: 1,
    },
    {
      titre: "Appartement luxueux à la plage de Bénin",
      description:
        "<p>Superbe appartement avec vue imprenable sur l'océan dans le quartier prisé de Bénin. Ce bien rare est idéal pour ceux qui recherchent un cadre de vie exceptionnel.</p><p>Composé d'un séjour traversant avec baies vitrées donnant sur une terrasse panoramique, de 3 chambres climatisées, d'une cuisine moderne et de deux salles d'eau.</p><p>L'immeuble dispose d'un gardiennage 24h/24 et d'un parking sécurisé. À proximité des commerces, restaurants et plages.</p>",
      type: "vente",
      prix: 120000000,
      devise: "FCFA",
      ville: "Lomé",
      quartier: "Bénin",
      superficie: 180,
      nbPieces: 3,
      etage: 4,
      equipements: ["Climatisation", "Parking", "Cuisine équipée", "Terrasse", "Gardiènage"],
      latitude: 6.1589,
      longitude: 1.2689,
      statut: "actif",
      slug: "appartement-luxueux-plage-benin",
      photos: [
        "https://picsum.photos/seed/appart-benin1/800/600",
        "https://picsum.photos/seed/appart-benin2/800/600",
        "https://picsum.photos/seed/appart-benin3/800/600",
      ],
      vues: 189,
      ordre: 2,
    },
    {
      titre: "Maison de standing à Adidogomé",
      description:
        "<p>Belle maison de standing située dans le quartier calme d'Adidogomé. Parfaite pour une famille recherchant espace et tranquillité.</p><p>La maison comprend un vaste salon-salle à manger, une cuisine moderne équipée, 3 chambres avec placards, deux salles de bains, une buanderie et un grand garage.</p><p>Le terrain clôturé de 300 m² offre un beau jardin avec des arbres fruitiers et une terrasse couverte idéale pour les réceptions familiales.</p>",
      type: "vente",
      prix: 55000000,
      devise: "FCFA",
      ville: "Lomé",
      quartier: "Adidogomé",
      superficie: 200,
      nbPieces: 3,
      etage: 0,
      equipements: ["Parking", "Cuisine équipée", "Balcon", "Jardin", "Gardiènage"],
      latitude: 6.1889,
      longitude: 1.1989,
      statut: "actif",
      slug: "maison-standing-adidogome",
      photos: [
        "https://picsum.photos/seed/maison-adidogome/800/600",
      ],
      vues: 156,
      ordre: 3,
    },
    {
      titre: "Studio meublé à Nyékonakpoé",
      description:
        "<p>Studio entièrement meublé et équipé dans le quartier animé de Nyékonakpoé. Idéal pour étudiant ou jeune professionnel.</p><p>Le studio comprend une pièce principale avec coin nuit et kitchenette, une salle d'eau moderne avec douche et WC. Tout le mobilier est inclus.</p><p>Situé à 5 minutes des principaux commerces et transports en commun. Disponible immédiatement.</p>",
      type: "location",
      prix: 150000,
      devise: "FCFA",
      ville: "Lomé",
      quartier: "Nyékonakpoé",
      superficie: 35,
      nbPieces: 1,
      etage: 2,
      equipements: ["Climatisation", "Meublé"],
      latitude: 6.1789,
      longitude: 1.2389,
      statut: "actif",
      slug: "studio-meuble-nyekonakpoe",
      photos: [
        "https://picsum.photos/seed/studio-nyekonakpoe/800/600",
      ],
      vues: 312,
      ordre: 4,
    },
    {
      titre: "Duplex contemporain à Kégué",
      description:
        "<p>Magnifique duplex contemporain dans le quartier résidentiel de Kégué. Une architecture moderne et des prestations de qualité.</p><p>Au rez-de-chaussée : un grand séjour surplombant le jardin, une cuisine américaine équipée, un invité WC. À l'étage : 4 chambres dont une suite parentale avec terrasse privative.</p><p>Le bien dispose d'une piscine, d'un jardin paysager, d'un garage double et d'un groupe électrogène. Sécurité et tranquillité assurées.</p>",
      type: "vente",
      prix: 95000000,
      devise: "FCFA",
      ville: "Lomé",
      quartier: "Kégué",
      superficie: 300,
      nbPieces: 5,
      etage: 2,
      equipements: ["Climatisation", "Parking", "Piscine", "Jardin", "Terrasse", "Cuisine équipée", "Balcon", "Groupe électrogène", "Gardiènage"],
      latitude: 6.2089,
      longitude: 1.2189,
      statut: "actif",
      slug: "duplex-contemporain-kegue",
      photos: [
        "https://picsum.photos/seed/duplex-kegue1/800/600",
        "https://picsum.photos/seed/duplex-kegue2/800/600",
      ],
      vues: 98,
      ordre: 5,
    },
    {
      titre: "Bureau commercial à Lomé 2",
      description:
        "<p>Espace commercial idéalement situé au cœur du quartier des affaires de Lomé 2. Parfait pour une entreprise ou un professionnel.</p><p>Le local comprend un open space lumineux, un bureau fermé, une salle de réunion, une kitchenette et des sanitaires. Climatisation réversible et internet fibre.</p><p>Vitrine sur rue avec une belle visibilité. Zone à forte fréquentation avec nombreux commerces et services à proximité.</p>",
      type: "location",
      prix: 750000,
      devise: "FCFA",
      ville: "Lomé",
      quartier: "Lomé 2",
      superficie: 120,
      nbPieces: 4,
      etage: 0,
      equipements: ["Climatisation", "Parking", "Gardiènage"],
      latitude: 6.1389,
      longitude: 1.2289,
      statut: "actif",
      slug: "bureau-commercial-lome2",
      photos: [
        "https://picsum.photos/seed/bureau-lome2/800/600",
      ],
      vues: 76,
      ordre: 6,
    },
  ]

  for (const bien of biens) {
    await prisma.bien.upsert({
      where: { slug: bien.slug },
      update: {
        photos: bien.photos,
        prix: bien.prix,
        description: bien.description,
        superficie: bien.superficie,
        nbPieces: bien.nbPieces,
        etage: bien.etage,
        equipements: bien.equipements,
        statut: bien.statut,
        vues: bien.vues,
      },
      create: bien,
    })
  }

  console.log(`${biens.length} biens created`)

  const contenus: { cle: string; valeur: string }[] = [
    { cle: "slogan_hero", valeur: "Votre patrimoine, notre passion" },
    { cle: "sous_slogan_hero", valeur: "Agence immobilière de confiance à Lomé, Togo" },
    { cle: "chiffres_biens", valeur: "150+" },
    { cle: "chiffres_clients", valeur: "500+" },
    { cle: "chiffres_annees", valeur: "10+" },
    { cle: "chiffres_quartiers", valeur: "20+" },
    { cle: "argument_1_titre", valeur: "Transactions sécurisées" },
    { cle: "argument_1_texte", valeur: "Toutes nos transactions sont encadrées juridiquement pour votre tranquillité" },
    { cle: "argument_2_titre", valeur: "Large choix de biens" },
    { cle: "argument_2_texte", valeur: "Un catalogue varié dans toute la ville de Lomé et ses environs" },
    { cle: "argument_3_titre", valeur: "Accompagnement dédié" },
    { cle: "argument_3_texte", valeur: "Un conseiller attitré vous suit de A à Z dans votre projet" },
    { cle: "argument_4_titre", valeur: "Expertise locale" },
    { cle: "argument_4_texte", valeur: "Une connaissance approfondie du marché immobilier togolais" },
    { cle: "a_propos_texte", valeur: "<p>Richorah Immobilier est une agence immobilière basée à Lomé, Togo, forte de plus de 10 ans d'expérience dans le secteur immobilier togolais.</p><p>Notre mission est d'accompagner nos clients dans tous leurs projets immobiliers : vente, location, gestion locative et conseil. Nous mettons un point d'honneur à offrir un service personnalisé, transparent et professionnel.</p><p>Notre équipe de conseillers experts connaît parfaitement le marché local et les spécificités de chaque quartier de Lomé. Nous sélectionnons rigoureusement chaque bien pour garantir la satisfaction de nos clients.</p><p>Chez Richorah, nous croyons que chaque projet immobilier est unique et mérite une attention particulière. C'est pourquoi nous prenons le temps de comprendre vos besoins et de vous proposer des solutions adaptées.</p>" },
  ]

  for (const c of contenus) {
    await prisma.contenu.upsert({
      where: { cle: c.cle },
      update: { valeur: c.valeur },
      create: c,
    })
  }

  console.log(`${contenus.length} contenus created`)

  const temoignages = [
    {
      nom: "Kodjo A.",
      texte: "Richorah m'a accompagné dans l'achat de ma villa à Tokoin. Professionnalisme, écoute et efficacité. Je recommande vivement !",
      etoiles: 5,
      ordre: 1,
    },
    {
      nom: "Marie B.",
      texte: "J'ai loué un appartement grâce à Richorah. Le processus a été rapide et transparent. Un grand merci à toute l'équipe.",
      etoiles: 5,
      ordre: 2,
    },
    {
      nom: "Profiles",
      texte: "Excellente agence ! Le simulateur de crédit sur leur site m'a permis de bien préparer mon projet. Service client au top.",
      etoiles: 4,
      ordre: 3,
    },
  ]

  const existingTemoignages = await prisma.temoignage.count()
  if (existingTemoignages === 0) {
    for (const t of temoignages) {
      await prisma.temoignage.create({ data: t })
    }
    console.log(`${temoignages.length} témoignages created`)
  } else {
    console.log(`Témoignages skipped (${existingTemoignages} already exist)`)
  }

  console.log(`${temoignages.length} témoignages created`)

  const existingPromos = await prisma.promotion.count()
  if (existingPromos === 0) {
    await prisma.promotion.create({
      data: {
        titre: "Promotion été 2026",
        description: "Profitez de -10% sur tous nos biens en vente jusqu'à fin août",
        reduction: 10,
        dateDebut: new Date("2026-06-01"),
        dateFin: new Date("2026-08-31"),
        active: true,
        biens: {
          create: [{ bienId: (await prisma.bien.findUnique({ where: { slug: "villa-moderne-tokoin" } }))!.id }],
        },
      },
    })

    console.log("1 promotion created")
  } else {
    console.log(`Promotions skipped (${existingPromos} already exist)`)
  }

  const existingMessages = await prisma.message.count()
  if (existingMessages === 0) {
    const premierBien = await prisma.bien.findFirst({ orderBy: { createdAt: "asc" } })

    await prisma.message.createMany({
      data: [
        {
          nom: "Jean T.",
          telephone: "90 12 34 56",
          email: "jean.t@email.com",
          message: "Bonjour, je suis intéressé par la villa moderne à Tokoin. Pouvez-vous me contacter pour une visite ?",
          bienId: premierBien?.id || undefined,
          statut: "nouveau",
        },
        {
          nom: "Aminata S.",
          telephone: "70 98 76 54",
          message: "Je recherche un studio meublé à Nyékonakpoé. Est-ce que le studio affiché est toujours disponible ?",
          bienId: (await prisma.bien.findUnique({ where: { slug: "studio-meuble-nyekonakpoe" } }))?.id || undefined,
          statut: "contacté",
        },
      ],
    })

    console.log("2 messages created")
  } else {
    console.log(`Messages skipped (${existingMessages} already exist)`)
  }

  const existingJournal = await prisma.journalActivite.count()
  if (existingJournal === 0) {
    await prisma.journalActivite.createMany({
      data: [
        { action: "seed", description: "Initialisation de la base de données" },
        { action: "creation", description: "Création de 6 biens exemples" },
        { action: "creation", description: "Création de la promotion été 2026" },
      ],
    })

    console.log("Journal entries created")
  }
  const existingParametres = await prisma.parametre.count()
  if (existingParametres === 0) {
    await prisma.parametre.createMany({
      data: [
        { cle: "commission_vente_pct", valeur: "5", type: "nombre" },
        { cle: "commission_location_mois", valeur: "1", type: "nombre" },
        { cle: "commission_part_agence", valeur: "50", type: "nombre" },
        { cle: "commission_part_agent", valeur: "50", type: "nombre" },
        { cle: "frais_visite_defaut", valeur: "5000", type: "nombre" },
        { cle: "frais_visite_circuit", valeur: "15000", type: "nombre" },
        { cle: "telephone_standard", valeur: "70 62 86 96", type: "string" },
        { cle: "telephone_whatsapp", valeur: "22870628696", type: "string" },
        { cle: "telephone_standard_2", valeur: "97 55 55 82", type: "string" },
        { cle: "email_notification", valeur: "contact@richorah-immobilier.com", type: "string" },
      ],
    })
    console.log("Paramètres créés")
  } else {
    console.log("Paramètres skipped (already exist)")
  }

  await prisma.parametre.upsert({
    where: { cle: "visite_creneaux" },
    update: {
      valeur: JSON.stringify({
        lundi: ["9:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"],
        mardi: ["9:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"],
        mercredi: ["9:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"],
        jeudi: ["9:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"],
        vendredi: ["9:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"],
        samedi: ["9:00", "10:00", "11:00"],
        dimanche: [],
      }),
      type: "string",
    },
    create: {
      cle: "visite_creneaux",
      valeur: JSON.stringify({
        lundi: ["9:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"],
        mardi: ["9:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"],
        mercredi: ["9:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"],
        jeudi: ["9:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"],
        vendredi: ["9:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"],
        samedi: ["9:00", "10:00", "11:00"],
        dimanche: [],
      }),
      type: "string",
    },
  })
  console.log("Créneaux visite ajoutés")

  const existingAgents = await prisma.agent.count()
  if (existingAgents === 0) {
    await prisma.agent.createMany({
      data: [
        { nom: "Koffi A.", telephone: "90 11 22 33", email: "koffi@richorah.com", quartiers: ["Tokoin", "Kégué", "Adidogomé"], commissionPct: null, ordre: 1 },
        { nom: "Ama B.", telephone: "70 44 55 66", email: "ama@richorah.com", quartiers: ["Bénin", "Lomé 2", "Nyékonakpoé"], commissionPct: null, ordre: 2 },
      ],
    })
    console.log("Agents créés")
  } else {
    console.log("Agents skipped (already exist)")
  }

  console.log("Seed completed successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
