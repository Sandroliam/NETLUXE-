/* ============================================
   NETLUXE PLAYER — Gestes tactiles & événements
   ============================================ */
var NXP_BOUND = false;

function nxpBindOnce(){
  if(NXP_BOUND) return;
  NXP_BOUND = true;
  var v = NXP.vid;

  /* ---------- ÉVÉNEMENTS VIDÉO ---------- */
  v.addEventListener('play', function(){
    NXP.el.classList.add('playing');
    nx('nxpPP').textContent = '❚❚';
    nx('nxpBig').textContent = '❚❚';
    nxpShowUI();
  });
  v.addEventListener('pause', function(){
    NXP.el.classList.remove('playing');
    nx('nxpPP').textContent = '▶';
    nx('nxpBig').textContent = '▶';
    NXP.el.classList.remove('hid');
    clearTimeout(NXP.hideT);
  });
  v.addEventListener('waiting', function(){ nx('nxpLoad').classList.add('on'); });
  v.addEventListener('playing', function(){ nx('nxpLoad').classList.remove('on'); });
  v.addEventListener('canplay', function(){ nx('nxpLoad').classList.remove('on'); });
  v.addEventListener('loadedmetadata', function(){
    /* CORRECTIF v18.1 : la nouvelle source est prête.
       On applique la reprise éventuelle, PUIS on libère le verrou. */
    NXP.seeking = true;
    var target = 0;
    try {
      if(NXP.cur && typeof prof !== 'undefined' && prof && prof.progress){
        var pc = parseFloat(prof.progress[NXP.cur.id]);
        if(isFinite(pc) && pc > 2 && pc < 95 && isFinite(v.duration)){
          target = v.duration * (pc / 100);
        }
      }
    } catch(e){}
    if(target > 0){
      v.currentTime = target;
      nxpToast('Reprise à ' + Math.round((target / v.duration) * 100) + '%');
    } else {
      v.currentTime = 0;
    }
    /* libérer après application, pour ne pas écraser la position d'un autre titre */
    setTimeout(function(){ NXP.seeking = false; }, 220);
    nxpUpdateBar();
    nxpRenderPanel(nx('nxpPanel').classList.contains('on') ? 'root' : null);
  });
  v.addEventListener('timeupdate', function(){
    if(!NXP.dragging) nxpUpdateBar();
    /* proposer l'épisode suivant à 45s de la fin */
    if(isFinite(v.duration) && v.duration > 90 && NXP.series && NXP.series.length > 1){
      var left = v.duration - v.currentTime;
      if(left <= 45 && left > 2 && !NXP.nextT && !NXP.ended) nxpOfferNext();
    }
    /* sauvegarde périodique — jamais pendant un changement de contenu */
    if(!v.paused && !NXP.seeking && Math.floor(v.currentTime) % 10 === 0) nxpSaveProgress();
  });
  v.addEventListener('progress', nxpUpdateBar);
  v.addEventListener('ended', function(){
    NXP.ended = true;
    nxpSaveProgress();
    NXP.el.classList.remove('hid');
    if(NXP.series && NXP.epIdx < NXP.series.length - 1){
      if(NXP.autoNext) nxpNextEp(); else nxpOfferNext();
    }
  });
  v.addEventListener('error', function(){
    nx('nxpLoad').classList.remove('on');
    nxpToast('Vidéo indisponible');
  });
  v.addEventListener('volumechange', function(){
    nx('nxpVolSl').value = Math.round(v.volume*100);
    nx('nxpMute').textContent = (v.muted || v.volume === 0) ? '🔇' : (v.volume < 0.5 ? '🔉' : '🔊');
  });

  /* ---------- BARRE DE PROGRESSION ---------- */
  var track = nx('nxpTrack');
  function seekTo(e){
    var x = nxpSeekFromEvent(e);
    if(x === null) return;
    v.currentTime = x * v.duration;
    nx('nxpFill').style.width = (x*100)+'%';
    nx('nxpKnob').style.left = (x*100)+'%';
  }
  track.addEventListener('mousedown', function(e){
    NXP.dragging = true; track.classList.add('drag'); seekTo(e);
  });
  track.addEventListener('mousemove', function(e){
    var x = nxpSeekFromEvent(e);
    if(x === null) return;
    var pk = nx('nxpPeek'), r = track.getBoundingClientRect();
    pk.classList.add('on');
    pk.style.left = Math.max(46, Math.min(r.width-46, e.clientX - r.left)) + 'px';
    nx('nxpPeekTm').textContent = nxFmt(x * v.duration);
    nx('nxpPeekLb').textContent = NXP.cur ? (NXP.cur.title || '').slice(0,26) : 'Aperçu';
    if(NXP.dragging) seekTo(e);
  });
  track.addEventListener('mouseleave', function(){ nx('nxpPeek').classList.remove('on'); });
  document.addEventListener('mouseup', function(){
    if(NXP.dragging){ NXP.dragging = false; track.classList.remove('drag'); nxpShowUI(); }
  });
  /* tactile */
  track.addEventListener('touchstart', function(e){
    NXP.dragging = true; track.classList.add('drag'); seekTo(e);
    var x = nxpSeekFromEvent(e);
    if(x !== null){ nx('nxpPeek').classList.add('on'); nx('nxpPeekTm').textContent = nxFmt(x*v.duration); }
  }, {passive:true});
  track.addEventListener('touchmove', function(e){
    seekTo(e);
    var x = nxpSeekFromEvent(e), r = track.getBoundingClientRect();
    if(x !== null){
      nx('nxpPeek').style.left = Math.max(46, Math.min(r.width-46, x*r.width)) + 'px';
      nx('nxpPeekTm').textContent = nxFmt(x*v.duration);
    }
  }, {passive:true});
  track.addEventListener('touchend', function(){
    NXP.dragging = false; track.classList.remove('drag');
    nx('nxpPeek').classList.remove('on'); nxpShowUI();
  });

  /* ---------- GESTES : luminosité (gauche) / volume (droite) ---------- */
  function verticalGesture(zoneId, kind){
    var z = nx(zoneId), startY = 0, startVal = 0, active = false;
    z.addEventListener('touchstart', function(e){
      if(e.touches.length !== 1) return;
      startY = e.touches[0].clientY;
      startVal = (kind === 'vol') ? NXP.vol : NXP.bri;
      active = false;
    }, {passive:true});
    z.addEventListener('touchmove', function(e){
      if(e.touches.length !== 1) return;
      var dy = startY - e.touches[0].clientY;
      if(Math.abs(dy) < 12) return;
      active = true;
      var delta = dy / (z.offsetHeight * 0.62);
      var val = Math.max(0, Math.min(1, startVal + delta));
      if(kind === 'vol'){
        nxpSetVol(val);
        var hv = nx('nxpHintVol');
        hv.classList.add('on');
        nx('nxpVolBar').style.height = (val*100)+'%';
        nx('nxpVolPc').textContent = Math.round(val*100)+'%';
        nx('nxpVolIco').textContent = val === 0 ? '🔇' : (val < 0.5 ? '🔉' : '🔊');
        clearTimeout(hv._t); hv._t = setTimeout(function(){ hv.classList.remove('on'); }, 700);
      } else {
        nxpSetBri(Math.max(0.25, val));
        var hb = nx('nxpHintBri');
        hb.classList.add('on');
        nx('nxpBriBar').style.height = (NXP.bri*100)+'%';
        nx('nxpBriPc').textContent = Math.round(NXP.bri*100)+'%';
        clearTimeout(hb._t); hb._t = setTimeout(function(){ hb.classList.remove('on'); }, 700);
      }
    }, {passive:true});
    z.addEventListener('touchend', function(){
      if(!active) nxpZoneTap(zoneId);
    });
    /* clic souris = tap */
    z.addEventListener('click', function(){ if(!('ontouchstart' in window)) nxpZoneTap(zoneId); });
  }
  verticalGesture('nxpZL', 'bri');
  verticalGesture('nxpZR', 'vol');

  /* zone centrale : tap = afficher/masquer, double-tap = plein écran */
  var zm = nx('nxpZM'), lastTapM = 0;
  zm.addEventListener('click', function(){
    var now = Date.now();
    if(now - lastTapM < 300){ nxpToggleFs(); lastTapM = 0; return; }
    lastTapM = now;
    setTimeout(function(){
      if(lastTapM && Date.now() - lastTapM >= 280){
        if(NXP.el.classList.contains('hid')) nxpShowUI();
        else if(!NXP.vid.paused) NXP.el.classList.add('hid');
        else nxpTogglePlay();
        lastTapM = 0;
      }
    }, 300);
  });

  /* double-tap latéral = saut ±10s */
  function doubleTapSkip(zoneId, sec){
    var z = nx(zoneId), last = 0;
    z.addEventListener('click', function(){
      var now = Date.now();
      if(now - last < 320){ nxpSkip(sec); last = 0; } else { last = now; }
    });
  }
  doubleTapSkip('nxpZL', -10);
  doubleTapSkip('nxpZR', 10);

  /* ---------- SOURIS : révéler l'UI ---------- */
  NXP.el.addEventListener('mousemove', function(){ if(!('ontouchstart' in window)) nxpShowUI(); });

  /* ---------- CLAVIER ---------- */
  document.addEventListener('keydown', function(e){
    if(!NXP.el || !NXP.el.classList.contains('on')) return;
    var k = e.key;
    if(k === ' ' || k === 'k'){ e.preventDefault(); nxpTogglePlay(); }
    else if(k === 'ArrowLeft'){ e.preventDefault(); nxpSkip(-10); }
    else if(k === 'ArrowRight'){ e.preventDefault(); nxpSkip(10); }
    else if(k === 'ArrowUp'){ e.preventDefault(); nxpSetVol(NXP.vol + 0.1); nxpShowUI(); }
    else if(k === 'ArrowDown'){ e.preventDefault(); nxpSetVol(NXP.vol - 0.1); nxpShowUI(); }
    else if(k === 'f'){ nxpToggleFs(); }
    else if(k === 'm'){ nxpToggleMute(); }
    else if(k === 'c'){ nxpToggleCc(); }
    else if(k === 'i'){ nxpToggleInfo(); }
    else if(k === 'Escape'){
      if(nx('nxpInfo').classList.contains('on')) nx('nxpInfo').classList.remove('on');
      else if(nx('nxpPanel').classList.contains('on')) nx('nxpPanel').classList.remove('on');
      else if(!document.fullscreenElement) nxpClose();
    }
    else if(k === 'n' && NXP.series){ nxpNextEp(); }
    else if(k === 'p' && NXP.series){ nxpPrevEp(); }
  });

  /* ---------- PLEIN ÉCRAN / ORIENTATION ---------- */
  document.addEventListener('fullscreenchange', function(){
    var on = !!document.fullscreenElement;
    nx('nxpFsBtn').textContent = on ? '⛽' : '⛶';
    nx('nxpFsBtn').innerHTML = on ? '&#10066;' : '⛶';
  });
  window.addEventListener('orientationchange', function(){
    setTimeout(function(){
      if(!NXP.el || !NXP.el.classList.contains('on')) return;
      var land = window.innerWidth > window.innerHeight;
      if(land) nx('nxpRot').classList.remove('on');
      nxpShowUI();
    }, 320);
  });

  /* fermer les panneaux au clic extérieur */
  NXP.el.addEventListener('click', function(e){
    var p = nx('nxpPanel');
    if(p.classList.contains('on') && !p.contains(e.target) &&
       !e.target.closest('[onclick*="nxpTogglePanel"]') && !e.target.closest('[onclick*="nxpOpenPanel"]')){
      p.classList.remove('on');
      nx('nxpBtnPanel').classList.remove('act');
    }
  });

  /* pause quand l'onglet passe en arrière-plan */
  document.addEventListener('visibilitychange', function(){
    if(document.hidden && NXP.vid && !NXP.vid.paused) nxpSaveProgress();
  });
}

function nxpZoneTap(zoneId){
  if(NXP.el.classList.contains('hid')) nxpShowUI();
  else if(!NXP.vid.paused) NXP.el.classList.add('hid');
  else nxpShowUI();
}
