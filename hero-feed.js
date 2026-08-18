/* ============================================
   NETLUXE — Bannière / fil d'actualité (carrousel)
   Contenus strictement liés au catalogue réel.
   ============================================ */

var NXH = { list:[], idx:0, timer:null, paused:false };

function nxHeroInit(){
  NXH.list = (typeof nxFeatured === 'function') ? nxFeatured(5) : [];
  if(!NXH.list.length) return;
  NXH.idx = 0;
  nxHeroRender();
  nxHeroDots();
  nxHeroAuto();
}

function nxHeroRender(){
  var c = NXH.list[NXH.idx];
  if(!c) return;

  /* on réutilise le hero existant pour ne rien casser */
  var bg = document.getElementById('heroBg');
  var tl = document.getElementById('heroTitle');
  var ds = document.getElementById('heroDesc');
  var mt = document.getElementById('heroMeta');

  if(bg){ bg.style.backgroundImage = 'url(' + c.img + ')'; }
  if(tl){ tl.textContent = c.title || ''; }
  if(ds){ ds.textContent = (c.desc || '').slice(0, 165); }

  if(mt){
    var typeLbl = c.type === 'film' ? 'FILM' : (c.type === 'series' ? 'SÉRIE' : 'ANIMÉ');
    var h = '';
    if(c.org) h += '<span class="nxh-badge gold">★ ORIGINAL NETLUXE</span>';
    h += '<span class="nxh-badge">' + typeLbl + '</span>';
    if(c.rat) h += '<span class="rat">★ ' + c.rat + '</span>';
    if(c.year) h += '<span class="sep"></span><span>' + c.year + '</span>';
    if(c.dur) h += '<span class="sep"></span><span>' + c.dur + '</span>';
    if(c.genre) h += '<span class="sep"></span><span>' + c.genre + '</span>';
    if(c.audio && c.audio.length) h += '<span class="sep"></span><span>🔊 ' + c.audio.join('/') + '</span>';
    if(c.subs && c.subs.length) h += '<span class="sep"></span><span>💬 ' + c.subs.join('/') + '</span>';
    mt.innerHTML = h;
  }

  /* IMPORTANT : synchroniser la globale `cur` pour que playHero/showHeroDetails
     visent exactement ce contenu (source du bug de correspondance) */
  try { cur = c; } catch(e){}

  nxHeroDotsSync();
}

/* ---------- PASTILLES DE NAVIGATION ---------- */
function nxHeroDots(){
  var hero = document.getElementById('hero');
  if(!hero) return;
  var old = document.getElementById('nxhDots');
  if(old) old.remove();
  if(NXH.list.length < 2) return;

  var d = document.createElement('div');
  d.id = 'nxhDots';
  d.className = 'nxh-dots';
  var h = '';
  for(var i=0;i<NXH.list.length;i++){
    h += '<button class="nxh-dot" onclick="nxHeroGo('+i+')" aria-label="Contenu '+(i+1)+'"></button>';
  }
  d.innerHTML = h;
  hero.appendChild(d);

  /* pause au survol */
  hero.addEventListener('mouseenter', function(){ NXH.paused = true; });
  hero.addEventListener('mouseleave', function(){ NXH.paused = false; });

  /* swipe tactile */
  var sx = 0;
  hero.addEventListener('touchstart', function(e){ sx = e.touches[0].clientX; }, {passive:true});
  hero.addEventListener('touchend', function(e){
    var dx = e.changedTouches[0].clientX - sx;
    if(Math.abs(dx) > 55){ dx < 0 ? nxHeroNext() : nxHeroPrev(); }
  });
}
function nxHeroDotsSync(){
  var dots = document.querySelectorAll('#nxhDots .nxh-dot');
  for(var i=0;i<dots.length;i++){
    dots[i].classList.toggle('on', i === NXH.idx);
  }
}

/* ---------- NAVIGATION ---------- */
function nxHeroGo(i){
  if(i < 0 || i >= NXH.list.length) return;
  NXH.idx = i;
  nxHeroRender();
  nxHeroAuto();
}
function nxHeroNext(){ nxHeroGo((NXH.idx + 1) % NXH.list.length); }
function nxHeroPrev(){ nxHeroGo((NXH.idx - 1 + NXH.list.length) % NXH.list.length); }

function nxHeroAuto(){
  clearInterval(NXH.timer);
  if(NXH.list.length < 2) return;
  NXH.timer = setInterval(function(){
    if(NXH.paused) return;
    var app = document.getElementById('app');
    var home = document.getElementById('homeSections');
    var player = document.getElementById('nxp');
    /* ne tourne que si l'accueil est visible et le lecteur fermé */
    if(!app || getComputedStyle(app).display === 'none') return;
    if(!home || getComputedStyle(home).display === 'none') return;
    if(player && player.classList.contains('on')) return;
    nxHeroNext();
  }, 7000);
}

/* ---------- LECTURE DIRECTE DEPUIS LA BANNIÈRE ---------- */
function nxHeroPlay(){
  var c = NXH.list[NXH.idx];
  if(!c){ if(typeof showToast==='function') showToast('Aucun contenu à lire'); return; }
  try { cur = c; } catch(e){}
  if(typeof playVideo === 'function') playVideo(c.id);
}
function nxHeroInfo(){
  var c = NXH.list[NXH.idx];
  if(!c) return;
  try { cur = c; } catch(e){}
  if(typeof showDetail === 'function') showDetail(c.id);
}
