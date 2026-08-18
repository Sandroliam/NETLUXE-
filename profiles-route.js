/* ============================================
   NETLUXE — Routage : connexion → sélection profil → app
   Redirige le flux existant vers le nouvel écran de profils.
   ============================================ */

/* Après saisie de l'email : si des profils existent, on va à la sélection.
   Sinon, on ouvre la création de profil typé. */
function nxAfterLogin(){
  nxBuildProfileScreen();
  var list = (typeof user !== 'undefined' && user && user.profiles) ? user.profiles : [];
  if(list.length > 0){
    nxShowProfileSelect();
  } else {
    /* masquer les écrans d'auth puis ouvrir la création */
    ['authScreen','createProfile','codeAccess','splash'].forEach(function(id){
      var e = document.getElementById(id);
      if(e){ e.style.display = 'none'; e.classList.add('hidden'); }
    });
    nxShowProfileSelect();
    nxOpenCreate();
  }
}

/* Remplace showCreateProfile de index.html : on route vers le nouvel écran */
function showCreateProfile(){
  nxAfterLogin();
}

/* Changer de profil depuis les Paramètres / la page Profil */
function openProfileSwitch(){ nxShowProfileSelect(); }
function openAddProfile(){ nxShowProfileSelect(); nxOpenCreate(); }
function openEditProfile(){
  if(typeof prof !== 'undefined' && prof){ nxShowProfileSelect(); nxOpenEdit(prof.id); }
  else nxShowProfileSelect();
}
function switchProfile(pid){ nxPickProfile(pid); }

/* Restauration de session au chargement */
(function(){
  function boot(){
    try {
      nxBuildProfileScreen();
      var su = localStorage.getItem('netluxe_user');
      var sp = localStorage.getItem('netluxe_profile');
      if(!su) return;                      /* pas connecté : écran d'auth normal */
      if(sp){
        /* profil déjà choisi : s'assurer que ptype existe */
        try {
          var p = JSON.parse(sp);
          if(p && !p.ptype){
            p.ptype = 'mixed';
            localStorage.setItem('netluxe_profile', JSON.stringify(p));
            if(typeof prof !== 'undefined' && prof) prof.ptype = 'mixed';
          }
        } catch(e){}
        return;                            /* index.html a déjà ouvert l'app */
      }
      /* connecté mais aucun profil actif → sélection */
      var u = JSON.parse(su);
      if(u && u.profiles && u.profiles.length){
        nxShowProfileSelect();
      }
    } catch(e){}
  }
  if(document.readyState === 'complete') setTimeout(boot, 120);
  else window.addEventListener('load', function(){ setTimeout(boot, 120); });
})();

/* Migration : type + avatar pour les profils existants */
(function(){
  function migrate(){
    try {
      var raw = localStorage.getItem('netluxe_users');
      if(raw){
        var users = JSON.parse(raw), changed = false;
        for(var em in users){
          if(!users.hasOwnProperty(em)) continue;
          var ps = users[em].profiles || [];
          for(var i=0;i<ps.length;i++){
            if(!ps[i].ptype){ ps[i].ptype = 'mixed'; changed = true; }
            if(!ps[i].avatarId){
              ps[i].avatarId = (typeof nxAvDefault === 'function')
                ? nxAvDefault(ps[i].ptype) : 'pre1';
              changed = true;
            }
            if(ps[i].isKid === undefined){ ps[i].isKid = (ps[i].ptype === 'kids'); changed = true; }
          }
        }
        if(changed){
          localStorage.setItem('netluxe_users', JSON.stringify(users));
          if(typeof user !== 'undefined' && user && users[user.email]) user = users[user.email];
        }
      }
      /* profil ACTIF */
      var sp = localStorage.getItem('netluxe_profile');
      if(sp){
        var p = JSON.parse(sp), ch2 = false;
        if(p && !p.ptype){ p.ptype = 'mixed'; ch2 = true; }
        if(p && !p.avatarId){
          p.avatarId = (typeof nxAvDefault === 'function') ? nxAvDefault(p.ptype) : 'pre1';
          ch2 = true;
        }
        if(p && p.isKid === undefined){ p.isKid = (p.ptype === 'kids'); ch2 = true; }
        if(ch2) localStorage.setItem('netluxe_profile', JSON.stringify(p));
        if(typeof prof !== 'undefined' && prof){
          if(!prof.ptype) prof.ptype = 'mixed';
          if(!prof.avatarId) prof.avatarId = (typeof nxAvDefault === 'function') ? nxAvDefault(prof.ptype) : 'pre1';
          if(prof.isKid === undefined) prof.isKid = (prof.ptype === 'kids');
        }
        if(typeof updateProfileUI === 'function') { try { updateProfileUI(); } catch(e){} }
      }
    } catch(e){}
  }
  if(document.readyState === 'complete') setTimeout(migrate, 60);
  else window.addEventListener('load', function(){ setTimeout(migrate, 60); });
})();
