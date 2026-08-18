/* ============================================
   NETLUXE PLAYER — Moteur (core)
   ============================================ */
var NXP = {
  el:null, vid:null, cur:null, series:null, epIdx:0,
  hls:null, vol:1, muted:false, bri:1, speed:1,
  ccOn:false, ccLang:'FR', audioLang:'FR', quality:'auto',
  hideT:null, dragging:false, nextT:null, nextCd:0, autoNext:true, ended:false
};

function nx(id){ return document.getElementById(id); }

function nxFmt(s){
  if(!isFinite(s) || s < 0) s = 0;
  s = Math.floor(s);
  var h = Math.floor(s/3600), m = Math.floor((s%3600)/60), x = s%60;
  var p = function(n){ return n<10 ? '0'+n : ''+n; };
  return h > 0 ? h+':'+p(m)+':'+p(x) : p(m)+':'+p(x);
}

function nxpToast(msg){
  var t = nx('nxpToast'); if(!t) return;
  t.textContent = msg; t.classList.add('on');
  clearTimeout(t._t); t._t = setTimeout(function(){ t.classList.remove('on'); }, 1500);
}

/* ---------- OUVERTURE ---------- */
function nxpOpen(item, seriesList, epIndex){
  nxpBuildDOM();
  NXP.el = nx('nxp'); NXP.vid = nx('nxpVid');
  NXP.cur = item;
  NXP.series = seriesList || null;
  NXP.epIdx = epIndex || 0;
  NXP.ended = false;

  /* préférences du profil */
  try {
    if(typeof prefs === 'function'){
      var p = prefs();
      NXP.speed = parseFloat(p.speed) || 1;
      NXP.audioLang = p.audio || 'FR';
      NXP.ccLang = (p.subs && p.subs !== 'off') ? p.subs : 'FR';
      NXP.ccOn = !!(p.subs && p.subs !== 'off');
      NXP.quality = p.quality || 'auto';
      NXP.autoNext = p.autoplayNext !== false;
      var sz = {sm:15, md:19, lg:24}[p.subsSize || 'md'];
      document.documentElement.style.setProperty('--nxCcSize', sz+'px');
    }
  } catch(e){}

  /* langues réellement disponibles pour CE contenu */
  var aud = (item.audio && item.audio.length) ? item.audio : ['EN'];
  if(aud.indexOf(NXP.audioLang) === -1) NXP.audioLang = aud[0];
  var sub = item.subs || [];
  if(sub.length === 0){ NXP.ccOn = false; }
  else if(sub.indexOf(NXP.ccLang) === -1){ NXP.ccLang = sub[0]; }

  NXP.el.classList.add('on');
  document.body.style.overflow = 'hidden';

  nxpLoadSource(item);
  nxpHeader();
  nxpRenderPanel('root');
  nxpBindOnce();
  nxpSyncCc();
  nxpEpBtns();
  nxpShowUI();

  /* aide rotation sur mobile portrait */
  if(window.innerWidth < 768 && window.innerHeight > window.innerWidth){
    nx('nxpRot').classList.add('on');
    setTimeout(function(){ nx('nxpRot').classList.remove('on'); }, 4200);
  }
}

function nxpLoadSource(item){
  var v = NXP.vid, src = item.video || '';
  nx('nxpLoad').classList.add('on');

  if(NXP.hls){ try{ NXP.hls.destroy(); }catch(e){} NXP.hls = null; }

  var isHls = /\.m3u8(\?|$)/i.test(src);
  if(isHls && typeof Hls !== 'undefined' && Hls.isSupported()){
    NXP.hls = new Hls({ capLevelToPlayerSize:true });
    NXP.hls.loadSource(src);
    NXP.hls.attachMedia(v);
    NXP.hls.on(Hls.Events.MANIFEST_PARSED, function(){
      nxpApplyQuality();
      nxpRenderPanel('root');
      v.play().catch(function(){});
    });
    NXP.hls.on(Hls.Events.ERROR, function(e, d){
      if(d && d.fatal){ nx('nxpLoad').classList.remove('on'); nxpToast('Flux indisponible'); }
    });
  } else {
    v.src = src;
    v.load();
    v.play().catch(function(){});
  }

  v.playbackRate = NXP.speed;
  v.volume = NXP.vol;
  v.muted = NXP.muted;

  /* reprise de lecture */
  try {
    if(typeof prof !== 'undefined' && prof && prof.progress && prof.progress[item.id]){
      var pc = parseFloat(prof.progress[item.id]);
      if(pc > 2 && pc < 95){
        v.addEventListener('loadedmetadata', function once(){
          v.removeEventListener('loadedmetadata', once);
          if(isFinite(v.duration)){
            v.currentTime = v.duration * (pc/100);
            nxpToast('Reprise à ' + Math.round(pc) + '%');
          }
        });
      }
    }
  } catch(e){}
}

function nxpHeader(){
  var it = NXP.cur;
  nx('nxpTtl').textContent = it.title || '—';
  var bits = [];
  if(NXP.series && NXP.series.length > 1) bits.push('Épisode ' + (NXP.epIdx+1) + ' / ' + NXP.series.length);
  if(it.year) bits.push(it.year);
  if(it.genre) bits.push(it.genre);
  nx('nxpSub').textContent = bits.join('  ·  ');
  nx('nxpSpdBtn').textContent = (NXP.speed === 1 ? '1' : NXP.speed) + '×';
}

function nxpEpBtns(){
  var multi = NXP.series && NXP.series.length > 1;
  nx('nxpPrev').disabled = !multi || NXP.epIdx <= 0;
  nx('nxpNext').disabled = !multi || NXP.epIdx >= NXP.series.length - 1;
}

/* ---------- FERMETURE ---------- */
function nxpClose(){
  nxpSaveProgress();
  var v = NXP.vid;
  if(v){ v.pause(); v.removeAttribute('src'); v.load(); }
  if(NXP.hls){ try{ NXP.hls.destroy(); }catch(e){} NXP.hls = null; }
  if(NXP.el) NXP.el.classList.remove('on','playing','hid');
  nx('nxpPanel').classList.remove('on');
  nx('nxpInfo').classList.remove('on');
  nxpCancelNext();
  document.body.style.overflow = '';
  if(document.fullscreenElement){ document.exitFullscreen().catch(function(){}); }
  try { if(screen.orientation && screen.orientation.unlock) screen.orientation.unlock(); } catch(e){}
  document.body.style.filter = '';
  if(typeof goHome === 'function' && typeof prof !== 'undefined' && prof){
    try { goHome(); } catch(e){}
  }
}

function nxpSaveProgress(){
  try {
    var v = NXP.vid;
    if(!v || !NXP.cur || !isFinite(v.duration) || v.duration < 1) return;
    if(typeof prof === 'undefined' || !prof) return;
    var pc = (v.currentTime / v.duration) * 100;
    if(!prof.progress) prof.progress = {};
    if(!prof.history) prof.history = [];
    prof.progress[NXP.cur.id] = Math.min(100, Math.max(0, pc));
    var seen = false;
    for(var i=0;i<prof.history.length;i++){
      var hid = prof.history[i] && prof.history[i].id !== undefined ? prof.history[i].id : prof.history[i];
      if(hid == NXP.cur.id){ seen = true; break; }
    }
    if(!seen) prof.history.unshift({ id:NXP.cur.id, at:new Date().toISOString() });
    if(prof.history.length > 60) prof.history = prof.history.slice(0,60);
    if(typeof saveProfile === 'function') saveProfile();
  } catch(e){}
}

/* ---------- LECTURE ---------- */
function nxpTogglePlay(){
  var v = NXP.vid; if(!v) return;
  if(v.paused){ v.play().catch(function(){}); } else { v.pause(); }
}
function nxpSkip(sec){
  var v = NXP.vid; if(!v || !isFinite(v.duration)) return;
  v.currentTime = Math.max(0, Math.min(v.duration, v.currentTime + sec));
  var j = nx(sec < 0 ? 'nxpJumpL' : 'nxpJumpR');
  j.classList.add('on');
  clearTimeout(j._t); j._t = setTimeout(function(){ j.classList.remove('on'); }, 520);
  nxpShowUI();
}
function nxpSetVol(x){
  x = Math.max(0, Math.min(1, x));
  NXP.vol = x; NXP.muted = (x === 0);
  if(NXP.vid){ NXP.vid.volume = x; NXP.vid.muted = NXP.muted; }
  nx('nxpVolSl').value = Math.round(x*100);
  nx('nxpMute').textContent = x === 0 ? '🔇' : (x < 0.5 ? '🔉' : '🔊');
}
function nxpToggleMute(){
  if(NXP.muted || NXP.vol === 0){ nxpSetVol(NXP._pv || 0.8); }
  else { NXP._pv = NXP.vol; nxpSetVol(0); }
}
function nxpSetSpeed(s){
  NXP.speed = parseFloat(s) || 1;
  if(NXP.vid) NXP.vid.playbackRate = NXP.speed;
  nx('nxpSpdBtn').textContent = (NXP.speed === 1 ? '1' : NXP.speed) + '×';
  try { if(typeof setPref === 'function'){ prefs().speed = NXP.speed; if(typeof saveProfile==='function') saveProfile(); } } catch(e){}
  nxpRenderPanel('speed');
  nxpToast('Vitesse ' + NXP.speed + '×');
}
function nxpSetBri(x){
  x = Math.max(0.25, Math.min(1, x));
  NXP.bri = x;
  nx('nxpDim').style.opacity = (1 - x) * 0.82;
}
