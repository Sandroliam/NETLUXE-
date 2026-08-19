# NETLUXE — Abonnement (v21)

## Flux utilisateur

```
Connexion (email)
   ↓
Abonnement  ← NOUVEAU
   ↓
Sélection du profil
   ↓
Application
```

L'écran d'abonnement n'apparaît que si aucune formule n'est active.
Une fois souscrit, la connexion mène directement aux profils.

---

## Les 3 formules

| | Découverte | Essentiel | Premium |
|---|---|---|---|
| Prix | Gratuit | 4,99 USD/mois | 9,99 USD/mois |
| Qualité | 480p | 1080p | 4K HDR |
| Écrans | 1 | 2 | 4 |
| Profils | 2 | 4 | 5 |
| Téléchargements | 0 | 10 | Illimités |
| Publicité | Oui | Non | Non |
| NETLUXE Originals | Non | Oui | Oui + avant-première |

---

## Limites réellement appliquées

Ce ne sont pas des mentions décoratives — le code les fait respecter :

| Fonction | Effet vérifié |
|---|---|
| `nxMaxProfiles()` | Bloque la création au-delà du quota, message nommant la formule |
| `nxCanWatchOriginals()` | `false` sur Découverte |
| `nxHasAds()` | `true` sur Découverte uniquement |
| `nxMaxQuality()` | 480p / 1080p / 4K HDR |

La tuile « Ajouter un profil » disparaît de la grille quand le quota est atteint.

---

## Cycle de vie

- **Souscription** : échéance à +1 mois (payant) ou +10 ans (gratuit)
- **Changement de plan** : échéance **recalculée** — un passage gratuit → payant ne conserve pas la date lointaine
- **Résiliation** : statut `cancelling`, `autoRenew = false`, mais **l'accès reste valide jusqu'à l'échéance** (période déjà payée)
- **Réactivation** : possible tant que l'échéance n'est pas passée
- **Expiration** : `nxHasSub()` renvoie `false` dès que la date est dépassée

Chaque opération est horodatée dans `sub.history`.

---

## Gestion depuis les Paramètres

Section **💳 Abonnement** : formule, statut, prix, qualité, écrans, profils, téléchargements, publicité, date de renouvellement, date de souscription.

Actions : changer de formule, résilier (avec confirmation nommant la date de fin), réactiver.

---

## ⚠️ Limite de sécurité — à lire avant toute mise en production

**L'état d'abonnement est stocké dans `localStorage`, donc côté client.**

Conséquence concrète : n'importe qui peut ouvrir la console du navigateur et se déclarer abonné Premium. C'est acceptable pour une démonstration, **pas pour encaisser de l'argent**.

Aucune donnée bancaire n'est demandée, transmise ni stockée. `paymentMethod` vaut `"simulation"`. Un avertissement le dit explicitement sur l'écran d'abonnement.

### Ce qu'il faudra pour encaisser réellement

1. **Firebase Auth** — comptes réels, mots de passe hashés côté serveur
2. **Firestore + règles de sécurité** — l'abonnement devient inaccessible en écriture depuis le client
3. **Stripe** (international) ou **MonCash** (Haïti) — traitement du paiement
4. **Cloud Function webhook** — seul le serveur de paiement peut activer un abonnement
5. **Vérification côté lecture** — le flux vidéo n'est servi qu'après validation serveur

Tant que ces cinq points ne sont pas en place, considérer l'abonnement comme une maquette fonctionnelle.

---

## Fichiers

| Fichier | Rôle |
|---|---|
| `subscription.js` | Plans, cycle de vie, limites |
| `subscription-ui.js` | Écran de sélection, confirmation, actions |
| `subscription.css` | Style des cartes de formule |
| `profiles-route.js` | Insertion de l'étape dans le flux |
| `app-settings.js` | Section Abonnement des Paramètres |

Clé de stockage : `netluxe_sub`, indexée par email — les comptes sont isolés (vérifié).
