/* ============================================
   NETLUXE — Sélecteur d'avatars (galerie)
   ============================================ */

var NXAVP = { cat:'cinema', picked:null, kidsOnly:false, onPick:null };

function nxAvpBuild(){
  if(document.getElementById('nxavp')) return;
  var d = document.createElement('div');
  d.id = 'nxavp';
  d.className = 'nxavp';
  d.innerHTML =
    '<div class="nxavp-box">'+
      '<div class="nxavp-hdr">'+
        '<h3>Choisir un avatar</h3>'+
        '<button class="nxavp-x" onclick="nxAvpClose()" aria-label="Fermer">✕</button>'+
      '</div>'+
      '<div class="nxavp-tabs" id="nxavpTabs"></div>'+
      '<div class="nxavp-grid" id="nxavpGrid"></div>'+
      '<div class="nxavp-ftr">'+
        '<button class="btn btn-o" onclick="nxAvpClose()">Annuler</button>'+
        '<button class="btn btn-p" onclick="nxAvpConfirm()">Choisir cet avatar</button>'+
      '</div>'+
    '</div>';
  document.body.appendChild(d);
  d.addEventListener('click', function(e){ if(e.target === d) nxAvpClose(); });
}

function nxAvpTabs(){
  var box = document.getElementById('nxavpTabs');
  if(!box) return;
  var cats = NXAVP.kidsOnly
    ? NX_AV_CATS.filter(function(c){ return c.key==='kids' || c.key==='caribbean'; })
    : NX_AV_CATS;
  var h = '';
  for(var i=0;i<cats.length;i++){
    var c = cats[i];
    h += '<button class="nxavp-tab'+(c.key===NXAVP.cat?' on':'')+'" onclick="nxAvpCat(\''+c.key+'\')">'+
         '<span>'+c.ic+'</span>'+c.label+'</button>';
  }
  box.innerHTML = h;
}

function nxAvpCat(k){
  NXAVP.cat = k;
  nxAvpTabs();
  nxAvpGrid();
}

function nxAvpGrid(){
  var box = document.getElementById('nxavpGrid');
  if(!box) return;
  var list = NX_AV[NXAVP.cat] || [];
  var h = '';
  for(var i=0;i<list.length;i++){
    var a = list[i];
    h += '<div class="nxavp-item'+(a.id===NXAVP.picked?' on':'')+'" onclick="nxAvpPick(\''+a.id+'\')" '+
         'role="button" tabindex="0" aria-label="'+a.name+'">'+
         '<div class="nxavp-sv">'+nxAvRender(a.id, 96)+'</div>'+
         '<div class="nxavp-nm">'+a.name+'</div>'+
         '<div class="nxavp-ck">✓</div>'+
         '</div>';
  }
  box.innerHTML = h || '<div class="nxavp-empty">Aucun avatar dans cette catégorie</div>';
}

function nxAvpPick(id){
  NXAVP.picked = id;
  nxAvpGrid();
}

function nxAvpOpen(currentId, kidsOnly, onPick){
  nxAvpBuild();
  NXAVP.kidsOnly = !!kidsOnly;
  NXAVP.picked = currentId || null;
  NXAVP.onPick = onPick || null;
  /* ouvrir sur la catégorie de l'avatar actuel */
  var a = currentId ? nxAvGet(currentId) : null;
  if(a) NXAVP.cat = a.cat;
  else NXAVP.cat = NXAVP.kidsOnly ? 'kids' : 'cinema';
  nxAvpTabs();
  nxAvpGrid();
  document.getElementById('nxavp').classList.add('on');
}

function nxAvpClose(){
  var e = document.getElementById('nxavp');
  if(e) e.classList.remove('on');
}

function nxAvpConfirm(){
  if(!NXAVP.picked){
    if(typeof showToast === 'function') showToast('Sélectionnez un avatar');
    return;
  }
  if(typeof NXAVP.onPick === 'function') NXAVP.onPick(NXAVP.picked);
  nxAvpClose();
}
