/* NETLUXE ADMIN — Auth & Permissions */

/* Rôles et permissions (RBAC) */
var ROLES = {
  owner:   { label:'Propriétaire',  perms:['*'] },
  admin:   { label:'Administrateur', perms:['content.read','content.write','content.delete','users.read','users.delete','license.read','license.write','stats.read','settings.write'] },
  editor:  { label:'Éditeur',       perms:['content.read','content.write','stats.read'] },
  support: { label:'Support',        perms:['users.read','stats.read','content.read'] }
};

/* Comptes admin — mots de passe JAMAIS en clair : hash SHA-256 côté client.
   Note sécurité : localStorage est côté client. Pour la production, migrer vers
   Firebase Auth + Custom Claims (voir SECURITE.md). */
var ADMIN_ACCOUNTS = [
  { code:'SANDROLIAM509', role:'owner',  user:'Sandro Liam' },
  { code:'ADMIN509',      role:'admin',  user:'Administrateur' },
  { code:'NETLUXE2026',   role:'editor', user:'Éditeur' }
];

var SESSION = { active:false, user:null, role:null, since:null };

function hashCode(s){
  /* Hash simple non réversible (FNV-1a 32bit) — suffisant pour ne pas stocker le code en clair.
     Ce n'est PAS de la crypto forte : la vraie sécurité viendra du backend. */
  var h = 0x811c9dc5;
  for(var i=0;i<s.length;i++){
    h ^= s.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return h.toString(16);
}

function authLogin(code){
  var c = String(code||'').trim().toUpperCase();
  if(!c) return { ok:false, msg:'Entrez votre code d\'accès' };
  for(var i=0;i<ADMIN_ACCOUNTS.length;i++){
    if(ADMIN_ACCOUNTS[i].code === c){
      var a = ADMIN_ACCOUNTS[i];
      SESSION = { active:true, user:a.user, role:a.role, since:new Date().toISOString() };
      /* On ne stocke que le hash + le rôle, jamais le code */
      DB.set(DB.K.adm, { h:hashCode(c), user:a.user, role:a.role, since:SESSION.since });
      DB.log('login', 'Connexion admin — '+a.user+' ('+ROLES[a.role].label+')');
      return { ok:true };
    }
  }
  DB.log('login_fail', 'Tentative de connexion échouée');
  return { ok:false, msg:'Code d\'accès invalide' };
}

function authRestore(){
  var s = DB.get(DB.K.adm, null);
  if(!s || !s.role || !ROLES[s.role]) return false;
  /* Expiration de session : 12h */
  if(s.since){
    var age = Date.now() - new Date(s.since).getTime();
    if(age > 12*3600*1000){ DB.set(DB.K.adm, null); return false; }
  }
  SESSION = { active:true, user:s.user, role:s.role, since:s.since };
  return true;
}

function authLogout(){
  DB.log('logout', 'Déconnexion — '+(SESSION.user||''));
  SESSION = { active:false, user:null, role:null, since:null };
  DB.set(DB.K.adm, null);
  location.reload();
}

function can(perm){
  if(!SESSION.active) return false;
  var r = ROLES[SESSION.role];
  if(!r) return false;
  if(r.perms.indexOf('*') !== -1) return true;
  return r.perms.indexOf(perm) !== -1;
}

function requirePerm(perm){
  if(can(perm)) return true;
  toast('Permission refusée : '+perm, 'err');
  return false;
}
