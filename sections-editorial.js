/* ============================================
   NETLUXE — Sections éditoriales
   Top 10, Originals, Caribbean Discovery,
   Coming Soon. Alimentées par les vrais champs
   du catalogue (catalog-meta.js).
   ============================================ */

/* ---------- TOP 10 ---------- */
/* Classement éditorial explicite (topRank) complété par les vues. */
function nxTop10(scope){
  var pool = (typeof nxVisibleCatalog === 'function') ? nxVisibleCatalog() : (CAT || []);

  if(scope === 'caribbean') pool = pool.filter(function(c){ return c.region === 'caribbean'; });
  else if(scope === 'international') pool = pool.filter(function(c){ return c.region !== 'caribbean'; });

  var ranked = pool.filter(function(c){ return c.topRank; })
                   .sort(function(a,b){ return a.topRank - b.topRank; });
  var rest = pool.filter(function(c){ return !c.topRank; })
                 .sort(function(a,b){ return (b.views||0) - (a.views||0); });

  return ranked.concat(rest).slice(0, 10);
}

/* ---------- NETLUXE ORIGINALS ---------- */
function nxOriginals(){
  var pool = (typeof nxVisibleCatalog === 'function') ? nxVisibleCatalog() : (CAT || []);
  return pool.filter(function(c){ return c.org; })
             .sort(function(a,b){
               var d = (b.year||0) - (a.year||0);
               return d !== 0 ? d : (b.rat||0) - (a.rat||0);
             });
}

/* ---------- CARIBBEAN DISCOVERY ---------- */
/* Regroupé par pays, chaque pays devient un sous-ensemble. */
function nxCaribbeanByCountry(){
  var pool = (typeof nxVisibleCatalog === 'function') ? nxVisibleCatalog() : (CAT || []);
  var carib = pool.filter(function(c){ return c.region === 'caribbean'; });
  var groups = {}, order = [];
  for(var i=0;i<carib.length;i++){
    var k = carib[i].country || 'XX';
    if(!groups[k]){ groups[k] = []; order.push(k); }
    groups[k].push(carib[i]);
  }
  /* pays les mieux fournis d'abord */
  order.sort(function(a,b){ return groups[b].length - groups[a].length; });
  var out = [];
  for(var j=0;j<order.length;j++){
    var co = (typeof NX_COUNTRIES !== 'undefined') ? NX_COUNTRIES[order[j]] : null;
    out.push({
      code: order[j],
      name: co ? co.name : order[j],
      flag: co ? co.flag : '🌍',
      items: groups[order[j]]
    });
  }
  return out;
}

function nxCaribbeanAll(){
  var pool = (typeof nxVisibleCatalog === 'function') ? nxVisibleCatalog() : (CAT || []);
  return pool.filter(function(c){ return c.region === 'caribbean'; })
             .sort(function(a,b){ return (b.org?1:0) - (a.org?1:0); });
}

/* ---------- COMING SOON ---------- */
/* Lit CAT directement : les titres annoncés sont volontairement
   exclus de nxVisibleCatalog(), c'est ici leur seule vitrine.
   On respecte quand même le filtrage enfant du profil. */
function nxComingSoon(){
  if(typeof CAT === 'undefined' || !Array.isArray(CAT)) return [];
  var t = (typeof nxProfileType === 'function') ? nxProfileType() : 'mixed';
  var now = new Date();
  var out = [];

  for(var i=0;i<CAT.length;i++){
    var c = CAT[i];
    if(!c.releaseDate) continue;
    var d = new Date(c.releaseDate);
    if(isNaN(d.getTime())) continue;
    if(d <= now) continue;

    /* profil enfant : ne montrer que ce qui est adapté */
    if(t === 'kids' && typeof nxIsKidSafe === 'function' && !nxIsKidSafe(c)) continue;
    if(t === 'cartoon' && c.type !== 'cartoon') continue;

    out.push({ item:c, date:d, days:Math.ceil((d - now) / 86400000) });
  }
  out.sort(function(a,b){ return a.date - b.date; });
  return out;
}

/* Compte à rebours lisible */
function nxCountdown(days){
  if(days <= 0)   return 'Disponible maintenant';
  if(days === 1)  return 'Demain';
  if(days < 7)    return 'Dans ' + days + ' jours';
  if(days < 30){
    var w = Math.ceil(days / 7);
    return 'Dans ' + w + ' semaine' + (w > 1 ? 's' : '');
  }
  if(days < 365){
    var mo = Math.ceil(days / 30);
    return 'Dans ' + mo + ' mois';
  }
  return 'Bientôt';
}

/* ---------- RAPPELS COMING SOON ---------- */
function nxHasReminder(id){
  if(typeof prof === 'undefined' || !prof || !prof.reminders) return false;
  for(var i=0;i<prof.reminders.length;i++){
    if(String(prof.reminders[i]) === String(id)) return true;
  }
  return false;
}

function nxToggleReminder(id){
  if(typeof prof === 'undefined' || !prof){
    if(typeof showToast === 'function') showToast('Sélectionnez un profil');
    return;
  }
  if(!prof.reminders) prof.reminders = [];
  var idx = -1;
  for(var i=0;i<prof.reminders.length;i++){
    if(String(prof.reminders[i]) === String(id)){ idx = i; break; }
  }
  var added;
  if(idx >= 0){ prof.reminders.splice(idx, 1); added = false; }
  else { prof.reminders.push(id); added = true; }
  if(typeof saveProfile === 'function') saveProfile();
  if(typeof showToast === 'function'){
    showToast(added ? '🔔 Rappel activé — vous serez prévenu à la sortie' : 'Rappel désactivé');
  }
  if(typeof nxRenderComing === 'function') nxRenderComing();
}

/* ---------- FILTRE PAR CLASSIFICATION ---------- */
/* Respecte le réglage « classification maximale » du profil. */
function nxAllowedByRating(list){
  if(typeof prof === 'undefined' || !prof) return list;
  var maxAge = null;
  if(prof.prefs && prof.prefs.maxRating){
    var r = (typeof NX_RATINGS !== 'undefined') ? NX_RATINGS[prof.prefs.maxRating] : null;
    if(r) maxAge = r.min;
  }
  if(prof.ptype === 'kids' && (maxAge === null || maxAge > 10)) maxAge = 10;
  if(maxAge === null) return list;
  return list.filter(function(c){
    return (c.minAge === undefined ? 0 : c.minAge) <= maxAge;
  });
}
