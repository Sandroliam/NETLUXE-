/* ============================================
   NETLUXE — Abonnements : plans et logique
   Flux : Connexion → Abonnement → Profils → App

   AVERTISSEMENT TECHNIQUE : l'état d'abonnement est
   stocké côté client (localStorage). C'est une
   MAQUETTE FONCTIONNELLE : n'importe qui peut le
   modifier depuis la console du navigateur.
   Pour encaisser réellement, il faut Firebase Auth +
   Firestore avec règles serveur + Stripe/MonCash.
   Voir ABONNEMENT.md.
   ============================================ */

var NX_PLANS = [
  {
    id:'decouverte',
    name:'Découverte',
    price:0, currency:'USD', period:'',
    tagline:'Pour explorer NETLUXE',
    quality:'480p',
    screens:1, profiles:2, downloads:0,
    ads:true,
    features:[
      'Catalogue domaine public',
      'Publicité avant lecture',
      'Qualité standard 480p',
      '1 écran à la fois',
      '2 profils'
    ],
    limits:['Pas de NETLUXE Originals', 'Pas de téléchargement'],
    color:'#00CED1',
    badge:'GRATUIT'
  },
  {
    id:'essentiel',
    name:'Essentiel',
    price:4.99, currency:'USD', period:'mois',
    tagline:'L\'essentiel du cinéma caribéen',
    quality:'1080p',
    screens:2, profiles:4, downloads:10,
    ads:false,
    features:[
      'Tout le catalogue',
      'NETLUXE Originals inclus',
      'Sans publicité',
      'Haute définition 1080p',
      '2 écrans simultanés',
      '4 profils',
      '10 téléchargements'
    ],
    limits:[],
    color:'#D4AF37',
    badge:'POPULAIRE',
    recommended:true
  },
  {
    id:'premium',
    name:'Premium',
    price:9.99, currency:'USD', period:'mois',
    tagline:'L\'expérience NETLUXE complète',
    quality:'4K HDR',
    screens:4, profiles:5, downloads:-1,
    ads:false,
    features:[
      'Tout le catalogue',
      'NETLUXE Originals en avant-première',
      'Sans publicité',
      'Ultra HD 4K + HDR',
      '4 écrans simultanés',
      '5 profils',
      'Téléchargements illimités',
      'Accès NETLUXE Premiere anticipé'
    ],
    limits:[],
    color:'#FF6B35',
    badge:'4K'
  }
];

var NX_SUB_KEY = 'netluxe_sub';

/* Plan par identifiant */
function nxPlan(id){
  for(var i=0;i<NX_PLANS.length;i++){
    if(NX_PLANS[i].id === id) return NX_PLANS[i];
  }
  return null;
}

/* Abonnement courant du compte */
function nxSub(){
  try {
    var raw = localStorage.getItem(NX_SUB_KEY);
    if(!raw) return null;
    var all = JSON.parse(raw);
    var em = (typeof user !== 'undefined' && user) ? user.email : null;
    if(!em) return null;
    return all[em] || null;
  } catch(e){ return null; }
}

function nxSaveSub(sub){
  try {
    var raw = localStorage.getItem(NX_SUB_KEY);
    var all = raw ? JSON.parse(raw) : {};
    var em = (typeof user !== 'undefined' && user) ? user.email : null;
    if(!em) return false;
    all[em] = sub;
    localStorage.setItem(NX_SUB_KEY, JSON.stringify(all));
    return true;
  } catch(e){ return false; }
}

/* L'utilisateur a-t-il un abonnement actif ?
   Un abonnement résilié ('cancelling') reste VALIDE jusqu'à l'échéance :
   l'utilisateur a payé sa période, il garde l'accès. */
function nxHasSub(){
  var s = nxSub();
  if(!s || !s.planId) return false;
  if(s.status !== 'active' && s.status !== 'cancelling') return false;
  /* échéance dépassée ? */
  if(s.renewsAt){
    var d = new Date(s.renewsAt);
    if(!isNaN(d.getTime()) && d < new Date()) return false;
  }
  return true;
}

function nxCurrentPlan(){
  var s = nxSub();
  return s ? nxPlan(s.planId) : null;
}

/* Souscrire à un plan */
function nxSubscribe(planId){
  var p = nxPlan(planId);
  if(!p) return false;

  var now = new Date();
  var renew = new Date(now);
  if(p.price > 0) renew.setMonth(renew.getMonth() + 1);
  else renew.setFullYear(renew.getFullYear() + 10);   /* gratuit : pas d'échéance réelle */

  var sub = {
    planId: p.id,
    planName: p.name,
    price: p.price,
    currency: p.currency,
    status: 'active',
    startedAt: now.toISOString(),
    renewsAt: renew.toISOString(),
    autoRenew: p.price > 0,
    /* AUCUNE donnée de paiement n'est stockée ici — aucun paiement réel n'a lieu */
    paymentMethod: p.price > 0 ? 'simulation' : null,
    history: [{ at:now.toISOString(), action:'souscription', plan:p.name }]
  };
  return nxSaveSub(sub);
}

/* Changer de plan */
function nxChangePlan(planId){
  var cur = nxSub();
  var p = nxPlan(planId);
  if(!p) return false;
  if(!cur) return nxSubscribe(planId);

  cur.history = cur.history || [];
  cur.history.unshift({
    at:new Date().toISOString(),
    action:'changement de plan',
    from:cur.planName, plan:p.name
  });
  cur.planId = p.id;
  cur.planName = p.name;
  cur.price = p.price;
  cur.status = 'active';
  cur.autoRenew = p.price > 0;
  cur.paymentMethod = p.price > 0 ? 'simulation' : null;

  /* RECALCULER l'échéance : sinon un passage gratuit → payant
     conservait la date lointaine du plan gratuit (bug corrigé). */
  var now = new Date();
  var renew = new Date(now);
  if(p.price > 0) renew.setMonth(renew.getMonth() + 1);
  else renew.setFullYear(renew.getFullYear() + 10);
  cur.renewsAt = renew.toISOString();

  return nxSaveSub(cur);
}

/* Résilier — reste actif jusqu'à l'échéance */
function nxCancelSub(){
  var s = nxSub();
  if(!s) return false;
  s.autoRenew = false;
  s.status = 'cancelling';
  s.history = s.history || [];
  s.history.unshift({ at:new Date().toISOString(), action:'résiliation demandée', plan:s.planName });
  return nxSaveSub(s);
}

/* Réactiver */
function nxResumeSub(){
  var s = nxSub();
  if(!s) return false;
  s.autoRenew = true;
  s.status = 'active';
  s.history = s.history || [];
  s.history.unshift({ at:new Date().toISOString(), action:'réactivation', plan:s.planName });
  return nxSaveSub(s);
}

/* ---------- LIMITES RÉELLEMENT APPLIQUÉES ---------- */

/* Nombre de profils autorisés par le plan */
function nxMaxProfiles(){
  var p = nxCurrentPlan();
  return p ? p.profiles : 2;
}

/* Le plan donne-t-il accès aux Originals ? */
function nxCanWatchOriginals(){
  var p = nxCurrentPlan();
  if(!p) return false;
  return p.id !== 'decouverte';
}

/* Publicité avant lecture ? */
function nxHasAds(){
  var p = nxCurrentPlan();
  return p ? !!p.ads : true;
}

/* Qualité maximale autorisée */
function nxMaxQuality(){
  var p = nxCurrentPlan();
  return p ? p.quality : '480p';
}

/* Formatage du prix */
function nxFmtPrice(p){
  if(!p || p.price === 0) return 'Gratuit';
  return p.price.toFixed(2) + ' ' + p.currency + (p.period ? ' / ' + p.period : '');
}

/* Date lisible */
function nxFmtDate(iso){
  try {
    var d = new Date(iso);
    if(isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' });
  } catch(e){ return '—'; }
}
