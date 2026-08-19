/* ============================================
   NETLUXE — Coque desktop : sidebar + barre du haut
   Chaque entrée déclenche une navigation réelle.
   ============================================ */

function nxShEsc(s){
  return String(s == null ? '' : s).replace(/[&<>"']/g, function(m){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];
  });
}

/* Entrées de la sidebar, dans l'ordre de la référence */
var NX_NAV = [
  { key:'home',    label:'Accueil',     ic:'⌂', act:function(){ goHome(); } },
  { key:'films',   label:'Films',       ic:'🎬', act:function(){ goPage('films'); } },
  { key:'series',  label:'Séries',      ic:'📺', act:function(){ goPage('series'); } },
  { key:'cartoons',label:'Animés',      ic:'🐱', act:function(){ goPage('cartoons'); } },
  { key:'new',     label:'Nouveautés',  ic:'★', act:function(){ nxShNew(); } },
  { key:'mylist',  label:'Ma liste',    ic:'+', act:function(){ goPage('mylist'); } },
  { sep:true },
  { key:'profiles',label:'Profils',     ic:'👤', act:function(){ nxShowProfileSelect(); } },
  { key:'subs',    label:'Abonnements', ic:'▤', act:function(){ nxOpenSubSettings(); } },
  { key:'settings',label:'Paramètres',  ic:'⚙', act:function(){ goPage('settings'); } },
  { key:'help',    label:'Aide',        ic:'?', act:function(){ nxShHelp(); } }
];

var NX_SH_ACTIVE = 'profiles';

/* ---------- CONSTRUCTION ---------- */
function nxBuildShell(){
  if(document.getElementById('nxShell')) return;

  /* sidebar */
  var s = document.createElement('div');
  s.id = 'nxShell';
  s.className = 'nxsh';
  var h = '<div class="nxsh-logo">'+
            '<div class="nxsh-n">N</div>'+
            '<span class="nxsh-wm">NETLUXE</span>'+
          '</div><div class="nxsh-grp">';
  for(var i=0;i<NX_NAV.length;i++){
    var it = NX_NAV[i];
    if(it.sep){ h += '</div><div class="nxsh-sep"></div><div class="nxsh-grp">'; continue; }
    h += '<button class="nxsh-i" id="nxsh_'+it.key+'" onclick="nxShGo(\''+it.key+'\')">'+
         '<span class="ic">'+it.ic+'</span><span>'+it.label+'</span></button>';
  }
  h += '</div><div class="nxsh-sp"></div>'+
       '<div class="nxsh-grp" style="padding-bottom:20px">'+
       '<button class="nxsh-i out" onclick="nxShLogout()">'+
       '<span class="ic">⏻</span><span>Déconnexion</span></button></div>';
  s.innerHTML = h;
  document.body.appendChild(s);

  /* barre du haut */
  var t = document.createElement('div');
  t.id = 'nxTop';
  t.className = 'nxtb';
  t.innerHTML =
    '<div class="nxtb-srch">'+
      '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">'+
        '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>'+
      '<input type="text" id="nxtbSrch" placeholder="Rechercher un film, une série..." '+
        'oninput="nxShSearch()" onkeydown="if(event.key===\'Enter\')nxShSearchOpen()">'+
    '</div>'+
    '<div class="nxtb-sp"></div>'+
    '<button class="nxtb-bell" onclick="nxShNotif()" aria-label="Notifications">🔔'+
      '<span class="nxtb-badge" id="nxtbBadge">3</span></button>'+
    '<button class="nxtb-usr" id="nxtbUsr" onclick="nxShMenu()">'+
      '<span class="nxtb-av" id="nxtbAv"></span>'+
      '<span class="nxtb-car">▼</span>'+
    '</button>';
  document.body.appendChild(t);

  /* panneaux */
  var m = document.createElement('div');
  m.id = 'nxTopMenu'; m.className = 'nxtb-menu';
  document.body.appendChild(m);

  var n = document.createElement('div');
  n.id = 'nxTopNotif'; n.className = 'nxtb-notif';
  document.body.appendChild(n);

  /* fermer les panneaux au clic extérieur */
  document.addEventListener('click', function(e){
    if(!e.target.closest('#nxtbUsr') && !e.target.closest('#nxTopMenu')) nxShCloseMenu();
    if(!e.target.closest('.nxtb-bell') && !e.target.closest('#nxTopNotif')) nxShCloseNotif();
  });
}

/* ---------- AFFICHAGE ---------- */
function nxShellShow(){
  nxBuildShell();
  document.body.classList.add('nxdesk');
  document.getElementById('nxShell').classList.add('on');
  document.getElementById('nxTop').classList.add('on');
  nxShAvatar();
  nxShMark(NX_SH_ACTIVE);
}

function nxShellHide(){
  document.body.classList.remove('nxdesk');
  var s = document.getElementById('nxShell'), t = document.getElementById('nxTop');
  if(s) s.classList.remove('on');
  if(t) t.classList.remove('on');
  nxShCloseMenu(); nxShCloseNotif();
}

/* Marquer l'entrée active avec l'indicateur doré */
function nxShMark(key){
  NX_SH_ACTIVE = key;
  for(var i=0;i<NX_NAV.length;i++){
    if(NX_NAV[i].sep) continue;
    var el = document.getElementById('nxsh_' + NX_NAV[i].key);
    if(el) el.classList.toggle('on', NX_NAV[i].key === key);
  }
}

/* Avatar réel dans la barre du haut */
function nxShAvatar(){
  var box = document.getElementById('nxtbAv');
  if(!box) return;
  var p = (typeof prof !== 'undefined') ? prof : null;
  if(p && p.photo){
    box.innerHTML = '<img src="'+p.photo+'" alt="">';
  } else if(p && p.avatarId && typeof nxAvRender === 'function'){
    box.innerHTML = nxAvRender(p.avatarId, 34);
  } else {
    box.innerHTML = '<span class="ph" style="background:'+((p&&p.color)||'#E6B800')+'">'+
                    ((p&&p.name)?p.name.charAt(0).toUpperCase():'N')+'</span>';
  }
}

/* ---------- NAVIGATION ---------- */
function nxShGo(key){
  for(var i=0;i<NX_NAV.length;i++){
    if(NX_NAV[i].key === key && NX_NAV[i].act){
      nxShMark(key);
      try { NX_NAV[i].act(); } catch(e){}
      return;
    }
  }
}

/* Nouveautés : page dédiée alimentée par les vrais champs */
function nxShNew(){
  if(typeof hideAll !== 'function') return;
  hideAll();
  var pg = document.getElementById('newPage');
  if(!pg){
    pg = document.createElement('div');
    pg.className = 'page'; pg.id = 'newPage';
    pg.innerHTML = '<h1 class="page-title">★ Nouveautés</h1><div class="page-row" id="pgNewRow"></div>';
    var app = document.getElementById('app');
    if(app) app.appendChild(pg);
  }
  pg.style.display = 'block';
  var pool = (typeof nxVisibleCatalog === 'function') ? nxVisibleCatalog() : (CAT||[]);
  var list = pool.slice().sort(function(a,b){ return (b.year||0) - (a.year||0); }).slice(0,24);
  if(typeof fillRow === 'function') fillRow('pgNewRow', list);
}

function nxShHelp(){
  if(typeof goPage === 'function') goPage('help');
  else if(typeof showToast === 'function') showToast('Aide — bientôt disponible');
}

function nxShLogout(){
  if(!confirm('Se déconnecter de NETLUXE ?')) return;
  if(typeof logout === 'function') logout();
}

/* ---------- RECHERCHE ---------- */
function nxShSearch(){
  var v = document.getElementById('nxtbSrch');
  if(!v) return;
  var q = v.value.trim();
  if(q.length < 2) return;
  nxShSearchOpen();
}

function nxShSearchOpen(){
  var v = document.getElementById('nxtbSrch');
  var q = v ? v.value : '';
  if(typeof openSearch === 'function') openSearch();
  var si = document.getElementById('srchInput');
  if(si){ si.value = q; }
  if(typeof nxsRefresh === 'function') nxsRefresh();
}

/* ---------- MENU UTILISATEUR ---------- */
function nxShMenu(){
  var m = document.getElementById('nxTopMenu');
  var u = document.getElementById('nxtbUsr');
  if(!m) return;
  if(m.classList.contains('on')){ nxShCloseMenu(); return; }
  nxShCloseNotif();

  var p = (typeof prof !== 'undefined') ? prof : null;
  var em = (typeof user !== 'undefined' && user) ? user.email : '';
  var plan = (typeof nxCurrentPlan === 'function') ? nxCurrentPlan() : null;

  m.innerHTML =
    '<div class="nxtb-mh"><b>'+nxShEsc((p&&p.name)||'Profil')+'</b>'+
      '<span>'+nxShEsc(em)+'</span></div>'+
    '<button class="nxtb-mi" onclick="nxShMi(\'switch\')"><span class="ic">⇄</span>Changer de profil</button>'+
    '<button class="nxtb-mi" onclick="nxShMi(\'edit\')"><span class="ic">✎</span>Modifier le profil</button>'+
    '<button class="nxtb-mi" onclick="nxShMi(\'subs\')"><span class="ic">▤</span>'+
      'Abonnement'+(plan ? ' · '+nxShEsc(plan.name) : '')+'</button>'+
    '<button class="nxtb-mi" onclick="nxShMi(\'settings\')"><span class="ic">⚙</span>Paramètres</button>'+
    '<button class="nxtb-mi out" onclick="nxShMi(\'logout\')"><span class="ic">⏻</span>Déconnexion</button>';
  m.classList.add('on');
  if(u) u.classList.add('open');
}

function nxShCloseMenu(){
  var m = document.getElementById('nxTopMenu');
  var u = document.getElementById('nxtbUsr');
  if(m) m.classList.remove('on');
  if(u) u.classList.remove('open');
}

function nxShMi(a){
  nxShCloseMenu();
  if(a === 'switch')   { nxShMark('profiles'); if(typeof nxShowProfileSelect === 'function') nxShowProfileSelect(); }
  if(a === 'edit')     { if(typeof nxOpenEdit === 'function' && typeof prof !== 'undefined' && prof){
                           if(typeof nxShowProfileSelect === 'function') nxShowProfileSelect();
                           nxOpenEdit(prof.id); } }
  if(a === 'subs')     { nxShMark('subs'); if(typeof nxOpenSubSettings === 'function') nxOpenSubSettings(); }
  if(a === 'settings') { nxShMark('settings'); if(typeof goPage === 'function') goPage('settings'); }
  if(a === 'logout')   { nxShLogout(); }
}

/* ---------- NOTIFICATIONS ---------- */
/* Construites depuis de vraies données : titres annoncés + état d'abonnement */
function nxShBuildNotifs(){
  var out = [];
  var seen = {};
  try {
    var raw = localStorage.getItem('netluxe_notif_read');
    seen = raw ? JSON.parse(raw) : {};
  } catch(e){ seen = {}; }

  /* sorties à venir */
  if(typeof nxComingSoon === 'function'){
    var cs = nxComingSoon();
    for(var i=0;i<cs.length && i<3; i++){
      var id = 'coming_' + cs[i].item.id;
      out.push({
        id:id, ic:'🔥',
        title:cs[i].item.title,
        text:(typeof nxCountdown === 'function' ? nxCountdown(cs[i].days) : '') +
             ' · ' + (cs[i].item.genre || ''),
        unread:!seen[id],
        act:'detail:' + cs[i].item.id
      });
    }
  }

  /* état de l'abonnement */
  if(typeof nxSubStatus === 'function'){
    var st = nxSubStatus();
    if(st === 'PENDING_PAYMENT'){
      out.push({ id:'sub_pending', ic:'⏳', title:'Abonnement en attente',
        text:'Le paiement n\'est pas encore confirmé.', unread:!seen['sub_pending'], act:'subs' });
    } else if(st === 'PAYMENT_FAILED'){
      out.push({ id:'sub_failed', ic:'⚠️', title:'Paiement échoué',
        text:'Mettez à jour votre moyen de paiement.', unread:!seen['sub_failed'], act:'subs' });
    } else if(st === 'EXPIRED'){
      out.push({ id:'sub_exp', ic:'⚠️', title:'Abonnement expiré',
        text:'L\'accès premium est bloqué.', unread:!seen['sub_exp'], act:'subs' });
    } else if(st === 'INACTIVE'){
      out.push({ id:'sub_none', ic:'▤', title:'Aucun forfait actif',
        text:'Découvrez les formules NETLUXE.', unread:!seen['sub_none'], act:'subs' });
    }
  }

  /* reprise de lecture */
  if(typeof nxContinueList === 'function'){
    var cl = nxContinueList();
    if(cl && cl.length){
      var e = cl[0];
      var cid = 'cont_' + (e.parent ? e.parent.id : e.item.id);
      out.push({ id:cid, ic:'⏯', title:'Reprendre ' + (e.parent ? e.parent.title : e.item.title),
        text:(e.remaining || '') + ' restantes', unread:!seen[cid],
        act:'play:' + (e.parent ? e.parent.id : e.item.id) });
    }
  }
  return out;
}

function nxShNotif(){
  var n = document.getElementById('nxTopNotif');
  if(!n) return;
  if(n.classList.contains('on')){ nxShCloseNotif(); return; }
  nxShCloseMenu();

  var list = nxShBuildNotifs();
  var h = '<div class="nxtb-nh"><b>Notifications</b>'+
          (list.length ? '<button onclick="nxShReadAll()">Tout marquer comme lu</button>' : '')+
          '</div>';
  if(!list.length){
    h += '<div class="nxtb-ne">Aucune notification</div>';
  } else {
    for(var i=0;i<list.length;i++){
      var it = list[i];
      h += '<div class="nxtb-nr'+(it.unread?' unread':'')+'" '+
           'onclick="nxShNotifGo(\''+it.id+'\',\''+it.act+'\')">'+
           '<span class="ic">'+it.ic+'</span>'+
           '<span class="tx"><b>'+nxShEsc(it.title)+'</b>'+
           '<span>'+nxShEsc(it.text)+'</span></span></div>';
    }
  }
  n.innerHTML = h;
  n.classList.add('on');
}

function nxShCloseNotif(){
  var n = document.getElementById('nxTopNotif');
  if(n) n.classList.remove('on');
}

function nxShNotifGo(id, act){
  nxShMarkRead(id);
  nxShCloseNotif();
  if(act === 'subs' && typeof nxOpenSubSettings === 'function'){ nxOpenSubSettings(); return; }
  if(act.indexOf('detail:') === 0 && typeof showDetail === 'function'){
    showDetail(parseInt(act.split(':')[1], 10)); return;
  }
  if(act.indexOf('play:') === 0 && typeof playVideo === 'function'){
    playVideo(parseInt(act.split(':')[1], 10)); return;
  }
}

function nxShMarkRead(id){
  try {
    var raw = localStorage.getItem('netluxe_notif_read');
    var seen = raw ? JSON.parse(raw) : {};
    seen[id] = true;
    localStorage.setItem('netluxe_notif_read', JSON.stringify(seen));
  } catch(e){}
  nxShBadge();
}

function nxShReadAll(){
  var list = nxShBuildNotifs();
  try {
    var raw = localStorage.getItem('netluxe_notif_read');
    var seen = raw ? JSON.parse(raw) : {};
    for(var i=0;i<list.length;i++) seen[list[i].id] = true;
    localStorage.setItem('netluxe_notif_read', JSON.stringify(seen));
  } catch(e){}
  nxShBadge();
  nxShCloseNotif();
}

/* Badge : nombre réel de notifications non lues */
function nxShBadge(){
  var b = document.getElementById('nxtbBadge');
  if(!b) return;
  var list = nxShBuildNotifs();
  var n = 0;
  for(var i=0;i<list.length;i++){ if(list[i].unread) n++; }
  if(n > 0){ b.textContent = n; b.style.display = 'flex'; }
  else { b.style.display = 'none'; }
}

/* ---------- ACTIVATION AUTOMATIQUE ---------- */
(function(){
  function boot(){
    if(window.innerWidth < 1025) return;
    try {
      var su = localStorage.getItem('netluxe_user');
      if(!su) return;              /* pas connecté : coque inutile */
      nxShellShow();
      nxShBadge();
    } catch(e){}
  }
  if(document.readyState === 'complete') setTimeout(boot, 260);
  else window.addEventListener('load', function(){ setTimeout(boot, 260); });

  window.addEventListener('resize', function(){
    if(window.innerWidth < 1025) nxShellHide();
    else {
      try { if(localStorage.getItem('netluxe_user')) nxShellShow(); } catch(e){}
    }
  });
})();
