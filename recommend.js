/* ============================================
   NETLUXE — Moteur de recommandations
   Basé sur le comportement réel du profil :
   historique, favoris, ma liste, type de profil.
   ============================================ */

/* Profil de goûts déduit de l'activité */
function nxTasteProfile(){
  var t = { genres:{}, countries:{}, tags:{}, types:{}, seen:{}, n:0 };
  if(typeof prof === 'undefined' || !prof) return t;

  function absorb(id, weight){
    var f = (typeof nxFindById === 'function') ? nxFindById(id) : null;
    var c = f ? (f.parent || f.item) : null;
    if(!c) return;
    t.seen[String(c.id)] = true;
    if(c.genre)   t.genres[c.genre]     = (t.genres[c.genre] || 0) + weight;
    if(c.country) t.countries[c.country] = (t.countries[c.country] || 0) + weight;
    if(c.type)    t.types[c.type]        = (t.types[c.type] || 0) + weight;
    var tg = c.tags || [];
    for(var k=0;k<tg.length;k++) t.tags[tg[k]] = (t.tags[tg[k]] || 0) + weight;
    t.n += weight;
  }

  /* l'historique récent pèse plus lourd */
  var hist = prof.history || [];
  for(var i=0;i<hist.length && i<25; i++){
    var hid = (hist[i] && hist[i].id !== undefined) ? hist[i].id : hist[i];
    absorb(hid, i < 5 ? 3 : (i < 12 ? 2 : 1));
  }
  /* ma liste : intention explicite */
  var ml = prof.myList || [];
  for(var j=0;j<ml.length;j++) absorb(ml[j], 4);
  /* likes */
  var lk = prof.likes || [];
  for(var l=0;l<lk.length;l++) absorb(lk[l], 5);

  return t;
}

/* Score d'affinité d'un contenu avec les goûts */
function nxAffinity(c, taste){
  var s = 0;
  if(c.genre && taste.genres[c.genre])       s += taste.genres[c.genre] * 3;
  if(c.country && taste.countries[c.country]) s += taste.countries[c.country] * 2;
  if(c.type && taste.types[c.type])           s += taste.types[c.type] * 1.5;
  var tg = c.tags || [];
  for(var k=0;k<tg.length;k++){
    if(taste.tags[tg[k]]) s += taste.tags[tg[k]] * 2;
  }
  /* qualité et exclusivité */
  s += (c.rat || 0) * 1.2;
  if(c.org) s += 4;
  if(c.topRank) s += (11 - c.topRank) * 0.6;
  return s;
}

/* Recommandations personnalisées */
function nxRecommend(limit){
  var pool = (typeof nxVisibleCatalog === 'function') ? nxVisibleCatalog() : (CAT || []);
  if(typeof nxAllowedByRating === 'function') pool = nxAllowedByRating(pool);

  var taste = nxTasteProfile();

  /* pas encore d'activité : mettre en avant les originaux les mieux notés */
  if(taste.n === 0){
    return pool.slice().sort(function(a,b){
      var d = (b.org?1:0) - (a.org?1:0);
      if(d !== 0) return d;
      return (b.rat||0) - (a.rat||0);
    }).slice(0, limit || 10);
  }

  var scored = [];
  for(var i=0;i<pool.length;i++){
    var c = pool[i];
    if(taste.seen[String(c.id)]) continue;   /* ne pas re-proposer du déjà vu */
    scored.push({ c:c, s:nxAffinity(c, taste) });
  }
  scored.sort(function(a,b){ return b.s - a.s; });
  return scored.slice(0, limit || 10).map(function(x){ return x.c; });
}

/* « Parce que vous avez regardé X » */
function nxBecauseYouWatched(){
  if(typeof prof === 'undefined' || !prof || !prof.history || !prof.history.length) return null;
  var hid = (prof.history[0] && prof.history[0].id !== undefined) ? prof.history[0].id : prof.history[0];
  var f = (typeof nxFindById === 'function') ? nxFindById(hid) : null;
  var src = f ? (f.parent || f.item) : null;
  if(!src) return null;

  var pool = (typeof nxVisibleCatalog === 'function') ? nxVisibleCatalog() : (CAT || []);
  if(typeof nxAllowedByRating === 'function') pool = nxAllowedByRating(pool);

  var out = [];
  for(var i=0;i<pool.length;i++){
    var c = pool[i];
    if(String(c.id) === String(src.id)) continue;
    var s = 0;
    if(c.genre === src.genre) s += 10;
    if(c.country === src.country) s += 6;
    if(c.type === src.type) s += 4;
    var st = src.tags || [], ct = c.tags || [];
    for(var k=0;k<st.length;k++){
      for(var m=0;m<ct.length;m++){ if(st[k] === ct[m]) s += 5; }
    }
    if(s > 0) out.push({ c:c, s:s + (c.rat||0) });
  }
  out.sort(function(a,b){ return b.s - a.s; });
  if(!out.length) return null;
  return { source:src, items:out.slice(0,10).map(function(x){ return x.c; }) };
}

/* Contenus similaires — pour la fiche détail */
function nxSimilar(id, limit){
  var f = (typeof nxFindById === 'function') ? nxFindById(id) : null;
  var src = f ? (f.parent || f.item) : null;
  if(!src) return [];

  var pool = (typeof nxVisibleCatalog === 'function') ? nxVisibleCatalog() : (CAT || []);
  if(typeof nxAllowedByRating === 'function') pool = nxAllowedByRating(pool);

  var out = [];
  for(var i=0;i<pool.length;i++){
    var c = pool[i];
    if(String(c.id) === String(src.id)) continue;
    var s = 0;
    if(c.genre === src.genre) s += 12;
    if(c.type === src.type) s += 5;
    if(c.country === src.country) s += 7;
    if(c.region === src.region) s += 3;
    var st = src.tags || [], ct = c.tags || [];
    for(var k=0;k<st.length;k++){
      for(var m=0;m<ct.length;m++){ if(st[k] === ct[m]) s += 6; }
    }
    if(Math.abs((c.year||0) - (src.year||0)) <= 5) s += 2;
    if(s >= 5) out.push({ c:c, s:s + (c.rat||0) * 0.8 });
  }
  out.sort(function(a,b){ return b.s - a.s; });
  return out.slice(0, limit || 8).map(function(x){ return x.c; });
}
