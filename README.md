# Richorah Immobilier

Site web complet pour l'agence immobilière **Richorah Immobilier** à Lomé, Togo.

## Stack technique

- **Next.js 16** (App Router) + **TypeScript** strict
- **Tailwind CSS 4** + shadcn/ui
- **PostgreSQL** + **Prisma ORM**
- **NextAuth.js v5** (auth admin)
- **Framer Motion** (animations)
- **Cloudinary** (images)
- **html2canvas + jspdf** (génération image/PDF)
- **@anthropic-ai/sdk** (génération de description IA)
- **Nodemailer** (emails)

## Prérequis

- Node.js 18+
- PostgreSQL (en cours d'exécution)
- npm

## Installation

```bash
# 1. Installer les dépendances
npm install

# 2. Copier le fichier d'environnement
cp .env.example .env
# Modifier .env avec vos informations

# 3. Créer la base de données
createdb richorah

# 4. Lancer la migration Prisma
npx prisma migrate dev --name init

# 5. Seed la base de données
npx prisma db seed

# 6. Lancer le serveur de développement
npm run dev
```

## Accès

- **Site public** : http://localhost:3000
- **Admin** : http://localhost:3000/admin
  - Email : `admin@richorah.com`
  - Mot de passe : `Richorah2024!`

## Structure du projet

```
├── app/
│   ├── (public)/           # Pages publiques
│   │   ├── page.tsx        # Accueil
│   │   ├── biens/          # Catalogue + détail
│   │   ├── favoris/        # Favoris
│   │   ├── alerte/         # Alerte bien
│   │   ├── a-propos/       # À propos
│   │   └── contact/        # Contact
│   ├── admin/              # Dashboard admin
│   │   ├── login/          # Connexion
│   │   ├── page.tsx        # Dashboard
│   │   ├── biens/          # Gestion des biens
│   │   ├── messages/       # CRM
│   │   ├── promotions/     # Promotions
│   │   ├── contenus/       # Éditeur de contenu
│   │   ├── alertes/        # Alertes
│   │   ├── activite/       # Journal
│   │   └── sauvegarde/     # Export
│   └── api/                # API routes
├── components/
│   ├── public/             # Composants publics
│   └── admin/              # Composants admin
├── lib/                    # Bibliothèques
├── hooks/                  # Hooks React
├── types/                  # Types TypeScript
└── prisma/                 # Schéma + seed
```

## Fonctionnalités clés

- **Publication rapide** : Formulaire 3 étapes pour publier un bien en 2 minutes
- **Génération IA** : Description automatique via Claude Sonnet
- **Partage 1 clic** : Image-affiche 1080x1080 + texte pré-rédigé pour WhatsApp
- **CRM** : Gestion des leads avec statuts et suivi
- **Filtres avancés** : Type, ville, prix, superficie, pièces, équipements
- **Simulateur de crédit** : Calcul des mensualités en FCFA
- **Favoris** : Sauvegarde locale sans rechargement
- **Mobile-first** : Design responsive optimisé

## Coordonnées

- Téléphones : 70 62 86 96 / 97 55 55 82
- WhatsApp : +228 97 55 55 82
- Email : contact@richorah-immobilier.com
- Localisation : Lomé, Togo

## Licence

Propriété exclusive de Richorah Immobilier.
