/* ============================================
   NETLUXE — Configuration des forfaits
   Les forfaits sont des DONNÉES, pas du code : ils sont
   stockés et modifiables depuis l'espace administrateur.
   Ce fichier ne fournit que les valeurs d'amorçage.
   ============================================ */

var NX_PLANS_KEY = 'netluxe_plans';
var NX_BILLING = { monthly:{ key:'monthly', label:'Mensuel', months:1 },
                   annual:{ key:'annual',  label:'Annuel',  months:12 } };

/* Amorçage : utilisé uniquement si aucun forfait n'est encore enregistré */
var NX_PLANS_SEED = [
  {
    id:'decouverte', name:'Découverte', active:true, order:1,
    priceMonthly:0, priceAnnual:0, currency:'USD',
    requiresPayment:false,
    tagline:'Pour explorer NETLUXE',
    quality:'480p', screens:1, profiles:2, downloads:0, ads:true,
    premiumAccess:false,
    features:['Catalogue domaine public','Qualité standard 480p','1 écran','2 profils'],
    limits:['Publicité avant lecture','Pas de NETLUXE Originals','Pas de téléchargement'],
    color:'#00CED1', badge:'GRATUIT'
  },
  {
    id:'essentiel', name:'Essentiel', active:true, order:2,
    priceMonthly:4.99, priceAnnual:49.90, currency:'USD',
    requiresPayment:true,
    tagline:"L'essentiel du cinéma caribéen",
    quality:'1080p', screens:2, profiles:4, downloads:10, ads:false,
    premiumAccess:true,
    features:['Tout le catalogue','NETLUXE Originals inclus','Sans publicité',
              'Haute définition 1080p','2 écrans simultanés','4 profils','10 téléchargements'],
    limits:[],
    color:'#D4AF37', badge:'POPULAIRE', recommended:true
  },
  {
    id:'premium', name:'Premium', active:true, order:3,
    priceMonthly:9.99, priceAnnual:99.90, currency:'USD',
    requiresPayment:true,
    tagline:"L'expérience NETLUXE complète",
    quality:'4K HDR', screens:4, profiles:5, downloads:-1, ads:false,
    premiumAccess:true,
    features:['Tout le catalogue','NETLUXE Originals en avant-première','Sans publicité',
              'Ultra HD 4K + HDR','4 écrans simultanés','5 profils',
              'Téléchargements illimités','Accès NETLUXE Premiere anticipé'],
    limits:[],
    color:'#FF6B35', badge:'4K'
  }
];

/* ---------- LECTURE / ÉCRITURE ---------- */

function nxLoadPlans(){
  try {
    var raw = localStorage.getItem(NX_PLANS_KEY);
    if(raw){
      var arr = JSON.parse(raw);
      if(Array.isArray(arr) && arr.length) return arr;
    }
  } catch(e){}
  /* premier lancement : semer la configuration */
  try { localStorage.setItem(NX_PLANS_KEY, JSON.stringify(NX_PLANS_SEED)); } catch(e){}
  return JSON.parse(JSON.stringify(NX_PLANS_SEED));
}

function nxSavePlans(arr){
  if(!Array.isArray(arr)) return false;
  try { localStorage.setItem(NX_PLANS_KEY, JSON.stringify(arr)); return true; }
  catch(e){ return false; }
}

/* Tous les forfaits, ordonnés */
function nxAllPlans(){
  return nxLoadPlans().slice().sort(function(a,b){
    return (a.order || 99) - (b.order || 99);
  });
}

/* Forfaits proposés au public : uniquement les actifs */
function nxPublicPlans(){
  return nxAllPlans().filter(function(p){ return p.active !== false; });
}

function nxPlan(id){
  var all = nxAllPlans();
  for(var i=0;i<all.length;i++){ if(all[i].id === id) return all[i]; }
  return null;
}

/* ---------- ÉDITION (espace administrateur) ---------- */

function nxUpsertPlan(plan){
  if(!plan || !plan.id) return false;
  var all = nxAllPlans(), found = false;
  for(var i=0;i<all.length;i++){
    if(all[i].id === plan.id){
      /* fusion : on conserve les champs non fournis */
      for(var k in plan){ if(plan.hasOwnProperty(k)) all[i][k] = plan[k]; }
      found = true; break;
    }
  }
  if(!found) all.push(plan);
  return nxSavePlans(all);
}

function nxSetPlanActive(id, active){
  var p = nxPlan(id);
  if(!p) return false;
  return nxUpsertPlan({ id:id, active:!!active });
}

function nxDeletePlan(id){
  var all = nxAllPlans().filter(function(p){ return p.id !== id; });
  return nxSavePlans(all);
}

function nxResetPlans(){
  try { localStorage.removeItem(NX_PLANS_KEY); } catch(e){}
  return nxLoadPlans();
}

/* ---------- PRIX ---------- */

/* Prix d'un forfait pour une périodicité donnée */
function nxPlanPrice(plan, billing){
  if(!plan) return 0;
  var b = billing || 'monthly';
  var v = (b === 'annual') ? plan.priceAnnual : plan.priceMonthly;
  return (typeof v === 'number') ? v : 0;
}

/* Économie réalisée en annuel, en pourcentage */
function nxAnnualSaving(plan){
  if(!plan || !plan.priceMonthly || !plan.priceAnnual) return 0;
  var full = plan.priceMonthly * 12;
  if(full <= 0) return 0;
  var save = ((full - plan.priceAnnual) / full) * 100;
  return save > 0 ? Math.round(save) : 0;
}

function nxFmtAmount(amount, currency){
  var cur = currency || 'USD';
  var n = (typeof amount === 'number') ? amount : 0;
  if(n === 0) return 'Gratuit';
  return n.toFixed(2) + ' ' + cur;
}

function nxFmtPlanPrice(plan, billing){
  var v = nxPlanPrice(plan, billing);
  if(v === 0) return 'Gratuit';
  var per = (billing === 'annual') ? 'an' : 'mois';
  return nxFmtAmount(v, plan.currency) + ' / ' + per;
}
