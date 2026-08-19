/* ============================================
   NETLUXE — Création / édition de profil
   Avatars SVG + type + enfant/adulte
   ============================================ */

var NXCR = { mode:'add', id:null, avatarId:'pre1', ptype:'mixed', color:'#D4AF37', ageGroup:'adult' };

/* ---------- TYPES ---------- */
/* ---------- TRANCHES D'ÂGE ---------- */
function nxcrRenderAges(){
  var box = document.getElementById('nxcrAges');
  if(!box || typeof nxAgeOptions !== 'function') return;
  var opts = nxAgeOptions();
  var h = '';
  for(var i=0;i<opts.length;i++){
    var g = opts[i];
    var on = (NXCR.ageGroup === g.key);
    h += '<button class="nxcr-age'+(on?' on':'')+'" onclick="nxcrPickAge(\''+g.key+'\')">'+
         '<span class="ic">'+nxAgeIcon(g.key)+'</span>'+
         '<span class="lb">'+g.label+'</span>'+
         '<span class="mx">'+g.maxRating+'</span></button>';
  }
  box.innerHTML = h;
}

function nxcrPickAge(k){
  NXCR.ageGroup = k;
  /* cohérence : Mode Kids implique le type de profil enfant */
  if(k === 'kids' && NXCR.ptype !== 'kids'){
    NXCR.ptype = 'kids';
    nxcrRenderTypes();
    if(typeof nxcrPreview === 'function') nxcrPreview();
  }
  nxcrRenderAges();
}

function nxcrRenderTypes(){
  var box = document.getElementById('nxcrTypes');
  if(!box) return;
  var order = ['mixed','films','series','cartoon','kids'];
  var h = '';
  for(var i=0;i<order.length;i++){
    var t = NX_PROFILE_TYPES[order[i]];
    var on = (NXCR.ptype === t.key);
    h += '<div class="nxcr-type'+(on?' on':'')+'" onclick="nxcrPickType(\''+t.key+'\')" '+
      'role="button" tabindex="0">'+
      '<span class="ic">'+t.ic+'</span>'+
      '<span class="tx"><b>'+t.label+'</b><small>'+t.desc+'</small></span>'+
      '<span class="ck">'+(on?'✓':'')+'</span></div>';
  }
  box.innerHTML = h;
}

function nxcrPickType(k){
  var wasKid = (NXCR.ptype === 'kids');
  NXCR.ptype = k;
  /* si on passe en profil enfant, proposer un avatar adapté */
  if(k === 'kids' && !wasKid){
    var a = nxAvGet(NXCR.avatarId);
    if(!a || (a.cat !== 'kids' && a.cat !== 'caribbean')){
      NXCR.avatarId = 'kid1';
    }
  }
  nxcrRenderTypes();
  nxcrPreview();
}

/* ---------- AVATAR ---------- */
function nxcrOpenAvatars(){
  var kidsOnly = (NXCR.ptype === 'kids');
  nxAvpOpen(NXCR.avatarId, kidsOnly, function(id){
    NXCR.avatarId = id;
    nxcrPreview();
    if(typeof showToast === 'function'){
      var a = nxAvGet(id);
      showToast('Avatar : ' + (a ? a.name : id));
    }
  });
}

function nxcrPreview(){
  var av = document.getElementById('nxcrAv');
  if(!av) return;
  if(NXCR.avatarId && typeof nxAvRender === 'function'){
    av.innerHTML = nxAvRender(NXCR.avatarId, 88);
    av.style.background = 'transparent';
  } else {
    var nm = (document.getElementById('nxcrName').value || '').trim();
    av.innerHTML = '';
    av.style.background = NXCR.color;
    av.textContent = nm ? nm.charAt(0).toUpperCase() : '?';
  }
}

/* ---------- OUVERTURE ---------- */
function nxOpenCreate(){
  nxBuildProfileScreen();
  NXCR = { mode:'add', id:null, avatarId:'pre1', ptype:'mixed', color:'#D4AF37', ageGroup:'adult' };
  document.getElementById('nxcrT').textContent = 'Nouveau profil';
  document.getElementById('nxcrName').value = '';
  document.getElementById('nxcrDanger').style.display = 'none';
  nxcrRenderAges();
  nxcrRenderTypes();
  nxcrPreview();
  document.getElementById('nxCreate').classList.add('on');
  setTimeout(function(){ var n = document.getElementById('nxcrName'); if(n) n.focus(); }, 120);
}

function nxOpenEdit(pid){
  nxBuildProfileScreen();
  var p = null;
  if(user && user.profiles){
    for(var i=0;i<user.profiles.length;i++){ if(user.profiles[i].id === pid) p = user.profiles[i]; }
  }
  if(!p) return;
  NXCR = {
    mode:'edit', id:pid,
    avatarId: p.avatarId || nxAvDefault(p.ptype || 'mixed'),
    ptype: p.ptype || 'mixed',
    color: p.color || '#D4AF37',
    ageGroup: p.ageGroup || ((p.ptype === 'kids') ? 'kids' : 'adult')
  };
  document.getElementById('nxcrT').textContent = 'Modifier le profil';
  document.getElementById('nxcrName').value = p.name || '';
  document.getElementById('nxcrDanger').style.display =
    (user.profiles.length > 1) ? 'block' : 'none';
  nxcrRenderAges();
  nxcrRenderTypes();
  nxcrPreview();
  document.getElementById('nxCreate').classList.add('on');
}

function nxCloseCreate(){
  var m = document.getElementById('nxCreate');
  if(m) m.classList.remove('on');
}

/* ---------- ENREGISTREMENT ---------- */
function nxcrSave(){
  var nm = (document.getElementById('nxcrName').value || '').trim();
  if(!nm){ if(typeof showToast === 'function') showToast('Entrez un nom de profil'); return; }
  if(!user || !user.email){ if(typeof showToast === 'function') showToast('Erreur de compte'); return; }

  var users = JSON.parse(localStorage.getItem('netluxe_users') || '{}');
  var u = users[user.email];
  if(!u){ if(typeof showToast === 'function') showToast('Compte introuvable'); return; }
  if(!u.profiles) u.profiles = [];

  /* nom déjà pris ? */
  for(var d=0;d<u.profiles.length;d++){
    if(u.profiles[d].name.toLowerCase() === nm.toLowerCase() && u.profiles[d].id !== NXCR.id){
      if(typeof showToast === 'function') showToast('Ce nom est déjà utilisé');
      return;
    }
  }

  if(NXCR.mode === 'add'){
    /* La limite dépend du plan souscrit : elle est réellement appliquée. */
    var cap = (typeof nxMaxProfiles === 'function') ? nxMaxProfiles() : 5;
    if(u.profiles.length >= cap){
      var pn = (typeof nxCurrentPlan === 'function' && nxCurrentPlan())
               ? nxCurrentPlan().name : 'actuelle';
      if(typeof showToast === 'function'){
        showToast('Formule ' + pn + ' : ' + cap + ' profils maximum. Changez de formule pour en ajouter.');
      }
      return;
    }
    var np = {
      id:'p_' + Date.now(),
      name:nm,
      avatarId:NXCR.avatarId,
      color:NXCR.color,
      ptype:NXCR.ptype,
      ageGroup:NXCR.ageGroup || 'adult',
      isKid:(NXCR.ptype === 'kids'),
      createdAt:new Date().toISOString(),
      lastActive:new Date().toISOString(),
      history:[], myList:[], progress:{}, likes:[],
      prefs:(typeof SETTINGS_DEFAULTS !== 'undefined')
            ? JSON.parse(JSON.stringify(SETTINGS_DEFAULTS))
            : { lang:'FR', audio:'FR', subs:'FR', speed:1 }
    };
    u.profiles.push(np);
    users[user.email] = u; user = u;
    localStorage.setItem('netluxe_users', JSON.stringify(users));
    localStorage.setItem('netluxe_user', JSON.stringify(user));
    nxCloseCreate();
    if(typeof showToast === 'function') showToast('Profil « ' + nm + ' » créé');
    nxRenderProfileGrid();
    nxPickProfile(np.id);

  } else {
    for(var i=0;i<u.profiles.length;i++){
      if(u.profiles[i].id === NXCR.id){
        u.profiles[i].name = nm;
        u.profiles[i].avatarId = NXCR.avatarId;
        u.profiles[i].color = NXCR.color;
        u.profiles[i].ptype = NXCR.ptype;
        u.profiles[i].ageGroup = NXCR.ageGroup || 'adult';
        u.profiles[i].isKid = (NXCR.ptype === 'kids');
        if(prof && prof.id === NXCR.id){
          prof.name = nm; prof.avatarId = NXCR.avatarId;
          prof.color = NXCR.color; prof.ptype = NXCR.ptype;
          prof.ageGroup = NXCR.ageGroup || 'adult';
          prof.isKid = (NXCR.ptype === 'kids');
          localStorage.setItem('netluxe_profile', JSON.stringify(prof));
        }
        break;
      }
    }
    users[user.email] = u; user = u;
    localStorage.setItem('netluxe_users', JSON.stringify(users));
    localStorage.setItem('netluxe_user', JSON.stringify(user));
    nxCloseCreate();
    if(typeof showToast === 'function') showToast('Profil mis à jour');
    nxRenderProfileGrid();
    if(prof && prof.id === NXCR.id){
      if(typeof updateProfileUI === 'function') updateProfileUI();
      var appEl = document.getElementById('app');
      if(appEl && getComputedStyle(appEl).display !== 'none' && typeof goHome === 'function') goHome();
    }
  }
}

/* ---------- SUPPRESSION ---------- */
function nxcrDelete(){
  if(!user || !user.profiles || user.profiles.length <= 1){
    if(typeof showToast === 'function') showToast('Impossible de supprimer le dernier profil');
    return;
  }
  var target = NXCR.id, nm = '';
  for(var i=0;i<user.profiles.length;i++){ if(user.profiles[i].id === target) nm = user.profiles[i].name; }
  if(!confirm('Supprimer le profil « ' + nm + ' » ?\n\nSon historique, sa liste et sa progression seront définitivement perdus.')) return;

  var users = JSON.parse(localStorage.getItem('netluxe_users') || '{}');
  var u = users[user.email];
  u.profiles = u.profiles.filter(function(p){ return p.id !== target; });
  users[user.email] = u; user = u;
  localStorage.setItem('netluxe_users', JSON.stringify(users));
  localStorage.setItem('netluxe_user', JSON.stringify(user));

  nxCloseCreate();
  if(typeof showToast === 'function') showToast('Profil supprimé');

  if(prof && prof.id === target){
    prof = null;
    localStorage.removeItem('netluxe_profile');
    nxShowProfileSelect();
  } else {
    nxRenderProfileGrid();
  }
}

function nxSwitchProfile(){ nxShowProfileSelect(); }
