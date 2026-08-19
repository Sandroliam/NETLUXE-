/* ============================================
   NETLUXE — Photo de profil : upload réel + recadrage
   Formats acceptés : JPG, JPEG, PNG, WebP.
   La photo est recadrée puis stockée en dataURL
   et reste associée au profil.
   ============================================ */

var NXPH = { img:null, scale:1, ox:0, oy:0, drag:false, sx:0, sy:0, size:320 };

var NX_PH_TYPES = ['image/jpeg','image/jpg','image/png','image/webp'];
var NX_PH_MAX   = 8 * 1024 * 1024;   /* 8 Mo avant recadrage */

function nxBuildCrop(){
  if(document.getElementById('nxPh')) return;
  var d = document.createElement('div');
  d.id = 'nxPh';
  d.className = 'nxph';
  d.innerHTML =
    '<div class="nxph-box">'+
      '<div class="nxph-hdr"><h3>Recadrer la photo</h3>'+
        '<button class="nxph-x" onclick="nxPhCancel()" aria-label="Annuler">✕</button></div>'+
      '<div class="nxph-stage">'+
        '<canvas id="nxphCv" width="320" height="320"></canvas>'+
        '<div class="nxph-mask"></div>'+
      '</div>'+
      '<div class="nxph-ctl">'+
        '<label class="nxph-lb">Zoom</label>'+
        '<input type="range" id="nxphZoom" min="100" max="300" value="100" '+
          'oninput="nxPhZoom(this.value)">'+
      '</div>'+
      '<p class="nxph-help">Faites glisser l\'image pour la positionner.</p>'+
      '<div class="nxph-ftr">'+
        '<button class="btn btn-o" onclick="nxPhCancel()">Annuler</button>'+
        '<button class="btn btn-p" onclick="nxPhApply()">Valider</button>'+
      '</div>'+
    '</div>';
  document.body.appendChild(d);

  var cv = document.getElementById('nxphCv');
  cv.addEventListener('mousedown', nxPhDown);
  cv.addEventListener('touchstart', nxPhDown, { passive:false });
  document.addEventListener('mousemove', nxPhMove);
  document.addEventListener('touchmove', nxPhMove, { passive:false });
  document.addEventListener('mouseup', nxPhUp);
  document.addEventListener('touchend', nxPhUp);
}

/* ---------- SÉLECTION DU FICHIER ---------- */
function nxPhPick(){
  var inp = document.getElementById('nxPhFile');
  if(!inp){
    inp = document.createElement('input');
    inp.type = 'file';
    inp.id = 'nxPhFile';
    inp.accept = 'image/jpeg,image/jpg,image/png,image/webp';
    inp.style.display = 'none';
    inp.addEventListener('change', nxPhLoad);
    document.body.appendChild(inp);
  }
  inp.value = '';
  inp.click();
}

function nxPhLoad(e){
  var f = e.target.files && e.target.files[0];
  if(!f) return;

  /* contrôle du format : refus explicite, pas de silence */
  var okType = false;
  for(var i=0;i<NX_PH_TYPES.length;i++){
    if(f.type === NX_PH_TYPES[i]) okType = true;
  }
  if(!okType){
    if(typeof showToast === 'function'){
      showToast('Format non accepté. Utilisez JPG, JPEG, PNG ou WebP.');
    }
    return;
  }
  if(f.size > NX_PH_MAX){
    if(typeof showToast === 'function'){
      showToast('Image trop lourde (' + Math.round(f.size/1048576) + ' Mo). Maximum 8 Mo.');
    }
    return;
  }

  var rd = new FileReader();
  rd.onload = function(ev){
    var im = new Image();
    im.onload = function(){
      nxBuildCrop();
      NXPH.img = im;
      NXPH.scale = 1;
      NXPH.ox = 0; NXPH.oy = 0;
      var z = document.getElementById('nxphZoom');
      if(z) z.value = 100;
      nxPhDraw();
      document.getElementById('nxPh').classList.add('on');
    };
    im.onerror = function(){
      if(typeof showToast === 'function') showToast('Image illisible');
    };
    im.src = ev.target.result;
  };
  rd.onerror = function(){
    if(typeof showToast === 'function') showToast('Lecture du fichier impossible');
  };
  rd.readAsDataURL(f);
}

/* ---------- RENDU DU RECADRAGE ---------- */
function nxPhDraw(){
  var cv = document.getElementById('nxphCv');
  if(!cv || !NXPH.img) return;
  var ctx = cv.getContext('2d');
  var S = NXPH.size;

  ctx.clearRect(0,0,S,S);
  ctx.fillStyle = '#141414';
  ctx.fillRect(0,0,S,S);

  var im = NXPH.img;
  /* remplir le carré, puis appliquer le zoom */
  var base = Math.max(S / im.width, S / im.height);
  var sc = base * NXPH.scale;
  var w = im.width * sc, h = im.height * sc;
  var x = (S - w) / 2 + NXPH.ox;
  var y = (S - h) / 2 + NXPH.oy;

  ctx.drawImage(im, x, y, w, h);
}

function nxPhZoom(v){
  NXPH.scale = parseInt(v,10) / 100;
  nxPhClamp();
  nxPhDraw();
}

/* Empêcher de sortir de l'image */
function nxPhClamp(){
  if(!NXPH.img) return;
  var S = NXPH.size, im = NXPH.img;
  var base = Math.max(S / im.width, S / im.height);
  var sc = base * NXPH.scale;
  var w = im.width * sc, h = im.height * sc;
  var mx = Math.max(0, (w - S) / 2);
  var my = Math.max(0, (h - S) / 2);
  if(NXPH.ox >  mx) NXPH.ox =  mx;
  if(NXPH.ox < -mx) NXPH.ox = -mx;
  if(NXPH.oy >  my) NXPH.oy =  my;
  if(NXPH.oy < -my) NXPH.oy = -my;
}

/* ---------- DÉPLACEMENT ---------- */
function nxPhPt(e){
  if(e.touches && e.touches[0]) return { x:e.touches[0].clientX, y:e.touches[0].clientY };
  return { x:e.clientX, y:e.clientY };
}
function nxPhDown(e){
  if(!NXPH.img) return;
  e.preventDefault();
  NXPH.drag = true;
  var p = nxPhPt(e);
  NXPH.sx = p.x - NXPH.ox;
  NXPH.sy = p.y - NXPH.oy;
}
function nxPhMove(e){
  if(!NXPH.drag) return;
  e.preventDefault();
  var p = nxPhPt(e);
  NXPH.ox = p.x - NXPH.sx;
  NXPH.oy = p.y - NXPH.sy;
  nxPhClamp();
  nxPhDraw();
}
function nxPhUp(){ NXPH.drag = false; }

/* ---------- VALIDATION ---------- */
function nxPhApply(){
  var cv = document.getElementById('nxphCv');
  if(!cv || !NXPH.img) return;

  /* export en 256px : suffisant pour un avatar, léger en stockage */
  var out = document.createElement('canvas');
  out.width = 256; out.height = 256;
  out.getContext('2d').drawImage(cv, 0, 0, 256, 256);

  var data;
  try { data = out.toDataURL('image/jpeg', 0.86); }
  catch(e){
    if(typeof showToast === 'function') showToast('Export impossible');
    return;
  }

  /* associer au profil en cours d'édition */
  if(typeof NXCR !== 'undefined'){
    NXCR.photo = data;
    NXCR.avatarId = null;          /* la photo remplace l'avatar */
    if(typeof nxcrPreview === 'function') nxcrPreview();
  }
  nxPhCancel();
  if(typeof showToast === 'function') showToast('Photo ajoutée');
}

function nxPhCancel(){
  var e = document.getElementById('nxPh');
  if(e) e.classList.remove('on');
  NXPH.img = null;
  NXPH.drag = false;
}

/* Retirer la photo et revenir à un avatar */
function nxPhRemove(){
  if(typeof NXCR === 'undefined') return;
  NXCR.photo = null;
  if(!NXCR.avatarId && typeof nxAvDefault === 'function'){
    NXCR.avatarId = nxAvDefault(NXCR.ptype || 'mixed');
  }
  if(typeof nxcrPreview === 'function') nxcrPreview();
  if(typeof showToast === 'function') showToast('Photo retirée');
}
