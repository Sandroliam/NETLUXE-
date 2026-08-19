/* ============================================
   NETLUXE — Création / édition de profil
   Avatars SVG + type + enfant/adulte
   ============================================ */

var NXCR = { mode:'add', id:null, avatarId:'pre1', photo:null, ptype:'mixed', color:'#D4AF37', ageGroup:'adult' };

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
         '<span class="tx"><b>'+g.label+'</b><small>'+nxAgeDesc(g.key)+'</small></span>'+
         '<span class="mx">'+g.maxRating+'</span>'+
         '<span class="rd"></span></button>';
  }
  box.innerHTML = h;
}

function nxcrPickAge(k){
  NXCR.ageGroup = k;
  /* proposer le portrait correspondant, sauf si l'utilisateur a deja choisi */
  if(!NXCR.avatarPicked && !NXCR.photo && typeof nxAvDefault === 'function'){
    NXCR.avatarId = nxAvDefault(NXCR.ptype, k);
    if(typeof nxcrPreview === 'function') nxcrPreview();
  }
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
      '<span class="rd"></span></div>';
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
      NXCR.avatarId = 'por4';
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
    NXCR.avatarPicked = true;   /* choix explicite : ne plus jamais l'ecraser */
    NXCR.photo = null;          /* l'avatar remplace la photo */
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
  var rm = document.getElementById('nxcrRmPh');

  /* la photo réelle prime sur l'avatar */
  if(NXCR.photo){
    av.innerHTML = '<img src="'+NXCR.photo+'" alt="" style="width:100%;height:100%;object-fit:cover;display:block">';
    av.style.background = 'transparent';
    av.textContent = '';
    if(rm) rm.style.display = 'block';
    return;
  }
  if(rm) rm.style.display = 'none';

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
  NXCR = { mode:'add', id:null, avatarId:'por1', photo:null, avatarPicked:false,
           ptype:'mixed', color:'#D4AF37', ageGroup:'adult' };
  document.getElementById('nxcrT').textContent = 'Créer un nouveau profil';
  var sb1 = document.getElementById('nxcrSub');
  if(sb1) sb1.textContent = 'Personnalisez l\'expérience pour chaque utilisateur.';
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
    photo: p.photo || null,
    avatarPicked: !!p.avatarPicked,
    ageGroup: p.ageGroup || ((p.ptype === 'kids') ? 'kids' : 'adult')
  };
  document.getElementById('nxcrT').textContent = 'Modifier le profil';
  var sb2 = document.getElementById('nxcrSub');
  if(sb2) sb2.textContent = 'Ajustez l\'avatar, le nom et les préférences de ce profil.';
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
      avatarPicked:!!NXCR.avatarPicked,
      color:NXCR.color,
      ptype:NXCR.ptype,
      photo:NXCR.photo || null,
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
        u.profiles[i].avatarPicked = !!NXCR.avatarPicked;
        u.profiles[i].color = NXCR.color;
        u.profiles[i].ptype = NXCR.ptype;
        u.profiles[i].photo = NXCR.photo || null;
        u.profiles[i].ageGroup = NXCR.ageGroup || 'adult';
        u.profiles[i].isKid = (NXCR.ptype === 'kids');
        if(prof && prof.id === NXCR.id){
          prof.name = nm; prof.avatarId = NXCR.avatarId;
          prof.avatarPicked = !!NXCR.avatarPicked;
          prof.color = NXCR.color; prof.ptype = NXCR.ptype;
          prof.photo = NXCR.photo || null;
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
