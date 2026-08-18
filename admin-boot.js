/* NETLUXE ADMIN — Boot & Login */

function doLogin(e){
  e.preventDefault();
  var r = authLogin($('loginCode').value);
  if(!r.ok){
    var el = $('loginErr');
    el.textContent = r.msg;
    el.style.display = 'block';
    $('loginCode').value = '';
    return;
  }
  startApp();
}

function startApp(){
  $('loginScreen').style.display = 'none';
  $('app').style.display = 'block';

  /* Identité dans la sidebar */
  $('sbName').textContent = SESSION.user;
  $('sbRole').textContent = ROLES[SESSION.role].label;
  $('sbAv').textContent = (SESSION.user||'?').charAt(0).toUpperCase();

  /* Masquer la nav selon les permissions */
  applyPerms();

  /* Initialiser les données puis afficher le dashboard */
  DB.catalog(); DB.licenses();
  nav('dash','Dashboard');
}

function applyPerms(){
  var map = {
    users: 'users.read',
    lics:  'license.read',
    stats: 'stats.read'
  };
  for(var page in map){
    if(!map.hasOwnProperty(page)) continue;
    var el = document.querySelector('[data-nav="'+page+'"]');
    if(el && !can(map[page])) el.style.display = 'none';
  }
  /* Éditeur : pas d'accès au journal */
  if(SESSION.role === 'editor' || SESSION.role === 'support'){
    var a = document.querySelector('[data-nav="audit"]');
    if(a) a.style.display = 'none';
  }
}

/* Restauration de session au chargement */
document.addEventListener('DOMContentLoaded', function(){
  if(authRestore()){
    startApp();
  } else {
    $('loginScreen').style.display = 'flex';
    setTimeout(function(){ var i=$('loginCode'); if(i) i.focus(); }, 150);
  }
});
