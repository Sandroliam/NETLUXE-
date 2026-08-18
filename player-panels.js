/* ============================================
   NETLUXE PLAYER — Panneaux (paramètres + info)
   ============================================ */

function nxpTogglePanel(){
  var p = nx('nxpPanel');
  if(p.classList.contains('on')){ p.classList.remove('on'); }
  else { nxpRenderPanel('root'); p.classList.add('on'); nxpShowUI(); }
  nx('nxpBtnPanel').classList.toggle('act', p.classList.contains('on'));
}
function nxpOpenPanel(view){
  if(!view) return;
  nxpRenderPanel(view);
  nx('nxpPanel').classList.add('on');
  nxpShowUI();
}

function nxpRenderPanel(view){
  if(!view) return;
  var pb = nx('nxpPb'), ph = nx('nxpPh'), pt = nx('nxpPhT');
  if(!pb) return;
  var it = NXP.cur || {};
  var h = '';

  if(view === 'root'){
    ph.classList.remove('sub'); pt.textContent = 'Paramètres';
    h += nxpRow('🌐', 'Langue audio', nxpLangName(NXP.audioLang), "nxpOpenPanel('audio')");
    var subTxt = NXP.ccOn ? nxpLangName(NXP.ccLang) : 'Désactivés';
    h += nxpRow('💬', 'Sous-titres', subTxt, "nxpOpenPanel('subs')");
    h += nxpRow('🎚️', 'Qualité vidéo', NXP.quality === 'auto' ? 'Automatique' : NXP.quality + 'p', "nxpOpenPanel('quality')");
    h += nxpRow('⏱️', 'Vitesse de lecture', (NXP.speed === 1 ? 'Normale' : NXP.speed + '×'), "nxpOpenPanel('speed')");
    /* auto-play épisode suivant (séries seulement) */
    if(NXP.series && NXP.series.length > 1){
      h += '<div class="nxp-item leaf" onclick="nxpToggleAutoNext()">'+
           '<span class="lb"><span class="ic">⏭️</span>Épisode suivant auto</span>'+
           '<span class="nxp-sw'+(NXP.autoNext?' on':'')+'"></span></div>';
    }
    h += nxpRow('ℹ️', 'Informations', '', "nxpToggleInfo()");
    var srcNote = it.source ? it.source + (it.license ? ' — ' + it.license : '') : '';
    if(srcNote) h += '<div class="nxp-note">Source : ' + nxpEsc(srcNote) + '</div>';
  }

  else if(view === 'audio'){
    ph.classList.add('sub'); pt.textContent = 'Langue audio';
    var aud = (it.audio && it.audio.length) ? it.audio : ['EN'];
    for(var i=0;i<aud.length;i++){
      h += nxpChoice(nxpLangName(aud[i]), aud[i] === NXP.audioLang, "nxpSetAudio('"+aud[i]+"')");
    }
    h += '<div class="nxp-note">Seules les pistes réellement présentes dans ce contenu sont proposées.</div>';
  }

  else if(view === 'subs'){
    ph.classList.add('sub'); pt.textContent = 'Sous-titres';
    var sb = it.subs || [];
    h += nxpChoice('Désactivés', !NXP.ccOn, "nxpSetCcLang('off')");
    for(var j=0;j<sb.length;j++){
      h += nxpChoice(nxpLangName(sb[j]), NXP.ccOn && sb[j] === NXP.ccLang, "nxpSetCcLang('"+sb[j]+"')");
    }
    if(!sb.length) h += '<div class="nxp-note">Aucun fichier de sous-titres n\'est disponible pour ce contenu.</div>';
  }

  else if(view === 'quality'){
    ph.classList.add('sub'); pt.textContent = 'Qualité vidéo';
    var opts = [['auto','Automatique']];
    if(NXP.hls && NXP.hls.levels && NXP.hls.levels.length){
      var seen = {};
      for(var k=0;k<NXP.hls.levels.length;k++){
        var hh = NXP.hls.levels[k].height;
        if(hh && !seen[hh]){ seen[hh] = 1; opts.push([String(hh), hh + 'p']); }
      }
      opts.sort(function(a,b){ return a[0]==='auto' ? -1 : (b[0]==='auto' ? 1 : parseInt(b[0])-parseInt(a[0])); });
    } else {
      opts.push(['1080','1080p'],['720','720p'],['480','480p — économise les données']);
    }
    for(var q=0;q<opts.length;q++){
      h += nxpChoice(opts[q][1], NXP.quality === opts[q][0], "nxpSetQuality('"+opts[q][0]+"')");
    }
    if(!(NXP.hls && NXP.hls.levels && NXP.hls.levels.length)){
      h += '<div class="nxp-note">Ce contenu est diffusé en fichier unique : la qualité dépend de la source.</div>';
    }
  }

  else if(view === 'speed'){
    ph.classList.add('sub'); pt.textContent = 'Vitesse de lecture';
    var sp = [0.5, 0.75, 1, 1.25, 1.5, 2];
    for(var s=0;s<sp.length;s++){
      h += nxpChoice(sp[s] === 1 ? 'Normale' : sp[s] + '×', NXP.speed === sp[s], "nxpSetSpeed("+sp[s]+")");
    }
  }

  pb.innerHTML = h;
}

function nxpRow(ic, label, val, act){
  return '<div class="nxp-item" onclick="'+act+'">'+
    '<span class="lb"><span class="ic">'+ic+'</span>'+label+'</span>'+
    '<span class="vl">'+nxpEsc(val)+'</span></div>';
}
function nxpChoice(label, on, act){
  return '<div class="nxp-item leaf'+(on?' sel':'')+'" onclick="'+act+'">'+
    '<span class="lb"><span class="ck">'+(on?'✓':'')+'</span>'+nxpEsc(label)+'</span></div>';
}
function nxpEsc(s){
  return String(s==null?'':s).replace(/[&<>"']/g, function(m){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];
  });
}
function nxpToggleAutoNext(){
  NXP.autoNext = !NXP.autoNext;
  try { if(typeof prefs === 'function'){ prefs().autoplayNext = NXP.autoNext; if(typeof saveProfile==='function') saveProfile(); } } catch(e){}
  nxpRenderPanel('root');
  nxpToast(NXP.autoNext ? 'Lecture auto activée' : 'Lecture auto désactivée');
}

/* ---------- FICHE INFORMATIONS ---------- */
function nxpToggleInfo(){
  var p = nx('nxpInfo');
  if(p.classList.contains('on')){ p.classList.remove('on'); return; }
  nxpBuildInfo();
  nx('nxpPanel').classList.remove('on');
  p.classList.add('on');
  nxpShowUI();
}

function nxpAgeRating(it){
  if(it.rating) return it.rating;
  var g = (it.genre || '').toLowerCase();
  if(it.type === 'cartoon') return 'Tout public';
  if(/horreur|horror|thriller/.test(g)) return '16+';
  if(/action|guerre|crime|policier/.test(g)) return '12+';
  if(/document/.test(g)) return '12+';
  return 'Tout public';
}

function nxpBuildInfo(){
  var it = NXP.cur || {};
  var aud = (it.audio && it.audio.length) ? it.audio : ['EN'];
  var sub = it.subs || [];
  var h = '';

  h += '<h2>' + nxpEsc(it.title || '—') + '</h2>';

  h += '<div class="tag">';
  if(it.year) h += '<span class="nxp-chip">' + it.year + '</span>';
  if(it.genre) h += '<span class="nxp-chip turq">' + nxpEsc(it.genre) + '</span>';
  if(it.dur) h += '<span class="nxp-chip">' + nxpEsc(it.dur) + '</span>';
  h += '<span class="nxp-chip coral">' + nxpAgeRating(it) + '</span>';
  if(it.rat) h += '<span class="nxp-chip gold">★ ' + it.rat + '</span>';
  if(it.org) h += '<span class="nxp-chip gold">ORIGINAL NETLUXE</span>';
  h += '</div>';

  h += '<div class="syn">' + nxpEsc(it.desc || 'Aucun synopsis disponible.') + '</div>';

  h += '<div class="nxp-meta">';
  h += '<dl class="nxp-mi"><dt>Type</dt><dd>' +
       ({film:'Film', series:'Série', cartoon:'Animation'}[it.type] || 'Vidéo') + '</dd></dl>';
  if(it.dir) h += '<dl class="nxp-mi"><dt>Réalisation</dt><dd>' + nxpEsc(it.dir) + '</dd></dl>';
  h += '<dl class="nxp-mi"><dt>Classification</dt><dd>' + nxpAgeRating(it) + '</dd></dl>';
  h += '<dl class="nxp-mi"><dt>Langues audio</dt><dd>' +
       aud.map(nxpLangName).join(', ') + '</dd></dl>';
  h += '<dl class="nxp-mi"><dt>Sous-titres</dt><dd>' +
       (sub.length ? sub.map(nxpLangName).join(', ') : 'Aucun') + '</dd></dl>';
  if(it.views) h += '<dl class="nxp-mi"><dt>Vues</dt><dd>' + Number(it.views).toLocaleString('fr-FR') + '</dd></dl>';
  if(it.license) h += '<dl class="nxp-mi"><dt>Droits</dt><dd>' + nxpEsc(it.license) + '</dd></dl>';
  h += '</div>';

  /* Épisodes */
  if(NXP.series && NXP.series.length > 1){
    h += '<div class="nxp-eps"><h3>Épisodes — ' + NXP.series.length + '</h3>';
    for(var i=0;i<NXP.series.length;i++){
      var e = NXP.series[i];
      h += '<div class="nxp-ep' + (i === NXP.epIdx ? ' cur' : '') + '" onclick="nxpGoEp(' + i + ')">'+
        '<span class="no">' + (i+1) + '</span>'+
        '<span class="tx"><b>' + nxpEsc(e.title || ('Épisode ' + (i+1))) + '</b>'+
        '<small>' + nxpEsc(e.dur || '') + (e.year ? '  ·  ' + e.year : '') + '</small></span>'+
        '<span class="pl">' + (i === NXP.epIdx ? '▶' : '▷') + '</span></div>';
    }
    h += '</div>';
  }

  nx('nxpInfoIn').innerHTML = h;
}
function nxpGoEp(i){
  if(!NXP.series || i === NXP.epIdx){ nx('nxpInfo').classList.remove('on'); return; }
  nxpSaveProgress();
  nx('nxpInfo').classList.remove('on');
  NXP.epIdx = i;
  nxpOpen(NXP.series[i], NXP.series, i);
}
