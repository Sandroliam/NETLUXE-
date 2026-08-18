# NETLUXE — Structure du Projet

```
NETLUXE/
├── index.html          # Application consommateur (770 lignes)
│                       # - Connexion email / OAuth / Code rapide
│                       # - Création de profil (avatar, couleur)
│                       # - Navigation (Accueil, Films, Séries, Animés, Ma Liste, Profil)
│                       # - Lecteur vidéo HLS (gestes volume/luminosité)
│                       # - Audio multilingue (FR/EN/ES/CR)
│                       # - Sous-titres multilingues
│                       # - Recherche, Recommandations, Statistiques
│                       # - Responsive (Android, iOS, tablettes, PC)
│
├── admin.html          # Dashboard administrateur (280 lignes)
│                       # - Dashboard (stats, activité récente)
│                       # - Gestion Films / Séries / Dessins Animés / Catégories
│                       # - Gestion Utilisateurs & Profils
│                       # - Fiches profils (préférences, historique, stats)
│                       # - Gestion Licences & Droits
│                       # - Statistiques avancées
│
├── README.md           # Documentation du projet
│
└── .git/               # Historique des versions
```

## Fichiers supprimés
- `cloudflared.exe` — Tunnel temporaire (55 MB, inutile)
- `lib/` — Ancien code Flutter (remplacé par index.html)

## Fonctionnalités en ligne

### Consommateur (index.html)
| Fonctionnalité | Détail |
|----------------|--------|
| Connexion | Email seul, OAuth Google/FB/Apple, Code rapide |
| Profil | Avatar/photo, couleur, nom |
| Navigation | Accueil, Films, Séries, Animés, Ma Liste, Profil |
| Lecteur | HLS, gestes volume/luminosité, plein écran, skip |
| Audio | FR, EN, ES, CR par contenu |
| Sous-titres | FR, EN, ES, CR sélectionnables |
| Sauvegarde | Historique, progression, ma liste, préférences |
| Responsive | Android, iPhone, iPad, tablettes, PC |

### Administrateur (admin.html)
| Section | Contenu |
|---------|---------|
| Dashboard | Stats (users, contenus, vues, revenus) |
| Contenus | CRUD Films/Séries/Animés/Catégories |
| Utilisateurs | Tableau + recherche |
| Fiches Profils | Préférences, historique, stats détaillées |
| Licences | Gestion des droits, expiration |
| Statistiques | Métriques complètes |

## Liens
- **Consommateur** : https://sandroliam.github.io/NETLUXE-/index.html
- **Administrateur** : https://sandroliam.github.io/NETLUXE-/admin.html

## Codes d'accès
| Code | Rôle |
|------|------|
| SANDROLIAM509 | Admin principal |
| NETLUXE2026 | Utilisateur standard |
| ADMIN509 | Admin secondaire |
