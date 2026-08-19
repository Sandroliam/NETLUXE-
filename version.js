/* ============================================
   NETLUXE — Contrôle de version et rechargement
   Affiche la version en cours et permet de forcer
   le rechargement sans passer par les réglages
   du navigateur.
   ============================================ */

var NX_VERSION = 'v28';
var NX_VERSION_KEY = 'netluxe_version';

/* Purge tout ce qui peut retenir une ancienne version,
   SANS toucher aux données utilisateur (comptes, profils,
   abonnement, progression). */
function nxHardReload(){
  try {
    /* 1. caches du navigateur (Cache API) */
    if(typeof caches !== 'undefined' && caches.keys){
      caches.keys().then(function(names){
        names.forEach(function(n){ caches.delete(n); });
      });
    }
    /* 2. service workers éventuels */
    if(navigator.serviceWorker && navigator.serviceWorker.getRegistrations){
      navigator.serviceWorker.getRegistrations().then(function(rs){
        rs.forEach(function(r){ r.unregister(); });
      });
    }
  } catch(e){}

  /* 3. recharger avec un paramètre unique : le serveur ne peut pas
        renvoyer une version en cache pour une URL jamais vue */
  var base = location.href.split('?')[0].split('#')[0];
  setTimeout(function(){
    location.replace(base + '?nx=' + Date.now());
  }, 260);
}

/* Détection d'une mise à jour : si la version stockée diffère,
   on purge les caches une seule fois automatiquement. */
(function(){
  function check(){
    try {
      var prev = localStorage.getItem(NX_VERSION_KEY);
      if(prev === NX_VERSION) return;          /* déjà à jour */

      localStorage.setItem(NX_VERSION_KEY, NX_VERSION);

      /* première visite : rien à purger */
      if(!prev) return;

      /* mise à jour détectée : purger les caches en silence */
      if(typeof caches !== 'undefined' && caches.keys){
        caches.keys().then(function(names){
          names.forEach(function(n){ caches.delete(n); });
        });
      }
      if(typeof showToast === 'function'){
        setTimeout(function(){
          showToast('NETLUXE mis à jour — ' + NX_VERSION);
        }, 900);
      }
    } catch(e){}
  }
  if(document.readyState === 'complete') setTimeout(check, 400);
  else window.addEventListener('load', function(){ setTimeout(check, 400); });
})();

/* Bloc affiché dans les Paramètres */
function nxVersionBlock(){
  var h = '<div class="settings-sec"><h3>🔄 Version et cache</h3>';
  h += '<div class="setting-row"><span class="setting-lbl">Version installée</span>'+
       '<span class="setting-val" style="color:#E6B800;font-weight:600">' + NX_VERSION + '</span></div>';
  h += '<div class="setting-row"><span class="setting-lbl">Dernier chargement</span>'+
       '<span class="setting-val">' + new Date().toLocaleTimeString('fr-FR') + '</span></div>';
  h += '<div class="nxvr-note">Si une nouveauté ne s\'affiche pas, forcez le rechargement. '+
       'Vos profils, votre abonnement et votre progression sont conservés.</div>';
  h += '<div class="setting-row"><span class="setting-lbl">Recharger l\'application</span>'+
       '<button class="btn btn-p" style="padding:7px 14px;font-size:12.5px" '+
       'onclick="nxAskReload()">Forcer le rechargement</button></div>';
  h += '</div>';
  return h;
}

function nxAskReload(){
  if(typeof showToast === 'function') showToast('Rechargement en cours…');
  nxHardReload();
}
