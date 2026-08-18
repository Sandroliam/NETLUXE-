/* ============================================
   NETLUXE — Création / édition de profil typé
   ============================================ */

var NXCR = { mode:'add', id:null, color:'#D4AF37', ptype:'mixed', photo:null };
var NX_COLORS = ['#E50914','#D4AF37','#00CED1','#FF6B35','#22C55E','#8B5CF6','#EC4899','#3B82F6','#14B8A6','#F59E0B','#A855F7','#10B981'];

function nxcrRenderTypes(){
  var box = document.getElementById('nxcrTypes');
  if(!box) return;
  var order = ['mixed','films','series','cartoon','kids'];
  var h = '';
  for(var i=0;i<order.length;i++){
    var t = NX_PROFILE_TYPES[order[i]];
    var on = (NXCR.ptype === t.key);
    h += '<div class="nxcr-type'+(on?' on':'')+'" onclick="nxcrPickType(\''+t.key+'\')">'+
      '<span class="ic">'+t.ic+'</span>'+
      '<span class="tx"><b>'+t.label+'</b><small>'+t.desc+'</small></span>'+
      '<span class="ck">'+(on?'✓':'')+'</span></div>';
  }
  box.innerHTML = h;
}
function nxcrPickType(k){ NXCR.ptype = k; nxcrRenderTypes(); nxcrPreview(); }

function nxcrRenderColors(){
  var box = document.getElementById('nxcrColors');
  if(!box) return;
  var h = '';
  for(var i=0;i<NX_COLORS.length;i++){
    var c = NX_COLORS[i];
    h += '<div class="nxcr-col'+(c===NXCR.color?' on':'')+'" style="background:'+c+'" onclick="nxcrPickColor(\''+c+'\')"></div>';
  }
  box.innerHTML = h;
}
function nxcrPickColor(c){ NXCR.color = c; nxcrRenderColors(); nxcrPreview(); }

function nxcrPreview(){
  var av = document.getElementById('nxcrAv');
  if(!av) return;
  var nm = (document.getElementById('nxcrName').value || '').trim();
  if(NXCR.photo){
    av.style.backgroundImage = 'url(' + NXCR.photo + ')';
    av.style.background = 'url(' + NXCR.photo + ') center/cover';
    av.textContent = '';
  } else {
    av.style.backgroundImage = '';
    av.style.background = NXCR.color;
    av.textContent = nm ? nm.charAt(0).toUpperCase() : (NX_PROFILE_TYPES[NXCR.ptype] || {}).ic || '?';
  }
}
function nxcrPhoto(e){
  var f = e.target.files && e.target.files[0];
  if(!f) return;
  if(f.size > 2*1024*1024){ if(typeof showToast==='function') showToast('Image trop lourde (max 2 Mo)'); return; }
  var r = new FileReader();
  r.onload = function(ev){ NXCR.photo = ev.target.result; nxcrPreview(); };
  r.readAsDataURL(f);
}
function nxcrClearPhoto(){
  NXCR.photo = null;
  var i = document.getElementById('nxcrPhoto'); if(i) i.value = '';
  nxcrPreview();
}

/* ---------- OUVERTURE ---------- */
function nxOpenCreate(){
  nxBuildProfileScreen();
  NXCR = { mode:'add', id:null, color:NX_COLORS[Math.floor(Math.random()*NX_COLORS.length)], ptype:'mixed', photo:null };
  document.getElementById('nxcrT').textContent = 'Nouveau profil';
  document.getElementById('nxcrName').value = '';
  document.getElementById('nxcrDanger').style.display = 'none';
  nxcrRenderTypes(); nxcrRenderColors(); nxcrPreview();
  document.getElementById('nxCreate').classList.add('on');
  setTimeout(function(){ var n=document.getElementById('nxcrName'); if(n) n.focus(); }, 120);
}
function nxOpenEdit(pid){
  nxBuildProfileScreen();
  var p = null;
  if(user && user.profiles){
    for(var i=0;i<user.profiles.length;i++){ if(user.profiles[i].id === pid) p = user.profiles[i]; }
  }
  if(!p) return;
  NXCR = { mode:'edit', id:pid, color:p.color||'#D4AF37', ptype:p.ptype||'mixed', photo:p.avatar||null };
  document.getElementById('nxcrT').textContent = 'Modifier le profil';
  document.getElementById('nxcrName').value = p.name || '';
  document.getElementById('nxcrDanger').style.display =
    (user.profiles.length > 1) ? 'block' : 'none';
  nxcrRenderTypes(); nxcrRenderColors(); nxcrPreview();
  document.getElementById('nxCreate').classList.add('on');
}
function nxCloseCreate(){
  var m = document.getElementById('nxCreate');
  if(m) m.classList.remove('on');
}

/* ---------- ENREGISTREMENT ---------- */
function nxcrSave(){
  var nm = (document.getElementById('nxcrName').value || '').trim();
  if(!nm){ if(typeof showToast==='function') showToast('Entrez un nom de profil'); return; }
  if(!user || !user.email){ if(typeof showToast==='function') showToast('Erreur de compte'); return; }

  var users = JSON.parse(localStorage.getItem('netluxe_users') || '{}');
  var u = users[user.email];
  if(!u){ if(typeof showToast==='function') showToast('Compte introuvable'); return; }
  if(!u.profiles) u.profiles = [];

  if(NXCR.mode === 'add'){
    if(u.profiles.length >= 5){ if(typeof showToast==='function') showToast('Maximum 5 profils'); return; }
    var np = {
      id:'p_' + Date.now(),
      name:nm, color:NXCR.color, avatar:NXCR.photo, ptype:NXCR.ptype,
      createdAt:new Date().toISOString(), lastActive:new Date().toISOString(),
      history:[], myList:[], progress:{}, likes:[],
      prefs: (typeof SETTINGS_DEFAULTS !== 'undefined')
             ? JSON.parse(JSON.stringify(SETTINGS_DEFAULTS))
             : { lang:'FR', audio:'FR', subs:'FR', speed:1 }
    };
    u.profiles.push(np);
    users[user.email] = u; user = u;
    localStorage.setItem('netluxe_users', JSON.stringify(users));
    localStorage.setItem('netluxe_user', JSON.stringify(user));
    nxCloseCreate();
    if(typeof showToast==='function') showToast('Profil « ' + nm + ' » créé');
    nxRenderProfileGrid();
    nxPickProfile(np.id);
  } else {
    for(var i=0;i<u.profiles.length;i++){
      if(u.profiles[i].id === NXCR.id){
        u.profiles[i].name = nm;
        u.profiles[i].color = NXCR.color;
        u.profiles[i].avatar = NXCR.photo;
        u.profiles[i].ptype = NXCR.ptype;
        if(prof && prof.id === NXCR.id){
          prof.name = nm; prof.color = NXCR.color; prof.avatar = NXCR.photo; prof.ptype = NXCR.ptype;
          localStorage.setItem('netluxe_profile', JSON.stringify(prof));
        }
        break;
      }
    }
    users[user.email] = u; user = u;
    localStorage.setItem('netluxe_users', JSON.stringify(users));
    localStorage.setItem('netluxe_user', JSON.stringify(user));
    nxCloseCreate();
    if(typeof showToast==='function') showToast('Profil mis à jour');
    nxRenderProfileGrid();
    /* si le profil actif a changé de type, rafraîchir l'app */
    if(prof && prof.id === NXCR.id){
      if(typeof updateProfileUI === 'function') updateProfileUI();
      var appEl = document.getElementById('app');
      if(appEl && getComputedStyle(appEl).display !== 'none' && typeof goHome === 'function') goHome();
    }
  }
}

function nxcrDelete(){
  if(!user || !user.profiles || user.profiles.length <= 1){
    if(typeof showToast==='function') showToast('Impossible de supprimer le dernier profil');
    return;
  }
  var target = NXCR.id;
  var nm = '';
  for(var i=0;i<user.profiles.length;i++){ if(user.profiles[i].id===target) nm = user.profiles[i].name; }
  if(!confirm('Supprimer le profil « ' + nm + ' » et tout son historique ?')) return;

  var users = JSON.parse(localStorage.getItem('netluxe_users') || '{}');
  var u = users[user.email];
  u.profiles = u.profiles.filter(function(p){ return p.id !== target; });
  users[user.email] = u; user = u;
  localStorage.setItem('netluxe_users', JSON.stringify(users));
  localStorage.setItem('netluxe_user', JSON.stringify(user));

  nxCloseCreate();
  if(typeof showToast==='function') showToast('Profil supprimé');

  /* si on supprime le profil actif, revenir à la sélection */
  if(prof && prof.id === target){
    prof = null;
    localStorage.removeItem('netluxe_profile');
    nxShowProfileSelect();
  } else {
    nxRenderProfileGrid();
  }
}

/* ---------- CHANGER DE PROFIL (depuis l'app) ---------- */
function nxSwitchProfile(){
  nxShowProfileSelect();
}
