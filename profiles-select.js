/* ============================================
   NETLUXE — Écran de sélection de profils
   Identité NETLUXE : nuit tropicale + turquoise/or
   ============================================ */

function nxBuildProfileScreen(){
  if(document.getElementById('nxSelect')) return;
  var d = document.createElement('div');
  d.id = 'nxSelect';
  d.className = 'nxsel';
  d.innerHTML =
    '<div class="nxsel-in">'+
      '<div class="nxsel-logo">'+
        '<div class="logo-ic"><div></div><div></div><div></div><div></div></div>'+
        '<span class="logo-txt"><span class="net">NET</span><span class="luxe">LUXE</span></span>'+
      '</div>'+
      '<h1 class="nxsel-t">Qui regarde NETLUXE&nbsp;?</h1>'+
      '<p class="nxsel-d">Chaque profil garde son historique, sa liste et ses préférences</p>'+
      '<div class="nxsel-grid" id="nxselGrid"></div>'+
      '<div class="nxsel-act">'+
        '<button class="nxsel-manage" onclick="nxToggleManage()" id="nxManageBtn">Gérer les profils</button>'+
        '<div class="nxsel-sub">'+
          '<button class="btn btn-o" style="color:#FF6B35" onclick="logout()">Déconnexion</button>'+
        '</div>'+
      '</div>'+
    '</div>';
  document.body.appendChild(d);

  /* Modale de création / édition avec choix du type */
  var m = document.createElement('div');
  m.id = 'nxCreate';
  m.className = 'nxcr';
  m.innerHTML =
    '<div class="nxcr-box">'+
      '<div class="nxcr-hdr"><h3 id="nxcrT">Nouveau profil</h3>'+
        '<button class="nxcr-x" onclick="nxCloseCreate()">✕</button></div>'+
      '<div class="nxcr-body">'+
        '<div class="nxcr-prev">'+
          '<div class="nxcr-av" id="nxcrAv" onclick="nxcrOpenAvatars()" title="Changer d\'avatar"></div>'+
          '<div class="nxcr-photo-act">'+
            '<button class="btn btn-p" onclick="nxcrOpenAvatars()">🎨 Choisir un avatar</button>'+
          '</div>'+
        '</div>'+
        '<label class="nxcr-lb">Nom du profil</label>'+
        '<input class="nxcr-inp" id="nxcrName" maxlength="20" placeholder="Ex : Sandro" oninput="nxcrPreview()">'+
        '<label class="nxcr-lb">Type de profil</label>'+
        '<div class="nxcr-types" id="nxcrTypes"></div>'+
        '<div id="nxcrDanger" class="nxcr-danger" style="display:none">'+
          '<button class="btn btn-o" style="width:100%;color:#EF4444" onclick="nxcrDelete()">🗑 Supprimer ce profil</button>'+
        '</div>'+
      '</div>'+
      '<div class="nxcr-ftr">'+
        '<button class="btn btn-o" onclick="nxCloseCreate()">Annuler</button>'+
        '<button class="btn btn-p" onclick="nxcrSave()">Enregistrer</button>'+
      '</div>'+
    '</div>';
  document.body.appendChild(m);

  m.addEventListener('click', function(e){ if(e.target === m) nxCloseCreate(); });
}

/* ---------- AFFICHAGE ---------- */
function nxShowProfileSelect(){
  nxBuildProfileScreen();
  nxRenderProfileGrid();
  /* masquer les autres écrans */
  ['authScreen','createProfile','codeAccess','app','splash'].forEach(function(id){
    var e = document.getElementById(id);
    if(e){ e.style.display = 'none'; e.classList.add('hidden'); }
  });
  document.getElementById('nxSelect').classList.add('on');
  document.body.style.overflow = '';
}
function nxHideProfileSelect(){
  var s = document.getElementById('nxSelect');
  if(s) s.classList.remove('on');
}

function nxRenderProfileGrid(){
  var g = document.getElementById('nxselGrid');
  if(!g) return;
  var list = (typeof user !== 'undefined' && user && user.profiles) ? user.profiles : [];
  var h = '';
  for(var i=0;i<list.length;i++){
    var p = list[i];
    var ty = NX_PROFILE_TYPES[p.ptype || 'mixed'] || NX_PROFILE_TYPES.mixed;
    var isKid = (p.ptype === 'kids') || p.isKid;
    var av;
    if(p.avatarId && typeof nxAvRender === 'function'){
      av = '<div class="nxsel-av">' + nxAvRender(p.avatarId, 126) + '</div>';
    } else if(p.avatar){
      av = '<div class="nxsel-av" style="background-image:url('+p.avatar+')"></div>';
    } else {
      av = '<div class="nxsel-av" style="background:'+(p.color||ty.color)+'">'+
           (p.name||'?').charAt(0).toUpperCase()+'</div>';
    }
    h += '<div class="nxsel-card" onclick="nxPickProfile(\''+p.id+'\')" role="button" tabindex="0" '+
      'onkeydown="if(event.key===\'Enter\')nxPickProfile(\''+p.id+'\')">'+
      av+
      (isKid ? '<span class="nxsel-kid">Enfant</span>' : '')+
      '<div class="nxsel-nm">'+nxEsc(p.name)+'</div>'+
      '<div class="nxsel-ty"><span>'+ty.ic+'</span>'+ty.label+'</div>'+
      '<button class="nxsel-edit" onclick="event.stopPropagation();nxOpenEdit(\''+p.id+'\')" '+
      'title="Modifier" aria-label="Modifier '+nxEsc(p.name)+'">✎</button>'+
    '</div>';
  }
  if(list.length < ((typeof nxMaxProfiles === 'function') ? nxMaxProfiles() : 5)){
    h += '<div class="nxsel-card add" onclick="nxOpenCreate()" role="button" tabindex="0">'+
         '<div class="nxsel-av plus">+</div><div class="nxsel-nm">Ajouter</div>'+
         '<div class="nxsel-ty">Nouveau profil</div></div>';
  }
  g.innerHTML = h;
}

function nxEsc(s){
  return String(s==null?'':s).replace(/[&<>"']/g, function(m){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];
  });
}

/* ---------- MODE GESTION ---------- */
var NX_MANAGE = false;
function nxToggleManage(){
  NX_MANAGE = !NX_MANAGE;
  var s = document.getElementById('nxSelect');
  if(s) s.classList.toggle('manage', NX_MANAGE);
  var b = document.getElementById('nxManageBtn');
  if(b){
    b.textContent = NX_MANAGE ? 'Terminé' : 'Gérer les profils';
    b.classList.toggle('on', NX_MANAGE);
  }
  var t = document.querySelector('.nxsel-t');
  if(t) t.innerHTML = NX_MANAGE ? 'Gérer les profils' : 'Qui regarde NETLUXE&nbsp;?';
  var d = document.querySelector('.nxsel-d');
  if(d) d.textContent = NX_MANAGE
    ? 'Touchez un profil pour le modifier ou le supprimer'
    : 'Chaque profil garde son historique, sa liste et ses préférences';
}

/* ---------- SÉLECTION ---------- */
function nxPickProfile(pid){
  if(!user || !user.profiles) return;
  /* en mode gestion : le clic ouvre l'édition */
  if(NX_MANAGE){ nxOpenEdit(pid); return; }
  var found = null;
  for(var i=0;i<user.profiles.length;i++){
    if(user.profiles[i].id === pid) found = user.profiles[i];
  }
  if(!found) return;

  prof = found;
  prof.lastActive = new Date().toISOString();
  if(!prof.ptype) prof.ptype = 'mixed';
  localStorage.setItem('netluxe_profile', JSON.stringify(prof));
  if(typeof saveProfile === 'function') saveProfile();

  nxHideProfileSelect();
  if(typeof applySettings === 'function') { try { applySettings(); } catch(e){} }
  if(typeof showApp === 'function') showApp();
  else {
    var a = document.getElementById('app');
    if(a){ a.style.display = 'block'; a.classList.remove('hidden'); }
  }
  if(typeof updateProfileUI === 'function') updateProfileUI();
  if(typeof goHome === 'function') goHome();

  var ty = NX_PROFILE_TYPES[prof.ptype] || NX_PROFILE_TYPES.mixed;
  if(typeof showToast === 'function') showToast(ty.ic + '  Profil ' + prof.name + ' — ' + ty.label);
}
