/* NETLUXE — Gestion des profils (ajouter, modifier, changer, supprimer) */

var PROFILE_COLORS = ['#E50914','#D4AF37','#00CED1','#8B5CF6','#22C55E','#F59E0B','#EC4899','#3B82F6','#14B8A6','#F97316','#A855F7','#EF4444','#10B981','#6366F1','#84CC16'];
var PM_MODE = 'add';   /* add | edit */
var PM_COLOR = '#E50914';
var PM_PHOTO = null;

function ensureProfileModal(){
  if(document.getElementById('pmOverlay')) return;
  var d = document.createElement('div');
  d.innerHTML =
  '<div class="modal-ov" id="pmOverlay" style="display:none">'+
    '<div class="modal-box" style="max-width:420px">'+
      '<div class="modal-hdr"><h3 id="pmTitle">Ajouter un profil</h3><button class="modal-x" onclick="closeProfileModal()">×</button></div>'+
      '<div class="modal-body">'+
        '<div style="text-align:center;margin-bottom:20px">'+
          '<div id="pmPreview" class="profile-avatar" style="margin:0 auto;width:80px;height:80px;font-size:32px;display:flex;align-items:center;justify-content:center;border-radius:14px;cursor:pointer" onclick="document.getElementById(\'pmPhoto\').click()">?</div>'+
          '<input type="file" id="pmPhoto" accept="image/*" style="display:none" onchange="pmHandlePhoto(event)">'+
          '<div style="margin-top:9px"><button class="btn btn-o" style="padding:6px 12px;font-size:12px" onclick="document.getElementById(\'pmPhoto\').click()">📷 Photo</button>'+
          '<button class="btn btn-o" style="padding:6px 12px;font-size:12px;margin-left:6px" onclick="pmClearPhoto()">Retirer</button></div>'+
        '</div>'+
        '<div style="margin-bottom:16px"><label style="display:block;font-size:12.5px;color:var(--t2);margin-bottom:6px">Nom du profil</label>'+
          '<input id="pmName" class="inp" placeholder="Ex: Sandro" oninput="pmUpdatePreview()" maxlength="20"></div>'+
        '<div><label style="display:block;font-size:12.5px;color:var(--t2);margin-bottom:8px">Couleur</label>'+
          '<div id="pmColors" style="display:flex;flex-wrap:wrap;gap:8px"></div></div>'+
        '<div id="pmDangerZone" style="display:none;margin-top:20px;padding-top:16px;border-top:1px solid rgba(255,255,255,.08)">'+
          '<button class="btn btn-o" style="width:100%;color:var(--red)" onclick="pmDelete()">🗑 Supprimer ce profil</button></div>'+
      '</div>'+
      '<div class="modal-ftr"><button class="btn btn-o" onclick="closeProfileModal()">Annuler</button>'+
        '<button class="btn btn-p" onclick="pmSave()" id="pmSaveBtn">Enregistrer</button></div>'+
    '</div>'+
  '</div>'+
  '<div class="modal-ov" id="psOverlay" style="display:none">'+
    '<div class="modal-box" style="max-width:400px">'+
      '<div class="modal-hdr"><h3>Changer de profil</h3><button class="modal-x" onclick="closeProfileSwitch()">×</button></div>'+
      '<div class="modal-body" id="psBody"></div>'+
      '<div class="modal-ftr"><button class="btn btn-o" onclick="closeProfileSwitch()">Fermer</button>'+
        '<button class="btn btn-p" onclick="closeProfileSwitch();openAddProfile()">+ Nouveau profil</button></div>'+
    '</div>'+
  '</div>';
  document.body.appendChild(d);
  var ovs = document.querySelectorAll('#pmOverlay,#psOverlay');
  for(var i=0;i<ovs.length;i++){
    ovs[i].addEventListener('click', function(e){ if(e.target===this) this.style.display='none'; });
  }
}

function pmRenderColors(){
  var h='';
  for(var i=0;i<PROFILE_COLORS.length;i++){
    var c = PROFILE_COLORS[i];
    h += '<div onclick="pmPickColor(\''+c+'\')" style="width:30px;height:30px;border-radius:50%;background:'+c+';cursor:pointer;border:'+(c===PM_COLOR?'3px solid #fff':'3px solid transparent')+';box-sizing:border-box"></div>';
  }
  document.getElementById('pmColors').innerHTML = h;
}
function pmPickColor(c){ PM_COLOR=c; pmRenderColors(); pmUpdatePreview(); }
function pmUpdatePreview(){
  var el = document.getElementById('pmPreview');
  var nm = (document.getElementById('pmName').value||'').trim();
  if(PM_PHOTO){
    el.style.background = 'url('+PM_PHOTO+') center/cover';
    el.textContent = '';
  } else {
    el.style.background = PM_COLOR;
    el.textContent = nm ? nm.charAt(0).toUpperCase() : '?';
  }
}
function pmHandlePhoto(e){
  var f = e.target.files[0]; if(!f) return;
  if(f.size > 2*1024*1024) return showToast('Image trop lourde (max 2 Mo)');
  var r = new FileReader();
  r.onload = function(ev){ PM_PHOTO = ev.target.result; pmUpdatePreview(); };
  r.readAsDataURL(f);
}
function pmClearPhoto(){ PM_PHOTO=null; document.getElementById('pmPhoto').value=''; pmUpdatePreview(); }

function openAddProfile(){
  ensureProfileModal();
  PM_MODE='add'; PM_COLOR=PROFILE_COLORS[Math.floor(Math.random()*PROFILE_COLORS.length)]; PM_PHOTO=null;
  document.getElementById('pmTitle').textContent = 'Ajouter un profil';
  document.getElementById('pmName').value = '';
  document.getElementById('pmDangerZone').style.display = 'none';
  pmRenderColors(); pmUpdatePreview();
  document.getElementById('pmOverlay').style.display='flex';
  setTimeout(function(){ document.getElementById('pmName').focus(); },120);
}
function openEditProfile(){
  if(!prof) return;
  ensureProfileModal();
  PM_MODE='edit'; PM_COLOR=prof.color||'#E50914'; PM_PHOTO=prof.avatar||null;
  document.getElementById('pmTitle').textContent = 'Modifier le profil';
  document.getElementById('pmName').value = prof.name||'';
  var multi = user && user.profiles && user.profiles.length>1;
  document.getElementById('pmDangerZone').style.display = multi ? 'block' : 'none';
  pmRenderColors(); pmUpdatePreview();
  document.getElementById('pmOverlay').style.display='flex';
}
function closeProfileModal(){ var e=document.getElementById('pmOverlay'); if(e) e.style.display='none'; }

function pmSave(){
  var nm = (document.getElementById('pmName').value||'').trim();
  if(!nm) return showToast('Entrez un nom de profil');
  var users = JSON.parse(localStorage.getItem('netluxe_users')||'{}');
  var u = users[user.email]; if(!u) return showToast('Erreur de compte');
  if(!u.profiles) u.profiles = [];

  if(PM_MODE==='add'){
    if(u.profiles.length >= 5) return showToast('Maximum 5 profils par compte');
    var np = {
      id:'p_'+Date.now(), name:nm, color:PM_COLOR, avatar:PM_PHOTO,
      createdAt:new Date().toISOString(), lastActive:new Date().toISOString(),
      history:[], myList:[], progress:{}, likes:[],
      prefs:JSON.parse(JSON.stringify(SETTINGS_DEFAULTS))
    };
    u.profiles.push(np);
    users[user.email]=u; user=u;
    localStorage.setItem('netluxe_users',JSON.stringify(users));
    localStorage.setItem('netluxe_user',JSON.stringify(user));
    closeProfileModal(); showToast('Profil « '+nm+' » créé');
    switchProfile(np.id);
  } else {
    prof.name=nm; prof.color=PM_COLOR; prof.avatar=PM_PHOTO;
    saveProfile();
    closeProfileModal(); showToast('Profil mis à jour');
    updateProfileUI(); renderSettings();
  }
}

function pmDelete(){
  if(!prof || !user) return;
  if(!user.profiles || user.profiles.length<=1) return showToast('Impossible de supprimer le dernier profil');
  if(!confirm('Supprimer le profil « '+prof.name+' » et tout son historique ?')) return;
  var users = JSON.parse(localStorage.getItem('netluxe_users')||'{}');
  var u = users[user.email];
  u.profiles = u.profiles.filter(function(p){ return p.id!==prof.id; });
  users[user.email]=u; user=u;
  localStorage.setItem('netluxe_users',JSON.stringify(users));
  localStorage.setItem('netluxe_user',JSON.stringify(user));
  closeProfileModal(); showToast('Profil supprimé');
  switchProfile(u.profiles[0].id);
}

function openProfileSwitch(){
  ensureProfileModal();
  var list = (user && user.profiles) ? user.profiles : [];
  var h = '<div style="display:flex;flex-direction:column;gap:9px">';
  for(var i=0;i<list.length;i++){
    var p = list[i], cur = prof && p.id===prof.id;
    var av = p.avatar
      ? '<div style="width:44px;height:44px;border-radius:10px;background:url('+p.avatar+') center/cover;flex-shrink:0"></div>'
      : '<div style="width:44px;height:44px;border-radius:10px;background:'+(p.color||'#E50914')+';display:flex;align-items:center;justify-content:center;font-weight:700;font-size:18px;flex-shrink:0">'+(p.name||'?').charAt(0).toUpperCase()+'</div>';
    h += '<div onclick="switchProfile(\''+p.id+'\')" style="display:flex;align-items:center;gap:12px;padding:10px;border-radius:10px;cursor:pointer;background:'+(cur?'rgba(229,9,20,.12)':'var(--s2)')+';border:1px solid '+(cur?'var(--red)':'transparent')+'">'+
      av+'<div style="flex:1"><div style="font-weight:600;font-size:14px">'+p.name+'</div>'+
      '<div style="font-size:11.5px;color:var(--t3)">'+((p.history||[]).length)+' contenus vus</div></div>'+
      (cur?'<span style="color:var(--red);font-size:12px;font-weight:600">Actif</span>':'')+'</div>';
  }
  h += '</div>';
  document.getElementById('psBody').innerHTML = h;
  document.getElementById('psOverlay').style.display='flex';
}
function closeProfileSwitch(){ var e=document.getElementById('psOverlay'); if(e) e.style.display='none'; }

function switchProfile(pid){
  if(!user || !user.profiles) return;
  var found = null;
  for(var i=0;i<user.profiles.length;i++){ if(user.profiles[i].id===pid) found=user.profiles[i]; }
  if(!found) return;
  prof = found;
  prof.lastActive = new Date().toISOString();
  localStorage.setItem('netluxe_profile', JSON.stringify(prof));
  saveProfile();
  closeProfileSwitch(); closeProfileModal();
  applySettings(); updateProfileUI();
  showToast('Profil : '+prof.name);
  goHome();
}

function updateProfileUI(){
  var av = document.getElementById('hdrProf') || document.getElementById('navAvatar');
  if(av && prof){
    if(prof.avatar){ av.style.background='url('+prof.avatar+') center/cover'; av.textContent=''; }
    else { av.style.background=prof.color||'#E50914'; av.textContent=(prof.name||'?').charAt(0).toUpperCase(); }
  }
  if(typeof renderProfile==='function' && document.getElementById('profilePage') &&
     document.getElementById('profilePage').style.display!=='none') renderProfile();
}
