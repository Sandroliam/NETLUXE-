/* ============================================
   NETLUXE — Moteur de recherche et recommandations
   Recherche tolérante (accents, pluriels), scoring
   par pertinence, filtres réels, reco par profil.
   ============================================ */

/* Normalise : minuscules, sans accents, sans ponctuation */
function nxNorm(s){
  if(s == null) return '';
  var t = String(s).toLowerCase();
  /* décomposition Unicode si disponible */
  if(t.normalize) t = t.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  else {
    t = t.replace(/[àâä]/g,'a').replace(/[éèêë]/g,'e').replace(/[îï]/g,'i')
         .replace(/[ôö]/g,'o').replace(/[ùûü]/g,'u').replace(/ç/g,'c');
  }
  /* tirets typographiques, apostrophes courbes, ponctuation → espace */
  return t.replace(/[’'\u2010-\u2015\u2212\-_.,:;!?()\[\]«»"]/g, ' ')
          .replace(/\s+/g, ' ').trim();
}

/* État des filtres actifs */
var NXS = {
  q: '',
  type: 'all',       /* all | film | series | cartoon */
  region: 'all',     /* all | caribbean | africa | latam | europe | asia | america */
  rating: 'all',     /* all | TP | 6+ | 10+ | 12+ | 16+ */
  duration: 'all',   /* all | short (<60) | medium (60-120) | long (>120) */
  sort: 'relevance', /* relevance | recent | rated | popular | az */
  origOnly: false
};

function nxSearchReset(){
  NXS.q = ''; NXS.type = 'all'; NXS.region = 'all';
  NXS.rating = 'all'; NXS.duration = 'all';
  NXS.sort = 'relevance'; NXS.origOnly = false;
}

function nxActiveFilterCount(){
  var n = 0;
  if(NXS.type !== 'all') n++;
  if(NXS.region !== 'all') n++;
  if(NXS.rating !== 'all') n++;
  if(NXS.duration !== 'all') n++;
  if(NXS.origOnly) n++;
  return n;
}

/* ---------- SCORING ---------- */
/* Renvoie un score de pertinence, 0 = pas de correspondance */
function nxScore(c, terms){
  if(!terms.length) return 1;   /* pas de requête : tout passe */

  var title  = nxNorm(c.title);
  var genre  = nxNorm(c.genre);
  var desc   = nxNorm(c.desc);
  var cast   = nxNorm((c.cast || []).join(' '));
  var dir    = nxNorm(c.crew ? (c.crew.dir || '') : (c.dir || ''));
  var tags   = nxNorm((c.tags || []).join(' '));
  var country = '';
  if(typeof NX_COUNTRIES !== 'undefined' && NX_COUNTRIES[c.country]){
    country = nxNorm(NX_COUNTRIES[c.country].name);
  }
  var year   = String(c.year || '');

  var total = 0;
  for(var i=0;i<terms.length;i++){
    var t = terms[i], s = 0;

    if(title === t)                    s = 100;
    else if(title.indexOf(t) === 0)    s = 70;
    else if(title.indexOf(t) !== -1)   s = 50;

    if(!s && cast.indexOf(t) !== -1)    s = 34;
    if(!s && dir.indexOf(t) !== -1)     s = 32;
    if(!s && genre.indexOf(t) !== -1)   s = 26;
    if(!s && tags.indexOf(t) !== -1)    s = 22;
    if(!s && country.indexOf(t) !== -1) s = 20;
    if(!s && year.indexOf(t) !== -1)    s = 18;
    if(!s && desc.indexOf(t) !== -1)    s = 10;

    if(!s) return 0;   /* tous les termes doivent correspondre */
    total += s;
  }

  /* bonus éditoriaux */
  if(c.org) total += 8;
  if(c.topRank) total += (11 - c.topRank);
  if(c.rat) total += c.rat;

  return total;
}

/* ---------- APPLICATION DES FILTRES ---------- */
function nxPassFilters(c){
  if(NXS.type !== 'all' && c.type !== NXS.type) return false;
  if(NXS.region !== 'all' && c.region !== NXS.region) return false;
  if(NXS.origOnly && !c.org) return false;

  if(NXS.rating !== 'all'){
    var lim = (typeof NX_RATINGS !== 'undefined' && NX_RATINGS[NXS.rating])
              ? NX_RATINGS[NXS.rating].min : 99;
    if((c.minAge === undefined ? 0 : c.minAge) > lim) return false;
  }

  if(NXS.duration !== 'all'){
    var d = c.durMin || 0;
    /* les séries n'ont pas de durée unitaire : on les garde sauf filtre strict */
    if(!d) return NXS.duration === 'all';
    if(NXS.duration === 'short'  && d >= 60) return false;
    if(NXS.duration === 'medium' && (d < 60 || d > 120)) return false;
    if(NXS.duration === 'long'   && d <= 120) return false;
  }
  return true;
}

/* ---------- TRI ---------- */
function nxSortResults(list){
  var s = NXS.sort;
  return list.sort(function(a,b){
    if(s === 'recent')  return (b.c.year||0) - (a.c.year||0);
    if(s === 'rated')   return (b.c.rat||0) - (a.c.rat||0);
    if(s === 'popular') return (b.c.views||0) - (a.c.views||0);
    if(s === 'az')      return nxNorm(a.c.title) < nxNorm(b.c.title) ? -1 : 1;
    /* pertinence */
    var d = b.score - a.score;
    return d !== 0 ? d : (b.c.views||0) - (a.c.views||0);
  });
}

/* ---------- RECHERCHE PRINCIPALE ---------- */
function nxSearch(){
  /* on part du catalogue visible du profil : jamais d'annoncé ni de contenu interdit */
  var pool = (typeof nxVisibleCatalog === 'function') ? nxVisibleCatalog() : (CAT || []);
  if(typeof nxAllowedByRating === 'function') pool = nxAllowedByRating(pool);

  var terms = nxNorm(NXS.q).split(' ').filter(function(t){ return t.length > 0; });

  var scored = [];
  for(var i=0;i<pool.length;i++){
    var c = pool[i];
    if(!nxPassFilters(c)) continue;
    var sc = nxScore(c, terms);
    if(sc > 0) scored.push({ c:c, score:sc });
  }
  return nxSortResults(scored).map(function(x){ return x.c; });
}

/* ---------- SUGGESTIONS ---------- */
/* Si aucun résultat : proposer des termes proches présents au catalogue */
function nxSuggest(q){
  var pool = (typeof nxVisibleCatalog === 'function') ? nxVisibleCatalog() : (CAT || []);
  var n = nxNorm(q);
  if(n.length < 2) return [];
  var out = [], seen = {};
  for(var i=0;i<pool.length && out.length < 6; i++){
    var c = pool[i];
    var cands = [c.title, c.genre].concat(c.tags || []);
    for(var k=0;k<cands.length;k++){
      var v = nxNorm(cands[k]);
      if(!v || seen[v]) continue;
      /* préfixe partiel : "lumi" -> "lumiere noire" */
      if(v.indexOf(n.slice(0, Math.max(2, n.length - 2))) !== -1){
        seen[v] = true;
        out.push(cands[k]);
        break;
      }
    }
  }
  return out;
}
