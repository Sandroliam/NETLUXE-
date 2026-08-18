/* ============================================
   NETLUXE PLAYER — Pont de compatibilité
   Redirige les anciens appels vers le nouveau lecteur
   ============================================ */

/* Construit la liste d'épisodes pour une série.
   Si le contenu n'a pas d'épisodes déclarés, on regroupe les contenus
   de même titre/série présents dans le catalogue. */
function nxpBuildEpisodes(item){
  if(!item) return null;
  if(item.type !== 'series') return null;

  /* 1) épisodes déclarés dans l'objet */
  if(item.episodes && item.episodes.length){
    return item.episodes.map(function(e, i){
      return {
        id: e.id || (item.id + '_e' + i),
        title: e.title || ('Épisode ' + (i+1)),
        video: e.video || item.video,
        dur: e.dur || item.dur,
        year: e.year || item.year,
        genre: item.genre, type:'series',
        audio: e.audio || item.audio, subs: e.subs || item.subs,
        tracks: e.tracks || item.tracks,
        desc: e.desc || item.desc, img: e.img || item.img,
        rat: item.rat, dir: item.dir, org: item.org,
        source: item.source, license: item.license
      };
    });
  }

  /* 2) sinon : un seul "épisode" = le contenu lui-même */
  return [item];
}

/* ---------- PONT : playVideo(id) ---------- */
function playVideo(id, epIndex){
  var item = null;
  try {
    if(typeof CAT !== 'undefined' && CAT.length){
      for(var i=0;i<CAT.length;i++){ if(CAT[i].id == id){ item = CAT[i]; break; } }
    }
  } catch(e){}
  if(!item){ if(typeof showToast==='function') showToast('Contenu introuvable'); return; }

  var eps = nxpBuildEpisodes(item);
  var idx = epIndex || 0;
  if(eps && eps.length > 1){
    nxpOpen(eps[idx], eps, idx);
  } else {
    nxpOpen(item, null, 0);
  }
}

/* ---------- PONT : anciens noms ---------- */
function closePlayer(){ nxpClose(); }
function togglePlay(){ nxpTogglePlay(); }
function skip(s){ nxpSkip(s); }
function toggleFullscreen(){ nxpToggleFs(); }
function toggleSubs(){ nxpToggleCc(); }
function toggleSettings(){ nxpTogglePanel(); }
function prevEp(){ nxpPrevEp(); }
function nextEp(){ nxpNextEp(); }
function cycleAudio(){ nxpOpenPanel('audio'); }
function cycleSubs(){ nxpOpenPanel('subs'); }
function cycleSpeed(){ nxpOpenPanel('speed'); }
function seekPlayer(e){ /* géré nativement par la barre du nouveau lecteur */ }

/* playCurrent : depuis la fiche détail */
function playCurrent(){
  try {
    if(typeof detCur !== 'undefined' && detCur){ playVideo(detCur.id); return; }
    if(typeof curDetail !== 'undefined' && curDetail){ playVideo(curDetail.id); return; }
  } catch(e){}
  /* repli : lire le premier contenu du catalogue */
  if(typeof CAT !== 'undefined' && CAT.length) playVideo(CAT[0].id);
}

/* ---------- MASQUER L'ANCIEN LECTEUR ---------- */
(function(){
  function hideLegacy(){
    var old = document.getElementById('player');
    if(old){
      old.style.display = 'none';
      old.classList.remove('active');
      /* le neutraliser complètement pour éviter tout conflit */
      old.setAttribute('aria-hidden','true');
    }
    nxpBuildDOM();
  }
  if(document.readyState === 'complete' || document.readyState === 'interactive') setTimeout(hideLegacy, 40);
  else window.addEventListener('DOMContentLoaded', function(){ setTimeout(hideLegacy, 40); });
})();
