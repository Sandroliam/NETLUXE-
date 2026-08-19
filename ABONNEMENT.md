# NETLUXE — Architecture d'abonnement (v22)

> Système conçu pour la production. Le paiement est **en attente d'activation** :
> aucune transaction n'est simulée, aucun faux succès n'est possible.

---

## Principe directeur

**Un seul chemin mène à un abonnement actif : la confirmation signée du prestataire de paiement, reçue par webhook.**

Aucun bouton de l'interface, aucune fonction appelable depuis le client ne peut activer un forfait payant. C'est vérifié par test automatisé.

---

## Fichiers

| Fichier | Rôle |
|---|---|
| `subscription-config.js` | Forfaits stockés en **données** (`netluxe_plans`), modifiables sans toucher au code |
| `payment-gateway.js` | Abstraction prestataire : Stripe, MonCash, PayPal — tous `enabled:false` |
| `subscription-state.js` | Machine à états, calcul du statut effectif, vérification d'accès |
| `subscription-actions.js` | Transitions : demande, webhooks, résiliation, changement |
| `subscription-ui.js` | Écran en 3 vues : forfaits → confirmation → état réel |
| `subscription-mysub.js` | « Mon abonnement » + historique des transactions |
| `premium-gate.js` | Barrière expliquant le blocage avec sa raison exacte |

---

## Les 6 statuts

| Statut | Accès premium | Signification |
|---|---|---|
| `INACTIVE` | ❌ | Aucun abonnement |
| `PENDING_PAYMENT` | ❌ | Paiement engagé, **non confirmé** |
| `ACTIVE` | ✅ | Confirmé par le prestataire |
| `PAYMENT_FAILED` | ✅ | Échec — accès pendant la grâce (7 j) |
| `CANCELED` | ✅ | Résilié — accès jusqu'à l'expiration |
| `EXPIRED` | ❌ | Échéance dépassée |

Le statut stocké peut être périmé : `nxSubStatus()` recalcule le statut **réel** à chaque appel en comparant les dates. Un `CANCELED` dont l'échéance est passée devient `EXPIRED` automatiquement.

---

## Forfaits configurables

Trois forfaits d'amorçage, puis tout est modifiable :

| | Découverte | Essentiel | Premium |
|---|---|---|---|
| Mensuel | Gratuit | 4,99 USD | 9,99 USD |
| Annuel | — | 49,90 USD (−17 %) | 99,90 USD (−17 %) |
| Qualité | 480p | 1080p | 4K HDR |
| Écrans | 1 | 2 | 4 |
| Profils | 2 | 4 | 5 |
| Originals | ❌ | ✅ | ✅ |

**API d'administration :**

```js
nxAllPlans()                          // tous, y compris inactifs
nxPublicPlans()                       // uniquement actifs
nxUpsertPlan({id:'essentiel', priceMonthly:5.99})
nxSetPlanActive('premium', false)     // retire de la vente
nxDeletePlan('id')
nxResetPlans()                        // retour à l'amorçage
```

Vérifié : désactiver Premium le retire immédiatement de l'écran public.

---

## Vérification d'accès

```js
nxSubStatus()          // statut réel, recalculé
nxHasPremiumAccess()   // le statut autorise-t-il l'accès ?
nxPlanGivesPremium()   // le forfait comprend-il le premium ?
nxCanWatchPremium()    // les deux à la fois
nxCanWatch(item)       // décision pour un contenu donné
```

Le lecteur appelle `nxCanWatch()` **avant** d'ouvrir. Un Original sans forfait valide déclenche la barrière premium — pas un lecteur vide.

Le **domaine public reste toujours accessible**, sans abonnement.

---

## Activation du paiement

### État actuel

```
activeProvider : aucun
publishableKey : absente
backendUrl     : absente
webhook        : non configuré
```

`nxPayEnabled()` renvoie `false`. Toute demande payante retourne `GATEWAY_DISABLED` et l'utilisateur voit : *« Les abonnements seront bientôt disponibles. Le système de paiement est actuellement en cours d'activation. »*

### Les 5 étapes pour activer

**1. Compte marchand**
Stripe (international) ou MonCash (Haïti). MonCash ne gère pas le prélèvement récurrent — prévoir un renouvellement manuel ou Stripe en complément.

**2. Serveur backend** — obligatoire
Le montant ne doit **jamais** être décidé côté client, sinon un utilisateur paierait 0,01 $.

```
POST /create-intent   { planId, billing, userId }
  → le serveur lit le prix depuis SA base
  → crée l'intention chez le prestataire
  → renvoie { clientSecret, intentId }
```

**3. Webhook signé**

```
POST /netluxe/webhook/:provider
```

Vérification de signature **obligatoire** (`Stripe-Signature` / HMAC MonCash). Sans elle, n'importe qui pourrait activer un abonnement par simple requête HTTP.

| Événement | Effet |
|---|---|
| `payment_intent.succeeded` | → `ACTIVE` |
| `payment_intent.payment_failed` | → `PAYMENT_FAILED`, grâce ouverte |
| `invoice.paid` | prolonge, ajoute une facture |
| `customer.subscription.deleted` | → `CANCELED` |
| `charge.refunded` | → `INACTIVE`, accès révoqué |

Stocker l'identifiant d'événement pour l'idempotence. Se fier à l'horodatage du prestataire, pas à l'ordre de réception.

**4. Configuration**

```js
nxSavePayConfig({
  activeProvider:'stripe',
  publishableKey:'pk_live_...',   // clé PUBLIABLE uniquement
  backendUrl:'https://api.netluxe.ht',
  mode:'live',
  webhookConfigured:true
});
NX_PROVIDERS.stripe.enabled = true;
```

**5. Migration du stockage**
Remplacer `localStorage` par Firestore avec règles serveur :

```
match /subscriptions/{uid} {
  allow read: if request.auth.uid == uid;
  allow write: if false;   // seul le webhook écrit
}
```

---

## Sécurité des données de paiement

**Aucune donnée bancaire ne transite par NETLUXE.** La saisie se fera dans un champ hébergé par le prestataire (Stripe Elements / SDK MonCash).

Ce qui est stocké : identifiant de forfait, montant, devise, statut, référence prestataire, **type** de moyen de paiement. Jamais de numéro, CVV, IBAN ni date d'expiration.

Vérifié par test : 0 champ sensible dans le stockage.

---

## ⚠️ Limite actuelle

Le stockage reste `localStorage`, donc modifiable depuis la console du navigateur. Les statuts et la logique sont corrects, mais **la persistance n'est pas encore sécurisée**.

C'est acceptable tant que le paiement est inactif — il n'y a rien à frauder. Dès l'activation, l'étape 5 (Firestore + règles) devient obligatoire.
