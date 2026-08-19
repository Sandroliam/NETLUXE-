/* ============================================
   NETLUXE — Interface de recherche (rendu)
   ============================================ */

function nxsEsc(s){
  return String(s == null ? '' : s).replace(/[&<>"']/g, function(m){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];
  });
}

/* ---------- BARRE DE FILTRES ---------- */
function nxsBuildFilters(){
  var box = document.getElementById('srchFilters');
  if(!box) return;

  var types = [
    { k:'all',     l:'Tout' },
    { k:'film',    l:'🎬 Films' },
    { k:'series',  l:'📺 Séries' },
    { k:'cartoon', l:'🎨 Animés' }
  ];
  var regions = [
    { k:'all',       l:'Tous pays' },
    { k:'caribbean', l:'🌴 Caraïbes' },
    { k:'america',   l:'Amérique' },
    { k:'europe',    l:'Europe' },
    { k:'asia',      l:'Asie' }
  ];
  var ratings = [
    { k:'all', l:'Tout âge' },
    { k:'TP',  l:'Tout public' },
    { k:'6+',  l:'6+' },
    { k:'10+', l:'10+' },
    { k:'12+', l:'12+' },
    { k:'16+', l:'16+' }
  ];
  var durations = [
    { k:'all',    l:'Toute durée' },
    { k:'short',  l:'< 1h' },
    { k:'medium', l:'1h – 2h' },
    { k:'long',   l:'> 2h' }
  ];
  var sorts = [
    { k:'relevance', l:'Pertinence' },
    { k:'recent',    l:'Plus récents' },
    { k:'rated',     l:'Mieux notés' },
    { k:'popular',   l:'Populaires' },
    { k:'az',        l:'A → Z' }
  ];

  function chips(list, cur, fn){
    var h = '';
    for(var i=0;i<list.length;i++){
      h += '<button class="nxs-chip' + (list[i].k === cur ? ' on' : '') + '" '+
           'onclick="' + fn + '(\'' + list[i].k + '\')">' + list[i].l + '</button>';
    }
    return h;
  }

  box.innerHTML =
    '<div class="nxs-grp">' + chips(types, NXS.type, 'nxsSetType') + '</div>'+
    '<div class="nxs-grp">' + chips(regions, NXS.region, 'nxsSetRegion') + '</div>'+
    '<div class="nxs-grp">' + chips(ratings, NXS.rating, 'nxsSetRating') + '</div>'+
    '<div class="nxs-grp">' + chips(durations, NXS.duration, 'nxsSetDuration') + '</div>'+
    '<div class="nxs-grp">'+
      '<button class="nxs-chip' + (NXS.origOnly ? ' on gold' : '') + '" onclick="nxsToggleOrig()">⭐ Originals</button>'+
      '<select class="nxs-sel" onchange="nxsSetSort(this.value)">' +
        sorts.map(function(s){
          return '<option value="' + s.k + '"' + (s.k === NXS.sort ? ' selected' : '') + '>' + s.l + '</option>';
        }).join('') +
      '</select>'+
      (nxActiveFilterCount() ? '<button class="nxs-chip clear" onclick="nxsClear()">✕ Effacer (' + nxActiveFilterCount() + ')</button>' : '')+
    '</div>';
}

/* ---------- ACTIONS DES FILTRES ---------- */
function nxsSetType(v){     NXS.type = v;     nxsRefresh(); }
function nxsSetRegion(v){   NXS.region = v;   nxsRefresh(); }
function nxsSetRating(v){   NXS.rating = v;   nxsRefresh(); }
function nxsSetDuration(v){ NXS.duration = v; nxsRefresh(); }
function nxsSetSort(v){     NXS.sort = v;     nxsRefresh(); }
function nxsToggleOrig(){   NXS.origOnly = !NXS.origOnly; nxsRefresh(); }
function nxsClear(){
  NXS.type = 'all'; NXS.region = 'all'; NXS.rating = 'all';
  NXS.duration = 'all'; NXS.origOnly = false;
  nxsRefresh();
}

/* ---------- RENDU DES RÉSULTATS ---------- */
function nxsRefresh(){
  var input = document.getElementById('srchInput');
  NXS.q = input ? input.value : '';
  nxsBuildFilters();

  var res = nxSearch();
  var box = document.getElementById('srchRes');
  var cnt = document.getElementById('srchCount');
  if(!box) return;

  if(cnt){
    cnt.textContent = res.length
      ? res.length + ' résultat' + (res.length > 1 ? 's' : '')
      : '';
  }

  if(!res.length){
    var sug = (NXS.q && NXS.q.length > 1) ? nxSuggest(NXS.q) : [];
    box.innerHTML =
      '<div class="nxs-empty">'+
        '<div class="ic">🔍</div>'+
        '<p>Aucun résultat' + (NXS.q ? ' pour « ' + nxsEsc(NXS.q) + ' »' : ' avec ces filtres') + '</p>'+
        (nxActiveFilterCount() ? '<button class="btn btn-o" onclick="nxsClear()">Effacer les filtres</button>' : '')+
        (sug.length ? '<div class="nxs-sug"><span>Essayez :</span>' +
          sug.map(function(s){
            return '<button onclick="nxsGo(\'' + nxsEsc(s).replace(/'/g,"\\'") + '\')">' + nxsEsc(s) + '</button>';
          }).join('') + '</div>' : '')+
      '</div>';
    return;
  }

  var h = '';
  for(var i=0;i<res.length;i++){
    var c = res[i];
    var typeLbl = c.type === 'film' ? 'Film' : (c.type === 'series' ? 'Série' : 'Animé');
    h += '<div class="srch-card" onclick="showDetail(' + c.id + ')" role="button" tabindex="0">'+
      '<div class="nxs-thumb">'+
        '<img src="' + c.img + '" loading="lazy" alt="">'+
        (c.org ? '<span class="nxs-org">ORIGINAL</span>' : '')+
        (c.rating ? '<span class="nxs-rt">' + c.rating + '</span>' : '')+
      '</div>'+
      '<div class="nxs-info">'+
        '<div class="nxs-t">' + (c.flag || '') + ' ' + nxsEsc(c.title) + '</div>'+
        '<div class="nxs-m">' + typeLbl + ' · ' + (c.year || '') + (c.dur ? ' · ' + c.dur : '') + '</div>'+
        '<div class="nxs-g">' + nxsEsc(c.genre || '') + '</div>'+
      '</div>'+
    '</div>';
  }
  box.innerHTML = h;
}

/* Lancer une recherche depuis une suggestion */
function nxsGo(term){
  var input = document.getElementById('srchInput');
  if(input) input.value = term;
  NXS.q = term;
  nxsRefresh();
}

/* Remplace l'ancienne recherche */
function doSearch(){ nxsRefresh(); }
