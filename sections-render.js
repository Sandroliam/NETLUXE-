/* ============================================
   NETLUXE — Rendu des sections éditoriales
   ============================================ */

function nxEsc2(s){
  return String(s == null ? '' : s).replace(/[&<>"']/g, function(m){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];
  });
}

/* ---------- TOP 10 : cartes numérotées ---------- */
function nxRenderTop10(rowId, scope){
  var row = document.getElementById(rowId);
  if(!row) return 0;
  var list = nxAllowedByRating(nxTop10(scope));
  if(!list.length){ row.innerHTML = ''; return 0; }

  var h = '';
  for(var i=0;i<list.length;i++){
    var c = list[i];
    h += '<div class="nxt-card" onclick="showDetail(' + c.id + ')" role="button" tabindex="0">'+
      '<div class="nxt-num">' + (i+1) + '</div>'+
      '<div class="nxt-img">'+
        '<img src="' + c.img + '" loading="lazy" alt="">'+
        (c.rating ? '<span class="nxt-rt">' + c.rating + '</span>' : '')+
      '</div>'+
      '<div class="nxt-txt">'+
        '<div class="nxt-t">' + (c.flag || '') + ' ' + nxEsc2(c.title) + '</div>'+
        '<div class="nxt-s">' + nxEsc2(c.genre || '') + ' · ' + (c.year || '') + '</div>'+
      '</div>'+
    '</div>';
  }
  row.innerHTML = h;
  return list.length;
}

/* ---------- CARIBBEAN DISCOVERY : par pays ---------- */
function nxRenderCaribbean(boxId){
  var box = document.getElementById(boxId);
  if(!box) return 0;
  var groups = nxCaribbeanByCountry();
  if(!groups.length){ box.innerHTML = ''; return 0; }

  var h = '', total = 0;
  for(var g=0;g<groups.length;g++){
    var grp = groups[g];
    var items = nxAllowedByRating(grp.items);
    if(!items.length) continue;
    total += items.length;

    h += '<div class="nxcd-country">'+
      '<div class="nxcd-hdr"><span class="nxcd-flag">' + grp.flag + '</span>'+
      '<span class="nxcd-nm">' + nxEsc2(grp.name) + '</span>'+
      '<span class="nxcd-ct">' + items.length + ' titre' + (items.length > 1 ? 's' : '') + '</span></div>'+
      '<div class="nxcd-row">';
    for(var i=0;i<items.length;i++){
      var c = items[i];
      h += '<div class="nxcd-card" onclick="showDetail(' + c.id + ')" role="button" tabindex="0">'+
        '<div class="nxcd-img"><img src="' + c.img + '" loading="lazy" alt="">'+
          (c.org ? '<span class="nxcd-org">ORIGINAL</span>' : '')+
          '<div class="nxcd-ov"><div class="nxcd-play">▶</div></div>'+
        '</div>'+
        '<div class="nxcd-t">' + nxEsc2(c.title) + '</div>'+
        '<div class="nxcd-s">' + nxEsc2(c.genre || '') + ' · ' + (c.rating || '') + '</div>'+
      '</div>';
    }
    h += '</div></div>';
  }
  box.innerHTML = h;
  return total;
}

/* ---------- COMING SOON ---------- */
function nxRenderComing(){
  var row = document.getElementById('comingRow');
  var sec = document.getElementById('comingSection');
  if(!row || !sec) return 0;

  var list = nxComingSoon();
  if(!list.length){ sec.style.display = 'none'; row.innerHTML = ''; return 0; }

  sec.style.display = 'block';
  var h = '';
  for(var i=0;i<list.length;i++){
    var e = list[i], c = e.item;
    var on = nxHasReminder(c.id);
    h += '<div class="nxcs-card">'+
      '<div class="nxcs-img" onclick="showDetail(' + c.id + ')">'+
        '<img src="' + c.img + '" loading="lazy" alt="">'+
        '<span class="nxcs-badge">BIENTÔT</span>'+
        '<div class="nxcs-cd">' + nxCountdown(e.days) + '</div>'+
      '</div>'+
      '<div class="nxcs-txt">'+
        '<div class="nxcs-t">' + (c.flag || '') + ' ' + nxEsc2(c.title) + '</div>'+
        '<div class="nxcs-d">' + nxEsc2(c.genre || '') + ' · ' + (c.rating || '') + '</div>'+
        '<button class="nxcs-btn' + (on ? ' on' : '') + '" '+
          'onclick="event.stopPropagation();nxToggleReminder(' + c.id + ')">'+
          (on ? '🔔 Rappel activé' : '🔔 Me prévenir') + '</button>'+
      '</div>'+
    '</div>';
  }
  row.innerHTML = h;
  return list.length;
}

/* ---------- ORIGINALS ---------- */
function nxRenderOriginals(rowId){
  var row = document.getElementById(rowId);
  if(!row) return 0;
  var list = nxAllowedByRating(nxOriginals());
  if(!list.length){ row.innerHTML = ''; return 0; }
  if(typeof fillRow === 'function'){ fillRow(rowId, list); return list.length; }
  return list.length;
}

/* ---------- ORCHESTRATION ---------- */
function nxRenderEditorial(){
  var n1 = nxRenderTop10('top10Row', 'all');
  var n2 = nxRenderTop10('topCaribRow', 'caribbean');
  var n3 = nxRenderCaribbean('caribDiscovery');
  var n4 = nxRenderComing();
  var n5 = nxRenderOriginals('originalsRow');

  /* masquer les sections vides — pas de rail fantôme */
  var pairs = [
    ['top10Section', n1], ['topCaribSection', n2],
    ['caribSection', n3], ['comingSection', n4], ['originalsSection', n5]
  ];
  for(var i=0;i<pairs.length;i++){
    var el = document.getElementById(pairs[i][0]);
    if(el) el.style.display = pairs[i][1] ? 'block' : 'none';
  }
}
