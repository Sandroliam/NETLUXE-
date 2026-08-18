/* ============================================
   NETLUXE — « Continuer à regarder » intelligent
   Affiche saison/épisode, minutes restantes,
   et un bouton Reprendre qui reprend au bon endroit.
   ============================================ */

/* Retrouve un contenu par identifiant (contenu OU épisode) */
function nxFindById(id){
  if(typeof CAT === 'undefined') return null;
  var i, k;
  for(i=0;i<CAT.length;i++){
    if(String(CAT[i].id) === String(id)) return { item:CAT[i], parent:null, epIdx:-1 };
  }
  /* épisode ? */
  for(i=0;i<CAT.length;i++){
    var s = CAT[i];
    if(!s.episodes) continue;
    for(k=0;k<s.episodes.length;k++){
      if(String(s.episodes[k].id) === String(id)){
        return { item:s.episodes[k], parent:s, epIdx:k };
      }
    }
  }
  return null;
}

/* Construit une ligne « Continuer » exploitable */
function nxResumeInfo(id){
  var found = nxFindById(id);
  if(!found) return null;

  var it = found.item, parent = found.parent;
  var pc = 0;
  if(typeof prof !== 'undefined' && prof && prof.progress){
    var raw = parseFloat(prof.progress[id]);
    if(isFinite(raw)) pc = Math.min(100, Math.max(0, raw));
  }

  var totalMin = it.durMin || (parent ? parent.durMin : 0) ||
                 (typeof nxDurToMin === 'function' ? nxDurToMin(it.dur) : 0);
  var leftMin = totalMin ? Math.max(0, Math.round(totalMin * (1 - pc/100))) : 0;

  /* libellé épisode : Saison X — Épisode Y */
  var epLabel = '';
  if(parent){
    var season = 1;
    var epNum = found.epIdx + 1;
    /* si la série déclare plusieurs saisons, répartir les épisodes */
    if(parent.seasons && parent.seasons > 1 && parent.episodes.length){
      var perSeason = Math.ceil(parent.episodes.length / parent.seasons);
      season = Math.floor(found.epIdx / perSeason) + 1;
      epNum = (found.epIdx % perSeason) + 1;
    }
    epLabel = 'Saison ' + season + ' — Épisode ' + epNum;
  } else if(it.type === 'series' && it.episodes && it.episodes.length){
    epLabel = 'Saison 1 — Épisode 1';
  }

  return {
    id: id,
    contentId: parent ? parent.id : it.id,
    title: parent ? parent.title : it.title,
    subtitle: epLabel || (it.genre || ''),
    epTitle: parent ? it.title : '',
    img: it.img || (parent ? parent.img : ''),
    pc: pc,
    leftMin: leftMin,
    totalMin: totalMin,
    finished: pc >= 95,
    rating: it.rating || (parent ? parent.rating : ''),
    flag: it.flag || (parent ? parent.flag : '')
  };
}

/* Liste ordonnée des contenus à reprendre */
function nxContinueList(limit){
  if(typeof prof === 'undefined' || !prof || !prof.history) return [];
  var pool = (typeof nxVisibleCatalog === 'function') ? nxVisibleCatalog() : (CAT || []);
  var allowed = {};
  for(var p=0;p<pool.length;p++) allowed[String(pool[p].id)] = true;

  var out = [], seen = {};
  for(var i=0;i<prof.history.length;i++){
    var h = prof.history[i];
    var hid = (h && h.id !== undefined) ? h.id : h;
    if(seen[String(hid)]) continue;
    seen[String(hid)] = true;

    var info = nxResumeInfo(hid);
    if(!info) continue;
    /* respecter le filtrage du profil (mode enfant notamment) */
    if(!allowed[String(info.contentId)]) continue;
    /* ne pas proposer ce qui est terminé, ni ce qui n'a pas commencé */
    if(info.finished || info.pc < 1) continue;

    info.at = (h && h.at) ? h.at : null;
    out.push(info);
    if(limit && out.length >= limit) break;
  }
  return out;
}

/* Formatage du temps restant */
function nxFmtLeft(min){
  if(!min || min < 1) return '';
  if(min < 60) return min + ' min restantes';
  var h = Math.floor(min / 60), m = min % 60;
  return m ? h + 'h' + (m < 10 ? '0' : '') + m + ' restantes' : h + 'h restantes';
}

/* ---------- RENDU DE LA RANGÉE ---------- */
function nxRenderContinue(){
  var row = document.getElementById('continueRow');
  var sec = document.getElementById('continueSection');
  if(!row || !sec) return;

  var list = nxContinueList(10);
  if(!list.length){ sec.style.display = 'none'; row.innerHTML = ''; return; }

  sec.style.display = 'block';
  var h = '';
  for(var i=0;i<list.length;i++){
    var c = list[i];
    var left = nxFmtLeft(c.leftMin);
    h += '<div class="nxc-card" onclick="nxResume(\'' + c.id + '\')" role="button" tabindex="0" '+
         'onkeydown="if(event.key===\'Enter\')nxResume(\'' + c.id + '\')">'+
      '<div class="nxc-img">'+
        '<img src="' + c.img + '" loading="lazy" alt="">'+
        '<div class="nxc-ov"><div class="nxc-play">▶</div></div>'+
        (c.rating ? '<span class="nxc-rt">' + c.rating + '</span>' : '')+
        '<div class="nxc-bar"><div class="nxc-fill" style="width:' + c.pc + '%"></div></div>'+
      '</div>'+
      '<div class="nxc-txt">'+
        '<div class="nxc-t">' + (c.flag ? c.flag + ' ' : '') + nxEscape(c.title) + '</div>'+
        (c.subtitle ? '<div class="nxc-s">' + nxEscape(c.subtitle) + '</div>' : '')+
        (c.epTitle ? '<div class="nxc-e">' + nxEscape(c.epTitle) + '</div>' : '')+
        '<div class="nxc-l">' + (left || Math.round(c.pc) + '% vu') + '</div>'+
        '<button class="nxc-btn" onclick="event.stopPropagation();nxResume(\'' + c.id + '\')">▶ Reprendre</button>'+
      '</div>'+
    '</div>';
  }
  row.innerHTML = h;
}

function nxEscape(s){
  return String(s == null ? '' : s).replace(/[&<>"']/g, function(m){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];
  });
}

/* ---------- REPRISE ---------- */
function nxResume(id){
  var found = nxFindById(id);
  if(!found){ if(typeof showToast === 'function') showToast('Contenu introuvable'); return; }

  if(found.parent){
    /* épisode : ouvrir la série au bon épisode */
    if(typeof playVideo === 'function'){
      playVideo(found.parent.id);
      if(typeof nxpGoEp === 'function') setTimeout(function(){ nxpGoEp(found.epIdx); }, 60);
    }
  } else {
    if(typeof playVideo === 'function') playVideo(found.item.id);
  }
}
