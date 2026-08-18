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

/* Migration : donner un type aux profils existants */
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
          }
        }
        if(changed){
          localStorage.setItem('netluxe_users', JSON.stringify(users));
          if(typeof user !== 'undefined' && user && users[user.email]) user = users[user.email];
        }
      }
      /* profil ACTIF : lui donner aussi un type */
      var sp = localStorage.getItem('netluxe_profile');
      if(sp){
        var p = JSON.parse(sp);
        if(p && !p.ptype){
          p.ptype = 'mixed';
          localStorage.setItem('netluxe_profile', JSON.stringify(p));
        }
        if(typeof prof !== 'undefined' && prof && !prof.ptype) prof.ptype = 'mixed';
      }
    } catch(e){}
  }
  if(document.readyState === 'complete') migrate();
  else window.addEventListener('load', migrate);
})();
