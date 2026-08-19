/* ============================================
   NETLUXE — Panneau « Gérer les profils »
   Trois options réellement fonctionnelles :
   réordonner, verrouiller par code, supprimer.
   ============================================ */

function nxMgEsc(s){
  return String(s == null ? '' : s).replace(/[&<>"']/g, function(m){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];
  });
}

var NXMG = { view:'menu', dragId:null };

function nxBuildManage(){
  if(document.getElementById('nxMg')) return;
  var d = document.createElement('div');
  d.id = 'nxMg';
  d.className = 'nxmg';
  d.innerHTML = '<div class="nxmg-box" id="nxmgBox"></div>';
  document.body.appendChild(d);
  d.addEventListener('click', function(e){ if(e.target === d) nxCloseManage(); });
}

function nxOpenManage(){
  nxBuildManage();
  NXMG.view = 'menu';
  nxMgRender();
  document.getElementById('nxMg').classList.add('on');
}

function nxCloseManage(){
  var e = document.getElementById('nxMg');
  if(e) e.classList.remove('on');
  if(typeof nxRenderProfileGrid === 'function') nxRenderProfileGrid();
}

function nxMgRender(){
  var box = document.getElementById('nxmgBox');
  if(!box) return;
  if(NXMG.view === 'order')  { box.innerHTML = nxMgOrderView(); return; }
  if(NXMG.view === 'lock')   { box.innerHTML = nxMgLockView(); return; }
  if(NXMG.view === 'delete') { box.innerHTML = nxMgDeleteView(); return; }
  box.innerHTML = nxMgMenuView();
}

function nxMgGo(v){ NXMG.view = v; nxMgRender(); }

/* ---------- MENU PRINCIPAL ---------- */
function nxMgMenuView(){
  return ''+
    '<div class="nxmg-hdr">'+
      '<h3>Gérer les profils</h3>'+
      '<button class="nxmg-x" onclick="nxCloseManage()" aria-label="Fermer">✕</button>'+
    '</div>'+
    '<div class="nxmg-opts">'+
      '<button class="nxmg-opt" onclick="nxMgGo(\'order\')">'+
        '<span class="ic">✎</span>'+
        '<span class="tx"><b>Modifier l\'ordre</b><small>Réorganiser les profils</small></span>'+
        '<span class="ar">›</span></button>'+
      '<button class="nxmg-opt" onclick="nxMgGo(\'lock\')">'+
        '<span class="ic">🔒</span>'+
        '<span class="tx"><b>Verrouillage des profils</b><small>Protéger vos profils par un code</small></span>'+
        '<span class="ar">›</span></button>'+
      '<button class="nxmg-opt danger" onclick="nxMgGo(\'delete\')">'+
        '<span class="ic">🗑</span>'+
        '<span class="tx"><b>Supprimer un profil</b><small>Supprimer définitivement</small></span>'+
        '<span class="ar">›</span></button>'+
    '</div>'+
    '<div class="nxmg-foot">Les profils sont personnels et leurs recommandations ne sont pas partagées.</div>';
}

/* ---------- 1. MODIFIER L'ORDRE ---------- */
function nxMgOrderView(){
  var list = (user && user.profiles) ? user.profiles : [];
  var h = '<div class="nxmg-hdr">'+
    '<button class="nxmg-bk" onclick="nxMgGo(\'menu\')">‹</button>'+
    '<h3>Modifier l\'ordre</h3>'+
    '<button class="nxmg-x" onclick="nxCloseManage()">✕</button></div>'+
    '<p class="nxmg-help">Utilisez les flèches pour réorganiser l\'affichage des profils.</p>'+
    '<div class="nxmg-list">';

  for(var i=0;i<list.length;i++){
    var p = list[i];
    var av = (p.avatarId && typeof nxAvRender === 'function')
      ? nxAvRender(p.avatarId, 44)
      : '<div class="ph" style="background:'+(p.color||'#D4AF37')+'">'+
        (p.name||'?').charAt(0).toUpperCase()+'</div>';
    h += '<div class="nxmg-row">'+
      '<div class="av">'+av+'</div>'+
      '<div class="nm">'+nxMgEsc(p.name)+
        '<small>'+(typeof nxAgeLabel === 'function' ? nxAgeLabel(p) : '')+'</small></div>'+
      '<div class="mv">'+
        '<button onclick="nxMgMove('+i+',-1)"'+(i===0?' disabled':'')+' aria-label="Monter">↑</button>'+
        '<button onclick="nxMgMove('+i+',1)"'+(i===list.length-1?' disabled':'')+' aria-label="Descendre">↓</button>'+
      '</div>'+
    '</div>';
  }
  h += '</div>';
  if(list.length < 2){
    h += '<div class="nxmg-empty">Ajoutez un second profil pour pouvoir les réorganiser.</div>';
  }
  return h;
}

function nxMgMove(idx, dir){
  if(!user || !user.profiles) return;
  var list = user.profiles;
  var to = idx + dir;
  if(to < 0 || to >= list.length) return;
  var tmp = list[idx];
  list[idx] = list[to];
  list[to] = tmp;

  /* persister */
  var users = JSON.parse(localStorage.getItem('netluxe_users') || '{}');
  if(users[user.email]){
    users[user.email].profiles = list;
    localStorage.setItem('netluxe_users', JSON.stringify(users));
    localStorage.setItem('netluxe_user', JSON.stringify(user));
  }
  nxMgRender();
  if(typeof nxRenderProfileGrid === 'function') nxRenderProfileGrid();
}

/* ---------- 2. VERROUILLAGE PAR CODE ---------- */
function nxMgLockView(){
  var list = (user && user.profiles) ? user.profiles : [];
  var h = '<div class="nxmg-hdr">'+
    '<button class="nxmg-bk" onclick="nxMgGo(\'menu\')">‹</button>'+
    '<h3>Verrouillage des profils</h3>'+
    '<button class="nxmg-x" onclick="nxCloseManage()">✕</button></div>'+
    '<p class="nxmg-help">Un code à 4 chiffres sera demandé avant d\'accéder au profil.</p>'+
    '<div class="nxmg-list">';

  for(var i=0;i<list.length;i++){
    var p = list[i];
    var locked = !!p.pinHash;
    h += '<div class="nxmg-row">'+
      '<div class="av">'+((p.avatarId && typeof nxAvRender === 'function')
          ? nxAvRender(p.avatarId, 44)
          : '<div class="ph" style="background:'+(p.color||'#D4AF37')+'">'+
            (p.name||'?').charAt(0).toUpperCase()+'</div>')+'</div>'+
      '<div class="nm">'+nxMgEsc(p.name)+
        '<small>'+(locked ? '🔒 Protégé par un code' : 'Aucun code')+'</small></div>'+
      '<div class="ac">'+
        (locked
          ? '<button class="lk on" onclick="nxMgUnlock(\''+p.id+'\')">Retirer</button>'
          : '<button class="lk" onclick="nxMgSetPin(\''+p.id+'\')">Définir</button>')+
      '</div>'+
    '</div>';
  }
  h += '</div>'+
    '<div class="nxmg-foot">Le code est stocké sous forme empreinte, jamais en clair. '+
    'Il protège l\'accès à l\'interface, ce n\'est pas un chiffrement des données.</div>';
  return h;
}

/* Empreinte simple (non cryptographique) — voir note ci-dessus */
function nxPinHash(pin){
  var s = 'nx:' + String(pin);
  var h = 5381;
  for(var i=0;i<s.length;i++){ h = ((h << 5) + h) + s.charCodeAt(i); h = h & h; }
  return 'p' + Math.abs(h).toString(36);
}

function nxMgSetPin(pid){
  var pin = prompt('Code à 4 chiffres pour ce profil :');
  if(pin === null) return;
  pin = String(pin).trim();
  if(!/^\d{4}$/.test(pin)){
    if(typeof showToast === 'function') showToast('Le code doit contenir exactement 4 chiffres');
    return;
  }
  var confirmPin = prompt('Confirmez le code :');
  if(confirmPin === null) return;
  if(String(confirmPin).trim() !== pin){
    if(typeof showToast === 'function') showToast('Les codes ne correspondent pas');
    return;
  }
  nxMgWritePin(pid, nxPinHash(pin));
  if(typeof showToast === 'function') showToast('🔒 Code défini');
  nxMgRender();
}

function nxMgUnlock(pid){
  var pin = prompt('Entrez le code actuel pour retirer la protection :');
  if(pin === null) return;
  var p = nxMgFind(pid);
  if(!p) return;
  if(p.pinHash !== nxPinHash(String(pin).trim())){
    if(typeof showToast === 'function') showToast('Code incorrect');
    return;
  }
  nxMgWritePin(pid, null);
  if(typeof showToast === 'function') showToast('Protection retirée');
  nxMgRender();
}

function nxMgFind(pid){
  if(!user || !user.profiles) return null;
  for(var i=0;i<user.profiles.length;i++){
    if(user.profiles[i].id === pid) return user.profiles[i];
  }
  return null;
}

function nxMgWritePin(pid, hash){
  var users = JSON.parse(localStorage.getItem('netluxe_users') || '{}');
  var u = users[user.email];
  if(!u) return false;
  for(var i=0;i<u.profiles.length;i++){
    if(u.profiles[i].id === pid){
      if(hash) u.profiles[i].pinHash = hash;
      else delete u.profiles[i].pinHash;
    }
  }
  users[user.email] = u;
  user = u;
  localStorage.setItem('netluxe_users', JSON.stringify(users));
  localStorage.setItem('netluxe_user', JSON.stringify(user));
  /* refléter sur le profil actif */
  if(typeof prof !== 'undefined' && prof && prof.id === pid){
    if(hash) prof.pinHash = hash; else delete prof.pinHash;
    localStorage.setItem('netluxe_profile', JSON.stringify(prof));
  }
  return true;
}

/* ---------- 3. SUPPRIMER UN PROFIL ---------- */
function nxMgDeleteView(){
  var list = (user && user.profiles) ? user.profiles : [];
  var h = '<div class="nxmg-hdr">'+
    '<button class="nxmg-bk" onclick="nxMgGo(\'menu\')">‹</button>'+
    '<h3>Supprimer un profil</h3>'+
    '<button class="nxmg-x" onclick="nxCloseManage()">✕</button></div>'+
    '<p class="nxmg-help warn">La suppression est définitive : historique, liste et '+
    'progression du profil seront perdus.</p>'+
    '<div class="nxmg-list">';

  for(var i=0;i<list.length;i++){
    var p = list[i];
    var last = list.length <= 1;
    h += '<div class="nxmg-row">'+
      '<div class="av">'+((p.avatarId && typeof nxAvRender === 'function')
          ? nxAvRender(p.avatarId, 44)
          : '<div class="ph" style="background:'+(p.color||'#D4AF37')+'">'+
            (p.name||'?').charAt(0).toUpperCase()+'</div>')+'</div>'+
      '<div class="nm">'+nxMgEsc(p.name)+
        '<small>'+((p.history||[]).length)+' vu(s) · '+((p.myList||[]).length)+' en liste</small></div>'+
      '<div class="ac">'+
        '<button class="dl"'+(last?' disabled title="Le dernier profil ne peut pas être supprimé"':'')+
        ' onclick="nxMgDelete(\''+p.id+'\')">Supprimer</button>'+
      '</div>'+
    '</div>';
  }
  h += '</div>';
  if(list.length <= 1){
    h += '<div class="nxmg-empty">Votre compte doit conserver au moins un profil.</div>';
  }
  return h;
}

function nxMgDelete(pid){
  if(!user || !user.profiles || user.profiles.length <= 1){
    if(typeof showToast === 'function') showToast('Le dernier profil ne peut pas être supprimé');
    return;
  }
  var p = nxMgFind(pid);
  if(!p) return;
  if(!confirm('Supprimer définitivement le profil « ' + p.name + ' » ?\n\n' +
              'Son historique, sa liste et sa progression seront perdus.')) return;

  var users = JSON.parse(localStorage.getItem('netluxe_users') || '{}');
  var u = users[user.email];
  u.profiles = u.profiles.filter(function(x){ return x.id !== pid; });
  users[user.email] = u;
  user = u;
  localStorage.setItem('netluxe_users', JSON.stringify(users));
  localStorage.setItem('netluxe_user', JSON.stringify(user));

  if(typeof showToast === 'function') showToast('Profil supprimé');

  /* si on supprime le profil actif, revenir à la sélection */
  if(typeof prof !== 'undefined' && prof && prof.id === pid){
    prof = null;
    localStorage.removeItem('netluxe_profile');
    nxCloseManage();
    if(typeof nxShowProfileSelect === 'function') nxShowProfileSelect();
    return;
  }
  nxMgRender();
  if(typeof nxRenderProfileGrid === 'function') nxRenderProfileGrid();
}

/* ---------- VÉRIFICATION DU CODE À LA SÉLECTION ---------- */
function nxCheckPin(p){
  if(!p || !p.pinHash) return true;   /* pas de code : accès direct */
  var pin = prompt('Profil « ' + p.name + ' » protégé.\nEntrez le code à 4 chiffres :');
  if(pin === null) return false;
  if(p.pinHash !== nxPinHash(String(pin).trim())){
    if(typeof showToast === 'function') showToast('Code incorrect');
    return false;
  }
  return true;
}
