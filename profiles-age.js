/* ============================================
   NETLUXE — Tranches d'âge des profils
   Libellé affiché sous chaque nom, et plafond de
   classification réellement appliqué au catalogue.
   ============================================ */

var NX_AGE_GROUPS = {
  adult: { key:'adult', label:'Adulte',      maxRating:'18+', minAge:18, order:1 },
  teen:  { key:'teen',  label:'Adolescent',  maxRating:'16+', minAge:13, order:2 },
  teenF: { key:'teenF', label:'Adolescente', maxRating:'16+', minAge:13, order:3 },
  child: { key:'child', label:'Enfant',      maxRating:'10+', minAge:7,  order:4 },
  kids:  { key:'kids',  label:'Mode Kids',   maxRating:'6+',  minAge:0,  order:5 }
};

/* Tranche d'âge d'un profil, avec repli cohérent sur son type */
function nxAgeGroup(p){
  var prf = p || (typeof prof !== 'undefined' ? prof : null);
  if(!prf) return NX_AGE_GROUPS.adult;
  if(prf.ageGroup && NX_AGE_GROUPS[prf.ageGroup]) return NX_AGE_GROUPS[prf.ageGroup];
  /* profils créés avant cette version : déduire du type */
  if(prf.ptype === 'kids') return NX_AGE_GROUPS.kids;
  return NX_AGE_GROUPS.adult;
}

function nxAgeLabel(p){ return nxAgeGroup(p).label; }

/* Plafond de classification effectif : la tranche d'âge du profil,
   éventuellement resserrée par le réglage manuel des paramètres. */
function nxRatingCap(p){
  var g = nxAgeGroup(p);
  var cap = g.maxRating;
  var prf = p || (typeof prof !== 'undefined' ? prof : null);
  if(prf && prf.prefs && prf.prefs.maxRating){
    var manual = prf.prefs.maxRating;
    if(typeof NX_RATINGS !== 'undefined' && NX_RATINGS[manual] && NX_RATINGS[cap]){
      /* on garde le plus restrictif des deux */
      if(NX_RATINGS[manual].min < NX_RATINGS[cap].min) cap = manual;
    }
  }
  return cap;
}

function nxRatingCapAge(p){
  var cap = nxRatingCap(p);
  if(typeof NX_RATINGS !== 'undefined' && NX_RATINGS[cap]) return NX_RATINGS[cap].min;
  return 18;
}

/* Un contenu est-il autorisé pour ce profil ? */
function nxAgeAllows(c, p){
  if(!c) return false;
  var limit = nxRatingCapAge(p);
  var need = (c.minAge === undefined || c.minAge === null) ? 0 : c.minAge;
  return need <= limit;
}

/* Icône associée à la tranche, pour l'affichage */
function nxAgeIcon(key){
  var map = { adult:'👤', teen:'🧑', teenF:'🧑', child:'🧒', kids:'👶' };
  return map[key] || '👤';
}

/* Description courte affichée sous le libellé */
function nxAgeDesc(key){
  var map = {
    adult:'Tous les contenus',
    teen:'Contenus 16+ maximum',
    teenF:'Contenus 16+ maximum',
    child:'Contenus 10+ maximum',
    kids:'Contenus jeunesse'
  };
  return map[key] || '';
}

/* Tranches proposées à la création d'un profil */
function nxAgeOptions(){
  var out = [];
  for(var k in NX_AGE_GROUPS){
    if(NX_AGE_GROUPS.hasOwnProperty(k)) out.push(NX_AGE_GROUPS[k]);
  }
  return out.sort(function(a,b){ return a.order - b.order; });
}
