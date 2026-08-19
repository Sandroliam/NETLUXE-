/* ============================================
   NETLUXE — Profils typés & filtrage du catalogue
   Chaque profil a un type qui pilote réellement
   ce que l'utilisateur voit partout dans l'app.
   ============================================ */

var NX_PROFILE_TYPES = {
  mixed:   { key:'mixed',   ic:'⭐', label:'Mixte',   desc:'Tous les contenus',            color:'#D4AF37' },
  films:   { key:'films',   ic:'🎬', label:'Films',   desc:'Films en priorité',            color:'#E50914' },
  series:  { key:'series',  ic:'📺', label:'Séries',  desc:'Séries en priorité',           color:'#00CED1' },
  cartoon: { key:'cartoon', ic:'🎨', label:'Animés',  desc:'Animations uniquement',        color:'#FF6B35' },
  kids:    { key:'kids',    ic:'👶', label:'Enfants', desc:'Contenu filtré et sécurisé',   color:'#22C55E' }
};

/* Mots-clés écartés pour le mode enfant */
var NX_KIDS_BLOCK = ['horreur','horror','thriller','crime','guerre','war','policier','noir',
                     'madness','haunted','nazi','concentration','murder','maniac','drame'];

function nxProfileType(){
  if(typeof prof === 'undefined' || !prof) return 'mixed';
  return prof.ptype || 'mixed';
}

/* Un contenu est-il adapté aux enfants ? */
function nxIsKidSafe(c){
  if(!c) return false;
  var txt = ((c.genre||'') + ' ' + (c.title||'') + ' ' + (c.desc||'')).toLowerCase();
  for(var i=0;i<NX_KIDS_BLOCK.length;i++){
    if(txt.indexOf(NX_KIDS_BLOCK[i]) !== -1) return false;
  }
  if(c.rating && /1[68]\+/.test(c.rating)) return false;
  /* on privilégie animations + tout public */
  return c.type === 'cartoon' || /animation|aventure|comédie|comedy|famille/i.test(c.genre||'');
}

/* Catalogue visible selon le profil actif — utilisé partout.
   Les titres ANNONCÉS (non encore sortis, sans fichier vidéo) sont
   exclus : ils n'apparaissent que dans « NETLUXE Premiere ». */
function nxVisibleCatalog(){
  if(typeof CAT === 'undefined' || !Array.isArray(CAT)) return [];
  var t = nxProfileType();
  var base = CAT.filter(function(c){ return !c.announced; });
  if(t === 'kids')    return base.filter(nxIsKidSafe);
  if(t === 'cartoon') return base.filter(function(c){ return c.type === 'cartoon'; });
  /* films / series / mixed : tout reste accessible, seul l'ordre change */
  return base.slice();
}

function nxKidsContent(){
  if(typeof CAT === 'undefined') return [];
  return CAT.filter(nxIsKidSafe);
}

/* Ordre de priorité selon le type de profil */
function nxRankedCatalog(){
  var pool = nxVisibleCatalog(), t = nxProfileType();
  var weight = function(c){
    if(t === 'films'  && c.type === 'film')    return 0;
    if(t === 'series' && c.type === 'series')  return 0;
    if(t === 'cartoon'&& c.type === 'cartoon') return 0;
    if(t === 'kids')                            return c.type === 'cartoon' ? 0 : 1;
    if(t === 'mixed')                           return c.org ? 0 : 1;
    return 1;
  };
  return pool.slice().sort(function(a,b){
    var d = weight(a) - weight(b);
    if(d !== 0) return d;
    if(!!b.org !== !!a.org) return (b.org?1:0) - (a.org?1:0);
    return (b.views||0) - (a.views||0);
  });
}

/* Sections de l'accueil adaptées au profil */
function nxHomeSections(){
  var t = nxProfileType(), pool = nxVisibleCatalog();
  var films   = pool.filter(function(c){ return c.type==='film'; });
  var series  = pool.filter(function(c){ return c.type==='series'; });
  var cartoon = pool.filter(function(c){ return c.type==='cartoon'; });
  var carib   = pool.filter(function(c){ return c.org; });
  var recent  = pool.filter(function(c){ return c.year >= 2023; });
  var pub     = pool.filter(function(c){ return c.source === 'Internet Archive'; });
  var top     = pool.slice().sort(function(a,b){ return (b.views||0)-(a.views||0); });

  /* Recommandations réelles, basées sur le comportement du profil */
  var reco = (typeof nxRecommend === 'function')
             ? nxRecommend(10)
             : pool.filter(function(c){ return (c.rat||0) >= 4.4; }).slice(0,10);

  if(t === 'kids'){
    return [
      { row:'trendingRow',  items:cartoon.slice(0,10) },
      { row:'newRow',       items:pool.filter(function(c){return c.year>=2020;}).slice(0,10) },
      { row:'caribbeanRow', items:carib },
      { row:'seriesRow',    items:series.slice(0,10) },
      { row:'cartoonsRow',  items:cartoon.slice(0,12) },
      { row:'recommendRow', items:reco },
      { row:'publicRow',    items:pub.slice(0,12) }
    ];
  }
  if(t === 'cartoon'){
    return [
      { row:'trendingRow',  items:top.slice(0,10) },
      { row:'newRow',       items:recent.slice(0,10) },
      { row:'caribbeanRow', items:carib },
      { row:'seriesRow',    items:series.slice(0,10) },
      { row:'cartoonsRow',  items:cartoon.slice(0,12) },
      { row:'recommendRow', items:reco },
      { row:'publicRow',    items:pub.slice(0,12) }
    ];
  }
  if(t === 'films'){
    return [
      { row:'trendingRow',  items:films.slice(0,10) },
      { row:'newRow',       items:recent.filter(function(c){return c.type==='film';}).slice(0,10) },
      { row:'caribbeanRow', items:carib },
      { row:'seriesRow',    items:series.slice(0,8) },
      { row:'cartoonsRow',  items:cartoon.slice(0,8) },
      { row:'recommendRow', items:reco },
      { row:'publicRow',    items:pub.filter(function(c){return c.type==='film';}).slice(0,12) }
    ];
  }
  if(t === 'series'){
    return [
      { row:'trendingRow',  items:series.concat(top).slice(0,10) },
      { row:'newRow',       items:recent.slice(0,10) },
      { row:'caribbeanRow', items:carib },
      { row:'seriesRow',    items:series },
      { row:'cartoonsRow',  items:cartoon.slice(0,8) },
      { row:'recommendRow', items:reco },
      { row:'publicRow',    items:pub.slice(0,12) }
    ];
  }
  /* mixte */
  return [
    { row:'trendingRow',  items:top.slice(0,10) },
    { row:'newRow',       items:recent.slice(0,10) },
    { row:'caribbeanRow', items:carib },
    { row:'seriesRow',    items:series.slice(0,10) },
    { row:'cartoonsRow',  items:cartoon.slice(0,10) },
    { row:'recommendRow', items:reco },
    { row:'publicRow',    items:pub.slice(0,12) }
  ];
}

/* Contenus mis en avant dans la bannière (carrousel) */
function nxFeatured(n){
  var ranked = nxRankedCatalog();
  var t = nxProfileType();
  var pick = [];
  /* d'abord les originaux caribéens correspondant au profil */
  for(var i=0;i<ranked.length && pick.length < (n||5); i++){
    var c = ranked[i];
    if(!c.video) continue;
    if(t==='films'   && c.type!=='film'    && pick.length<3) continue;
    if(t==='series'  && c.type!=='series'  && pick.length<2) continue;
    if(t==='cartoon' && c.type!=='cartoon') continue;
    pick.push(c);
  }
  if(!pick.length) pick = ranked.slice(0, n||5);
  return pick;
}

/* Badge du profil actif dans l'en-tête */
function nxSyncNav(page){
  var items = document.querySelectorAll('.btm-nav .ni');
  if(!items.length) return;
  var map = { home:0, films:1, series:2, search:3, profile:4 };
  for(var i=0;i<items.length;i++) items[i].classList.remove('act');
  var idx = map[page];
  if(idx !== undefined && items[idx]) items[idx].classList.add('act');
}
