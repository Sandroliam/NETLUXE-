# NETLUXE ADMIN — Architecture

Application d'administration restructurée en modules (v13).

---

## Fichiers

| Fichier | Rôle | Lignes |
|---|---|---|
| `admin.html` | Structure : login + shell app + 7 pages | ~200 |
| `admin.css` | Design system (variables, layout, sidebar, topbar) | ~110 |
| `admin-components.css` | Composants (boutons, tables, modales, badges, responsive) | ~160 |
| `admin-data.js` | Couche données `DB` + seeds | ~180 |
| `admin-auth.js` | Auth, rôles RBAC, permissions | ~90 |
| `admin-app.js` | Navigation, dashboard, CRUD contenus | ~200 |
| `admin-views.js` | Vues utilisateurs / licences / stats / audit | ~180 |
| `admin-modals.js` | Modales injectées dynamiquement | ~90 |
| `admin-boot.js` | Login, restauration session, application permissions | ~60 |

---

## Authentification

4 rôles avec permissions granulaires :

| Rôle | Code | Permissions |
|---|---|---|
| Propriétaire | `SANDROLIAM509` | tout (`*`) |
| Administrateur | `ADMIN509` | contenus, users, licences, stats, réglages |
| Éditeur | `NETLUXE2026` | contenus (lecture/écriture), stats |
| Support | — | users (lecture), stats, contenus (lecture) |

**Sécurité**
- Aucun code stocké en clair : hash FNV-1a dans `localStorage`
- Session expirée après 12h
- Nav masquée selon les permissions (`applyPerms`)
- Garde serveur-side impossible côté client → migrer vers Firebase Auth pour la prod

---

## Données

Store `localStorage` **partagé avec `index.html`** :

| Clé | Contenu |
|---|---|
| `netluxe_users` | comptes + profils (écrit par l'app conso) |
| `netluxe_catalog` | catalogue éditable depuis l'admin |
| `netluxe_licenses` | licences et droits |
| `netluxe_audit` | journal d'activité (120 dernières entrées) |
| `netluxe_admin_session` | session admin (hash + rôle) |

L'admin lit les profils créés côté consommateur via `DB.allProfiles()` qui aplatit
`users[email].profiles[]` en liste consultable.

---

## Pages

1. **Dashboard** — 4 KPI, top contenus, activité récente
2. **Films / Séries / Dessins animés** — CRUD complet par type
3. **Utilisateurs** — liste des profils + recherche + fiche détaillée
4. **Licences & Droits** — suivi des ayants droit, répartition 70/30
5. **Statistiques** — KPI, répartition par genre, classement
6. **Journal d'activité** — audit log horodaté

---

## Fiche profil

Affiche uniquement les préférences et l'usage — **jamais de mot de passe** :
identifiant, compte, dates, langue, audio, sous-titres, vitesse, historique
avec barres de progression, ma liste.

---

## Tests effectués (v13)

| Test | Résultat |
|---|---|
| Chargement des 9 assets | 200 OK |
| Références HTML → JS | 0 fonction manquante |
| IDs JS → DOM | 0 ID manquant |
| Login mauvais code | erreur affichée |
| Login bon code | app ouverte, rôle owner |
| Dashboard | 4 KPI, 5 top, audit rendu |
| CREATE contenu | 9 → 10 items |
| UPDATE contenu | titre modifié, count stable |
| DELETE contenu | 10 → 9 items |
| Audit log | entrées horodatées |
| RBAC editor | users.read = false ✓ |
| RBAC support | content.write = false ✓ |
| Fiche profil | historique + progression rendus |
| Recherche profils | filtrage OK |
| Code en clair dans storage | absent ✓ |
| Responsive @960 / @480 | règles validées |

---

## Limites connues

- `localStorage` est côté client : un utilisateur technique peut le lire/modifier.
  Les codes admin ne protègent que l'interface, pas les données.
  **Pour la production : Firebase Auth + Firestore avec règles de sécurité.**
- Le hash FNV-1a n'est pas de la crypto forte (pas de sel, rapide à bruteforcer).
  Il évite seulement le stockage en clair.
- Pas de synchronisation multi-appareils (localStorage est local au navigateur).

---

*v13 — 18 août 2026*
