/* ============================================
   NETLUXE — Abonnements : machine à états

   STATUTS (exigence produit) :
     INACTIVE        aucun abonnement — pas d'accès premium
     PENDING_PAYMENT paiement engagé, non confirmé — PAS d'accès
     ACTIVE          confirmé par le prestataire — accès premium
     PAYMENT_FAILED  échec de renouvellement — accès pendant la grâce
     CANCELED        résilié — accès jusqu'à la date d'expiration
     EXPIRED         échéance dépassée — accès bloqué

   RÈGLE ABSOLUE : seul un événement signé du prestataire
   (webhook) fait passer un abonnement en ACTIVE. Aucun
   chemin client ne peut l'activer.
   ============================================ */

var NX_SUB_KEY   = 'netluxe_subscriptions';
var NX_TX_KEY    = 'netluxe_transactions';
var NX_GRACE_DAYS = 7;   /* période de grâce après échec de paiement */

var NX_SUB_STATUS = {
  INACTIVE:'INACTIVE', PENDING_PAYMENT:'PENDING_PAYMENT', ACTIVE:'ACTIVE',
  PAYMENT_FAILED:'PAYMENT_FAILED', CANCELED:'CANCELED', EXPIRED:'EXPIRED'
};

var NX_SUB_LABELS = {
  INACTIVE:       { txt:'Aucun abonnement',      cls:'inactive' },
  PENDING_PAYMENT:{ txt:'En attente de paiement', cls:'pending' },
  ACTIVE:         { txt:'Actif',                 cls:'active' },
  PAYMENT_FAILED: { txt:'Paiement échoué',       cls:'failed' },
  CANCELED:       { txt:'Résilié',               cls:'canceled' },
  EXPIRED:        { txt:'Expiré',                cls:'expired' }
};

/* ---------- PERSISTANCE ---------- */

function nxUid(){
  if(typeof user !== 'undefined' && user && user.email) return user.email;
  return null;
}

function nxAllSubs(){
  try {
    var raw = localStorage.getItem(NX_SUB_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch(e){ return {}; }
}

function nxWriteSubs(all){
  try { localStorage.setItem(NX_SUB_KEY, JSON.stringify(all)); return true; }
  catch(e){ return false; }
}

/* Enregistrement d'abonnement de l'utilisateur courant */
function nxSubRecord(){
  var uid = nxUid();
  if(!uid) return null;
  var all = nxAllSubs();
  return all[uid] || null;
}

function nxWriteSub(rec){
  var uid = nxUid();
  if(!uid) return false;
  var all = nxAllSubs();
  all[uid] = rec;
  return nxWriteSubs(all);
}

/* ---------- TRANSACTIONS ---------- */

function nxAllTx(){
  try {
    var raw = localStorage.getItem(NX_TX_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch(e){ return {}; }
}

function nxTxHistory(){
  var uid = nxUid();
  if(!uid) return [];
  var all = nxAllTx();
  return (all[uid] || []).slice().sort(function(a,b){
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
}

/* Journalise une tentative ou un événement de paiement.
   Aucune donnée de carte n'y figure : uniquement des références. */
function nxLogTx(entry){
  var uid = nxUid();
  if(!uid) return false;
  var all = nxAllTx();
  if(!all[uid]) all[uid] = [];
  all[uid].unshift({
    id: entry.id || ('tx_' + Date.now()),
    createdAt: new Date().toISOString(),
    planId: entry.planId || null,
    planName: entry.planName || null,
    billing: entry.billing || null,
    amount: (typeof entry.amount === 'number') ? entry.amount : null,
    currency: entry.currency || null,
    status: entry.status || 'PENDING',
    provider: entry.provider || null,
    providerRef: entry.providerRef || null,   /* identifiant côté prestataire */
    method: entry.method || null,             /* type de moyen, jamais le numéro */
    invoiceUrl: entry.invoiceUrl || null,
    note: entry.note || null
  });
  if(all[uid].length > 200) all[uid] = all[uid].slice(0,200);
  try { localStorage.setItem(NX_TX_KEY, JSON.stringify(all)); return true; }
  catch(e){ return false; }
}

/* ---------- CALCUL DU STATUT EFFECTIF ---------- */

/* Le statut stocké peut être périmé (échéance passée). Cette fonction
   renvoie le statut RÉEL au moment de l'appel. */
function nxSubStatus(){
  var r = nxSubRecord();
  if(!r || !r.planId) return NX_SUB_STATUS.INACTIVE;

  var now = new Date();
  var exp = r.expiresAt ? new Date(r.expiresAt) : null;
  var expired = exp && !isNaN(exp.getTime()) && exp < now;

  /* échec de paiement : accès maintenu pendant la grâce */
  if(r.status === NX_SUB_STATUS.PAYMENT_FAILED){
    var g = r.graceUntil ? new Date(r.graceUntil) : null;
    if(g && !isNaN(g.getTime()) && g >= now) return NX_SUB_STATUS.PAYMENT_FAILED;
    return NX_SUB_STATUS.EXPIRED;
  }

  if(r.status === NX_SUB_STATUS.CANCELED){
    return expired ? NX_SUB_STATUS.EXPIRED : NX_SUB_STATUS.CANCELED;
  }
  if(r.status === NX_SUB_STATUS.ACTIVE){
    return expired ? NX_SUB_STATUS.EXPIRED : NX_SUB_STATUS.ACTIVE;
  }
  /* PENDING_PAYMENT / INACTIVE / EXPIRED : tels quels */
  return r.status || NX_SUB_STATUS.INACTIVE;
}

/* ---------- VÉRIFICATION D'ACCÈS ---------- */

/* L'utilisateur a-t-il droit au contenu premium MAINTENANT ? */
function nxHasPremiumAccess(){
  var st = nxSubStatus();
  if(st === NX_SUB_STATUS.ACTIVE) return true;
  if(st === NX_SUB_STATUS.CANCELED) return true;        /* jusqu'à l'expiration */
  if(st === NX_SUB_STATUS.PAYMENT_FAILED) return true;  /* période de grâce */
  return false;   /* INACTIVE, PENDING_PAYMENT, EXPIRED */
}

/* Le forfait souscrit donne-t-il accès au premium ? */
function nxPlanGivesPremium(){
  var r = nxSubRecord();
  if(!r) return false;
  var p = nxPlan(r.planId);
  return !!(p && p.premiumAccess);
}

/* Accès effectif : statut valide ET forfait premium */
function nxCanWatchPremium(){
  return nxHasPremiumAccess() && nxPlanGivesPremium();
}

/* Un contenu donné est-il accessible ? */
function nxCanWatch(item){
  if(!item) return false;
  /* le domaine public reste toujours accessible */
  if(item.source === 'Internet Archive') return true;
  /* les Originals NETLUXE exigent un forfait premium */
  if(item.org) return nxCanWatchPremium();
  return true;
}

/* Forfait courant, ou forfait gratuit par défaut */
function nxCurrentPlan(){
  var r = nxSubRecord();
  if(r && r.planId){
    var p = nxPlan(r.planId);
    if(p) return p;
  }
  return null;
}

/* Limites : repli sur le forfait gratuit si aucun abonnement valide */
function nxEffectivePlan(){
  var p = nxCurrentPlan();
  if(p && nxHasPremiumAccess()) return p;
  /* pas d'accès : on retombe sur le premier forfait gratuit actif */
  var pub = (typeof nxPublicPlans === 'function') ? nxPublicPlans() : [];
  for(var i=0;i<pub.length;i++){
    if(!pub[i].requiresPayment) return pub[i];
  }
  return p;
}

function nxMaxProfiles(){
  var p = nxEffectivePlan();
  return p ? (p.profiles || 2) : 2;
}
function nxCanWatchOriginals(){ return nxCanWatchPremium(); }
function nxHasAds(){
  var p = nxEffectivePlan();
  return p ? !!p.ads : true;
}
function nxMaxQuality(){
  var p = nxEffectivePlan();
  return p ? (p.quality || '480p') : '480p';
}

/* ---------- FORMATAGE ---------- */

function nxFmtDate(iso){
  try {
    var d = new Date(iso);
    if(isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' });
  } catch(e){ return '—'; }
}

function nxDaysLeft(iso){
  try {
    var d = new Date(iso);
    if(isNaN(d.getTime())) return null;
    return Math.ceil((d - new Date()) / 86400000);
  } catch(e){ return null; }
}
