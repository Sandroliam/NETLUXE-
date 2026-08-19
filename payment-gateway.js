/* ============================================
   NETLUXE — Passerelle de paiement (abstraction)

   PRINCIPE : cette couche définit le CONTRAT que devra
   respecter un vrai prestataire (Stripe, MonCash…).
   Tant qu'aucune clé API n'est configurée, la passerelle
   est DÉSACTIVÉE et refuse explicitement toute
   transaction. Elle ne renvoie JAMAIS un succès simulé.

   Aucune donnée de carte ne transite ni n'est stockée ici :
   la saisie se fera dans un champ hébergé par le
   prestataire (Stripe Elements / SDK MonCash).
   ============================================ */

var NX_PAY_CFG_KEY = 'netluxe_payment_config';

/* Prestataires prévus. enabled:false = non activé. */
var NX_PROVIDERS = {
  stripe: {
    id:'stripe', name:'Stripe', enabled:false,
    methods:['card','visa','mastercard','apple_pay','google_pay'],
    currencies:['USD','EUR','CAD'],
    supportsRecurring:true, supportsWebhooks:true,
    /* champs à renseigner pour l'activation */
    requiredKeys:['publishableKey','secretKey','webhookSecret'],
    docs:'https://stripe.com/docs',
    regions:['international']
  },
  moncash: {
    id:'moncash', name:'MonCash (Digicel Haïti)', enabled:false,
    methods:['mobile_wallet'],
    currencies:['HTG','USD'],
    supportsRecurring:false,   /* MonCash ne gère pas le prélèvement récurrent */
    supportsWebhooks:true,
    requiredKeys:['clientId','clientSecret'],
    docs:'https://sandbox.moncashbutton.digicelgroup.com',
    regions:['HT']
  },
  paypal: {
    id:'paypal', name:'PayPal', enabled:false,
    methods:['paypal','card'],
    currencies:['USD','EUR'],
    supportsRecurring:true, supportsWebhooks:true,
    requiredKeys:['clientId','clientSecret','webhookId'],
    docs:'https://developer.paypal.com',
    regions:['international']
  }
};

/* Configuration locale (aucune clé secrète ne doit vivre côté client :
   seule la clé PUBLIABLE est admissible ici). */
function nxPayConfig(){
  try {
    var raw = localStorage.getItem(NX_PAY_CFG_KEY);
    if(raw) return JSON.parse(raw);
  } catch(e){}
  return {
    activeProvider:null,
    publishableKey:'',
    mode:'test',            /* test | live */
    backendUrl:'',          /* obligatoire : le serveur crée les intentions de paiement */
    webhookConfigured:false
  };
}

function nxSavePayConfig(cfg){
  try { localStorage.setItem(NX_PAY_CFG_KEY, JSON.stringify(cfg)); return true; }
  catch(e){ return false; }
}

/* ---------- ÉTAT D'ACTIVATION ---------- */

/* La passerelle est-elle réellement opérationnelle ?
   Il faut : un prestataire actif + une clé publiable + une URL de backend. */
function nxPayEnabled(){
  var cfg = nxPayConfig();
  if(!cfg.activeProvider) return false;
  var p = NX_PROVIDERS[cfg.activeProvider];
  if(!p || !p.enabled) return false;
  if(!cfg.publishableKey) return false;
  if(!cfg.backendUrl) return false;
  return true;
}

/* Diagnostic lisible : ce qui manque exactement */
function nxPayStatus(){
  var cfg = nxPayConfig();
  var missing = [];
  if(!cfg.activeProvider) missing.push('aucun prestataire sélectionné');
  else {
    var p = NX_PROVIDERS[cfg.activeProvider];
    if(!p) missing.push('prestataire inconnu');
    else if(!p.enabled) missing.push('prestataire non activé (compte marchand requis)');
  }
  if(!cfg.publishableKey) missing.push('clé publiable absente');
  if(!cfg.backendUrl) missing.push('URL du serveur de paiement absente');
  if(!cfg.webhookConfigured) missing.push('webhook non configuré');

  return {
    enabled: nxPayEnabled(),
    provider: cfg.activeProvider,
    providerName: (cfg.activeProvider && NX_PROVIDERS[cfg.activeProvider])
                  ? NX_PROVIDERS[cfg.activeProvider].name : null,
    mode: cfg.mode,
    missing: missing,
    message: nxPayEnabled()
      ? 'Paiement opérationnel'
      : 'Les abonnements seront bientôt disponibles. Le système de paiement est actuellement en cours d\'activation.'
  };
}

/* ---------- CONTRAT DE LA PASSERELLE ---------- */

/* Codes de retour normalisés — un seul chemin mène à l'activation :
   la confirmation signée du prestataire, reçue par webhook. */
var NX_PAY_RESULT = {
  GATEWAY_DISABLED:  'GATEWAY_DISABLED',
  REQUIRES_ACTION:   'REQUIRES_ACTION',
  PENDING:           'PENDING',
  SUCCEEDED:         'SUCCEEDED',
  FAILED:            'FAILED',
  CANCELED:          'CANCELED'
};

/* Créer une intention de paiement.
   IMPORTANT : cet appel doit être fait par le SERVEUR. Le client ne
   fait que transmettre l'identifiant du forfait. Aucune somme n'est
   décidée côté client (sinon un utilisateur pourrait payer 0,01 $). */
function nxCreatePaymentIntent(planId, billing){
  var st = nxPayStatus();
  if(!st.enabled){
    return {
      ok:false,
      code:NX_PAY_RESULT.GATEWAY_DISABLED,
      message:st.message,
      missing:st.missing
    };
  }

  /* Chemin réel, une fois le backend en place :
     POST {backendUrl}/create-intent  { planId, billing, userId }
     → { clientSecret, intentId }
     Le montant est calculé et signé côté serveur. */
  var cfg = nxPayConfig();
  return {
    ok:false,
    code:NX_PAY_RESULT.PENDING,
    message:'Appel serveur requis : ' + cfg.backendUrl + '/create-intent',
    contract:{
      endpoint:cfg.backendUrl + '/create-intent',
      method:'POST',
      body:{ planId:planId, billing:billing, userId:'<uid serveur>' },
      expects:{ clientSecret:'string', intentId:'string' }
    }
  };
}

/* Confirmer un paiement — jamais côté client seul.
   Le statut final ne peut venir QUE du webhook prestataire. */
function nxConfirmPayment(intentId){
  var st = nxPayStatus();
  if(!st.enabled){
    return { ok:false, code:NX_PAY_RESULT.GATEWAY_DISABLED, message:st.message };
  }
  return {
    ok:false,
    code:NX_PAY_RESULT.PENDING,
    message:'En attente de la confirmation du prestataire (webhook).',
    note:'NETLUXE n\'active un abonnement que sur événement signé du prestataire.'
  };
}

/* Moyens de paiement réellement disponibles */
function nxAvailableMethods(){
  var cfg = nxPayConfig();
  if(!cfg.activeProvider) return [];
  var p = NX_PROVIDERS[cfg.activeProvider];
  if(!p || !p.enabled) return [];
  return p.methods.slice();
}

/* Libellés lisibles des moyens de paiement */
var NX_METHOD_LABELS = {
  card:'Carte bancaire', visa:'Visa', mastercard:'Mastercard',
  apple_pay:'Apple Pay', google_pay:'Google Pay',
  mobile_wallet:'Portefeuille mobile', paypal:'PayPal'
};

/* ---------- WEBHOOK : point d'entrée serveur ---------- */

/* Documente la charge utile attendue. Cette fonction ne DOIT PAS être
   appelable depuis le client en production : elle est ici pour décrire
   le contrat et permettre les tests hors ligne. */
function nxWebhookContract(){
  return {
    endpoint:'POST /netluxe/webhook/:provider',
    security:'Vérification de la signature (Stripe-Signature / HMAC MonCash) OBLIGATOIRE',
    events:{
      'payment_intent.succeeded':   'active l\'abonnement, statut ACTIVE',
      'payment_intent.payment_failed':'statut PAYMENT_FAILED, période de grâce',
      'invoice.paid':               'prolonge la période, ajoute une facture',
      'invoice.payment_failed':     'statut PAYMENT_FAILED',
      'customer.subscription.deleted':'statut CANCELED',
      'charge.refunded':            'statut INACTIVE, accès révoqué'
    },
    idempotency:'Stocker l\'identifiant d\'événement ; ignorer les doublons',
    ordering:'Se fier à l\'horodatage du prestataire, pas à l\'ordre de réception'
  };
}
