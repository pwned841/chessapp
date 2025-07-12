# ChessApp

## Pitch
_Une plateforme d'analyse d'échecs complète qui unifie les données FIDE, Chess.com et Lichess pour offrir aux joueurs d'échecs des outils d'analyse avancés, une recherche de joueurs multicritères, et des fonctionnalités d'exploration d'ouvertures avec Stockfish._

## Description
ChessApp est une application web moderne conçue pour les passionnés d'échecs de tous niveaux. Elle résout le problème de la fragmentation des données d'échecs en ligne en centralisant les informations provenant de différentes plateformes.

- **Ce que fait ce projet :** ChessApp permet de rechercher des joueurs d'échecs, d'analyser leurs répertoires d'ouvertures, d'explorer des parties, de calculer les variations d'ELO, et de localiser des clubs d'échecs.
- **Pourquoi ce projet est-il utile :** Il offre une vue unifiée des données d'échecs dispersées sur différentes plateformes, avec des outils d'analyse avancés alimentés par Stockfish.
- **Qui sont les utilisateurs visés :** Joueurs d'échecs amateurs et professionnels, entraîneurs, analystes de parties, et toute personne souhaitant améliorer son jeu d'échecs.

## Features
- [x] Recherche de joueurs FIDE avec base de données complète (1.6M+ joueurs)
- [x] Intégration Chess.com - recherche et profils des joueurs
- [x] Intégration Lichess.org - recherche et profils des joueurs
- [x] Explorateur de répertoires d'ouvertures avec analyse Stockfish
- [x] Calculateur d'ELO pour matchs individuels et tournois
- [x] Localisation des clubs d'échecs sur carte interactive
- [x] Interface responsive avec animations fluides
- [x] Recherche floue intelligente avec suggestions
- [ ] Analyse complète de parties avec évaluation des coups
- [ ] Exportation des données d'analyse
- [ ] Historique des recherches utilisateur
- [ ] Tableau de bord personnalisé
- [ ] Intégration avec d'autres plateformes d'échecs

*Ces fonctionnalités visent à créer un écosystème complet d'analyse d'échecs, combinant la puissance de Stockfish avec une interface utilisateur moderne et intuitive.*

## Wireframe
_Un aperçu visuel de votre projet pour aider à comprendre la structure des pages et l'UX :_
- L'application est actuellement en ligne : [ChessApp Live](https://chessapp-ksqc.vercel.app)
- Les wireframes et maquettes sont disponibles dans l'historique des pull requests du projet

## Stack Technique
_Décrivez les technologies, frameworks, librairies et outils utilisés :_
- **Front-end :** Next.js 15, React 18, Tailwind CSS, Framer Motion, Radix UI, Shadcn/UI
- **Back-end :** Next.js API Routes, Prisma ORM, Node.js
- **Base de données :** PostgreSQL avec Supabase
- **Authentification :** Supabase Auth avec JWT
- **Analyse d'échecs :** Stockfish 16, Chess.js, React-Chessboard
- **Déploiement :** Vercel
- **Autres outils :** TypeScript, ESLint, Leaflet (cartes), Fuse.js (recherche floue), Axios

## Installation & Lancement
_Indiquez comment cloner, installer les dépendances, lancer le projet en local et éventuellement comment déployer :_

```bash
# Cloner le repo
git clone https://github.com/pwned841/chessapp.git

# Aller dans le dossier
cd chessapp

# Installer les dépendances
npm install

# Configurer les variables d'environnement
# Créer un fichier .env.local et ajouter :
# DATABASE_URL=your-database-url
# NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Configurer la base de données avec Prisma
npx prisma migrate dev

# Lancer le projet en mode développement
npm run dev

# Build du projet
npm run build

# Démarrer en mode production
npm start
```

## Tests

Les tests sont en cours de développement. Le projet inclut actuellement :
- Configuration ESLint pour la qualité du code
- Tests JWT basiques dans `src/tests/jwt-test.ts`

## Auteurs

- **Développeur principal :** [pwned841](https://github.com/pwned841)
- **Contributeurs :** Contributions bienvenues via GitHub Issues et Pull Requests

---

📧 **Contact :** Vous avez trouvé un bug ou souhaitez suggérer une fonctionnalité ? [Ouvrez une issue](https://github.com/pwned841/chessapp/issues) sur GitHub !

⭐ **Support :** Si ce projet vous plaît, n'hésitez pas à lui donner une étoile sur GitHub !
