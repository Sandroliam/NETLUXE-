/* ============================================
   NETLUXE PLAYER — Contrôles, gestes, progression
   ============================================ */

/* ---------- AFFICHAGE / MASQUAGE UI ---------- */
function nxpShowUI(){
  if(!NXP.el) return;
  NXP.el.classList.remove('hid');
  clearTimeout(NXP.hideT);
  if(NXP.vid && !NXP.vid.paused){
    NXP.hideT = setTimeout(function(){
      if(NXP.vid && !NXP.vid.paused && !nx('nxpPanel').classList.contains('on')
         && !nx('nxpInfo').classList.contains('on') && !NXP.dragging){
        NXP.el.classList.add('hid');
      }
    }, 3200);
  }
}

/* ---------- PLEIN ÉCRAN ---------- */
function nxpToggleFs(){
  var el = NXP.el;
  if(!document.fullscreenElement && !document.webkitFullscreenElement){
    var req = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
    if(req){
      req.call(el).then(function(){
        /* verrouiller en paysage sur mobile si possible */
        try {
          if(screen.orientation && screen.orientation.lock && window.innerWidth < 900){
            screen.orientation.lock('landscape').catch(function(){});
          }
        } catch(e){}
      }).catch(function(){ nxpToast('Plein écran refusé'); });
    } else if(NXP.vid && NXP.vid.webkitEnterFullscreen){
      NXP.vid.webkitEnterFullscreen();   /* iPhone : plein écran natif */
    } else {
      nxpToast('Plein écran non supporté');
    }
  } else {
    try { if(screen.orientation && screen.orientation.unlock) screen.orientation.unlock(); } catch(e){}
    var ex = document.exitFullscreen || document.webkitExitFullscreen;
    if(ex) ex.call(document).catch(function(){});
  }
}

/* ---------- SOUS-TITRES ---------- */
function nxpToggleCc(){
  var subs = (NXP.cur && NXP.cur.subs) || [];
  if(!subs.length){ nxpToast('Aucun sous-titre disponible'); return; }
  NXP.ccOn = !NXP.ccOn;
  nxpSyncCc();
  nxpToast(NXP.ccOn ? 'Sous-titres ' + NXP.ccLang : 'Sous-titres désactivés');
  nxpRenderPanel(nx('nxpPanel').classList.contains('on') ? 'root' : null);
  try { if(typeof prefs === 'function'){ prefs().subs = NXP.ccOn ? NXP.ccLang : 'off'; if(typeof saveProfile==='function') saveProfile(); } } catch(e){}
}
function nxpSyncCc(){
  var box = nx('nxpCc'), btn = nx('nxpCcBtn');
  if(!box) return;
  if(NXP.ccOn){ box.classList.remove('off'); btn.classList.add('on'); }
  else { box.classList.add('off'); btn.classList.remove('on'); nx('nxpCcTxt').textContent = ''; }
  nxpLoadTrack();
}
/* Charge une piste VTT si le contenu en déclare une, sinon rien (pas d'invention) */
function nxpLoadTrack(){
  var v = NXP.vid; if(!v) return;
  var i;
  for(i = v.textTracks.length - 1; i >= 0; i--){ v.textTracks[i].mode = 'disabled'; }
  var olds = v.querySelectorAll('track');
  for(i=0;i<olds.length;i++) olds[i].remove();
  nx('nxpCcTxt').textContent = '';
  if(!NXP.ccOn) return;
  var tr = NXP.cur && NXP.cur.tracks && NXP.cur.tracks[NXP.ccLang];
  if(!tr) return;   /* aucune piste réelle : on n'affiche rien */
  var t = document.createElement('track');
  t.kind = 'subtitles'; t.srclang = NXP.ccLang.toLowerCase(); t.label = NXP.ccLang; t.src = tr;
  v.appendChild(t);
  t.addEventListener('load', function(){
    var track = v.textTracks[v.textTracks.length-1];
    track.mode = 'hidden';
    track.addEventListener('cuechange', function(){
      var c = track.activeCues && track.activeCues[0];
      nx('nxpCcTxt').textContent = c ? c.text.replace(/<[^>]+>/g,'') : '';
    });
  });
}

/* ---------- QUALITÉ ---------- */
function nxpApplyQuality(){
  if(!NXP.hls) return;
  var lv = NXP.hls.levels || [];
  if(NXP.quality === 'auto'){ NXP.hls.currentLevel = -1; return; }
  var want = parseInt(NXP.quality, 10);
  var best = -1, diff = 1e9;
  for(var i=0;i<lv.length;i++){
    var d = Math.abs((lv[i].height||0) - want);
    if(d < diff){ diff = d; best = i; }
  }
  NXP.hls.currentLevel = best;
}
function nxpSetQuality(q){
  NXP.quality = q;
  nxpApplyQuality();
  try { if(typeof prefs === 'function'){ prefs().quality = q; if(typeof saveProfile==='function') saveProfile(); } } catch(e){}
  nxpRenderPanel('quality');
  nxpToast('Qualité : ' + (q === 'auto' ? 'Automatique' : q + 'p'));
}

/* ---------- LANGUES ---------- */
function nxpSetAudio(l){
  NXP.audioLang = l;
  /* bascule de piste audio si le flux HLS en propose plusieurs */
  if(NXP.hls && NXP.hls.audioTracks && NXP.hls.audioTracks.length > 1){
    for(var i=0;i<NXP.hls.audioTracks.length;i++){
      var t = NXP.hls.audioTracks[i];
      if((t.lang||'').toUpperCase().indexOf(l) === 0 || (t.name||'').toUpperCase().indexOf(l) === 0){
        NXP.hls.audioTrack = i; break;
      }
    }
  }
  try { if(typeof prefs === 'function'){ prefs().audio = l; if(typeof saveProfile==='function') saveProfile(); } } catch(e){}
  nxpRenderPanel('audio');
  nxpToast('Audio : ' + nxpLangName(l));
}
function nxpSetCcLang(l){
  if(l === 'off'){ NXP.ccOn = false; }
  else { NXP.ccLang = l; NXP.ccOn = true; }
  nxpSyncCc();
  try { if(typeof prefs === 'function'){ prefs().subs = NXP.ccOn ? l : 'off'; if(typeof saveProfile==='function') saveProfile(); } } catch(e){}
  nxpRenderPanel('subs');
  nxpToast(NXP.ccOn ? 'Sous-titres : ' + nxpLangName(l) : 'Sous-titres désactivés');
}
function nxpLangName(c){
  return { FR:'Français', EN:'English', ES:'Español', CR:'Kreyòl Ayisyen' }[c] || c;
}

/* ---------- ÉPISODES ---------- */
function nxpPrevEp(){
  if(!NXP.series || NXP.epIdx <= 0) return;
  nxpSaveProgress();
  NXP.epIdx--;
  nxpOpen(NXP.series[NXP.epIdx], NXP.series, NXP.epIdx);
}
function nxpNextEp(){
  if(!NXP.series || NXP.epIdx >= NXP.series.length - 1){ nxpCancelNext(); return; }
  nxpSaveProgress();
  nxpCancelNext();
  NXP.epIdx++;
  nxpOpen(NXP.series[NXP.epIdx], NXP.series, NXP.epIdx);
}
function nxpCancelNext(){
  clearInterval(NXP.nextT); NXP.nextT = null;
  var c = nx('nxpNextCard'); if(c) c.classList.remove('on');
}
function nxpOfferNext(){
  if(!NXP.autoNext) return;
  if(!NXP.series || NXP.epIdx >= NXP.series.length - 1) return;
  var nextIt = NXP.series[NXP.epIdx + 1];
  nx('nxpNcT').textContent = nextIt.title || 'Épisode suivant';
  nx('nxpNcM').textContent = 'Épisode ' + (NXP.epIdx + 2) + ' / ' + NXP.series.length + (nextIt.dur ? '  ·  ' + nextIt.dur : '');
  nx('nxpNextCard').classList.add('on');
  NXP.nextCd = 0;
  clearInterval(NXP.nextT);
  NXP.nextT = setInterval(function(){
    NXP.nextCd += 100;
    var pc = Math.min(100, (NXP.nextCd / 8000) * 100);
    nx('nxpNcBar').style.width = pc + '%';
    if(pc >= 100){ clearInterval(NXP.nextT); nxpNextEp(); }
  }, 100);
}

/* ---------- BARRE DE PROGRESSION ---------- */
function nxpSeekFromEvent(e){
  var v = NXP.vid, tr = nx('nxpTrack');
  if(!v || !isFinite(v.duration)) return null;
  var r = tr.getBoundingClientRect();
  var cx = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
  var x = Math.max(0, Math.min(1, (cx - r.left) / r.width));
  return x;
}
function nxpUpdateBar(){
  var v = NXP.vid; if(!v) return;
  var d = isFinite(v.duration) ? v.duration : 0;
  var pc = d ? (v.currentTime / d) * 100 : 0;
  nx('nxpFill').style.width = pc + '%';
  nx('nxpKnob').style.left = pc + '%';
  try {
    if(v.buffered && v.buffered.length && d){
      nx('nxpBuf').style.width = Math.min(100, (v.buffered.end(v.buffered.length-1)/d)*100) + '%';
    }
  } catch(e){}
  nx('nxpTime').innerHTML = '<b>' + nxFmt(v.currentTime) + '</b> / ' + nxFmt(d) +
    (d ? '  <span style="opacity:.55">−' + nxFmt(d - v.currentTime) + '</span>' : '');
}
