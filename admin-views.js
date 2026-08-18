/* NETLUXE ADMIN — Vues : Utilisateurs, Licences, Stats, Audit */

/* ---------- UTILISATEURS / PROFILS ---------- */
function renderUsers(){
  if(!can('users.read')){ $('tb-users').innerHTML = '<tr><td colspan="6" class="empty">Accès refusé</td></tr>'; return; }
  var q = ($('userSearch') && $('userSearch').value || '').toLowerCase();
  var list = DB.allProfiles();
  if(q) list = list.filter(function(p){
    return (p.name||'').toLowerCase().indexOf(q)!==-1 || (p.email||'').toLowerCase().indexOf(q)!==-1;
  });
  var h='';
  for(var i=0;i<list.length;i++){
    var p = list[i];
    var av = p.photo
      ? '<img class="pd-av" style="width:34px;height:34px;font-size:14px;border-radius:8px" src="'+esc(p.photo)+'" alt="">'
      : '<div class="pd-av" style="width:34px;height:34px;font-size:14px;border-radius:8px;background:'+esc(p.color||'#E50914')+'">'+esc((p.name||'?').charAt(0).toUpperCase())+'</div>';
    h += '<tr>'+
      '<td><div class="cell-main">'+av+'<div><div class="cell-t">'+esc(p.name)+(p.isAdmin?' <span class="badge b-gold" style="margin-left:4px">ADMIN</span>':'')+'</div><div class="cell-s">ID '+esc(String(p.id).slice(0,10))+'</div></div></div></td>'+
      '<td style="color:var(--t2)">'+esc(p.email)+'</td>'+
      '<td><span class="badge b-info">'+esc(p.prefs.lang||'FR')+'</span></td>'+
      '<td>'+(p.history?p.history.length:0)+'</td>'+
      '<td style="color:var(--t3);font-size:12.5px">'+dt(p.createdAt)+'</td>'+
      '<td><div class="acts"><button class="ico-btn" onclick="openProfile(\''+p.id+'\')" title="Fiche profil">👁</button>'+
      (can('users.delete')?'<button class="ico-btn del" onclick="askDelUser(\''+esc(p.email)+'\')" title="Supprimer le compte">🗑</button>':'')+
      '</div></td></tr>';
  }
  $('tb-users').innerHTML = h || '<tr><td colspan="6" class="empty"><div class="empty-ic">👥</div>Aucun profil enregistré</td></tr>';
}

function openProfile(pid){
  if(!can('users.read')) return toast('Permission refusée','err');
  var p = DB.profile(pid);
  if(!p) return toast('Profil introuvable','err');

  var av = p.photo
    ? '<img class="pd-av" src="'+esc(p.photo)+'" alt="">'
    : '<div class="pd-av" style="background:'+esc(p.color||'#E50914')+'">'+esc((p.name||'?').charAt(0).toUpperCase())+'</div>';

  var hist = '', i;
  var hs = (p.history||[]).slice(0,8);
  for(i=0;i<hs.length;i++){
    var c = DB.find(hs[i].id || hs[i]);
    if(!c) continue;
    var pr = p.progress && p.progress[c.id] ? Math.round(p.progress[c.id]) : 0;
    hist += '<div class="hist-i"><img src="'+esc(c.img)+'" alt=""><div style="flex:1"><div style="font-size:13px;font-weight:500">'+esc(c.title)+'</div>'+
            '<div class="bar"><div style="width:'+pr+'%"></div></div></div><span style="font-size:11.5px;color:var(--t3)">'+pr+'%</span></div>';
  }
  if(!hist) hist = '<div class="empty" style="padding:22px">Aucun visionnage</div>';

  var lst = '', ls = (p.list||[]).slice(0,10);
  for(i=0;i<ls.length;i++){
    var lc = DB.find(ls[i].id || ls[i]);
    if(lc) lst += '<span class="badge b-n" style="margin:0 4px 4px 0;display:inline-block">'+esc(lc.title)+'</span>';
  }
  if(!lst) lst = '<span style="color:var(--t3)">—</span>';

  $('pdBody').innerHTML =
    '<div class="pd-hdr">'+av+'<div><div class="pd-n">'+esc(p.name)+'</div><div class="pd-m">'+esc(p.email)+'</div></div></div>'+
    '<div style="background:rgba(0,206,209,.06);border:1px solid rgba(0,206,209,.18);border-radius:8px;padding:10px 13px;margin-bottom:18px;font-size:12.5px;color:var(--turq)">'+
      '🔒 Données de préférences uniquement — aucun mot de passe n\'est stocké ni affiché.</div>'+
    '<dl class="kv">'+
      '<dt>Identifiant</dt><dd style="font-family:monospace;font-size:12.5px">'+esc(p.id)+'</dd>'+
      '<dt>Compte</dt><dd>'+esc(p.email)+'</dd>'+
      '<dt>Date de création</dt><dd>'+dt(p.createdAt)+'</dd>'+
      '<dt>Dernière activité</dt><dd>'+dt(p.lastActive)+'</dd>'+
      '<dt>Langue interface</dt><dd><span class="badge b-info">'+esc(p.prefs.lang||'FR')+'</span></dd>'+
      '<dt>Audio préféré</dt><dd><span class="badge b-info">'+esc(p.prefs.audio||'FR')+'</span></dd>'+
      '<dt>Sous-titres</dt><dd><span class="badge b-info">'+esc(p.prefs.subs||'FR')+'</span></dd>'+
      '<dt>Vitesse lecture</dt><dd>'+(p.prefs.speed||1)+'×</dd>'+
      '<dt>Contenus vus</dt><dd>'+(p.history?p.history.length:0)+'</dd>'+
      '<dt>Ma liste</dt><dd>'+lst+'</dd>'+
    '</dl>'+
    '<div style="margin-top:20px"><div class="card-t" style="margin-bottom:11px;font-size:14px">Historique & progression</div>'+
    '<div class="hist">'+hist+'</div></div>';
  $('ovProfile').classList.add('on');
}
function closeProfile(){ $('ovProfile').classList.remove('on'); }

var DEL_EMAIL = null;
function askDelUser(email){
  if(!requirePerm('users.delete')) return;
  DEL_EMAIL = email;
  $('delTxt').innerHTML = 'Supprimer le compte <strong>'+esc(email)+'</strong> et tous ses profils ?<br><span style="color:var(--t3);font-size:12.5px">Action irréversible.</span>';
  $('ovDel').classList.add('on');
}

/* ---------- LICENCES ---------- */
function renderLicenses(){
  if(!can('license.read')){ $('tb-lics').innerHTML='<tr><td colspan="6" class="empty">Accès refusé</td></tr>'; return; }
  var l = DB.licenses(), h='';
  for(var i=0;i<l.length;i++){
    var x = l[i];
    var st = x.status==='warn'
      ? '<span class="badge b-warn">Renouvellement proche</span>'
      : '<span class="badge b-ok">Valide</span>';
    h += '<tr><td><div class="cell-t">'+esc(x.title)+'</div><div class="cell-s">'+esc(x.territory)+'</div></td>'+
      '<td>'+esc(x.holder)+'</td>'+
      '<td><span class="badge '+(x.type==='Propriété'?'b-gold':'b-info')+'">'+esc(x.type)+'</span></td>'+
      '<td style="font-size:12.5px;color:var(--t2)">'+esc(x.share)+'</td>'+
      '<td style="font-size:12.5px">'+esc(x.start)+' → '+esc(x.end)+'</td>'+
      '<td>'+st+'</td></tr>';
  }
  $('tb-lics').innerHTML = h || '<tr><td colspan="6" class="empty">Aucune licence</td></tr>';
}

/* ---------- STATISTIQUES ---------- */
function renderStats(){
  if(!can('stats.read')) return;
  var s = DB.stats(), cat = DB.catalog();
  $('statsGrid').innerHTML =
    statCard('🎬', n(s.contents), 'Contenus total', s.films+'F · '+s.series+'S · '+s.cartoons+'A', 'up') +
    statCard('▶️', n(s.views), 'Vues cumulées', 'toutes catégories', 'up') +
    statCard('❤️', n(s.likes), 'Likes cumulés', 'engagement', 'up') +
    statCard('👥', n(s.profiles), 'Profils', s.accounts+' comptes', 'up');

  /* Répartition par genre */
  var g = {}, i;
  for(i=0;i<cat.length;i++){ var k=cat[i].genre||'Autre'; g[k]=(g[k]||0)+1; }
  var keys = Object.keys(g).sort(function(a,b){ return g[b]-g[a]; });
  var max = keys.length ? g[keys[0]] : 1, gh='';
  for(i=0;i<keys.length;i++){
    var pc = Math.round(g[keys[i]]/max*100);
    gh += '<div style="margin-bottom:12px"><div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:5px"><span>'+esc(keys[i])+'</span><span style="color:var(--t3)">'+g[keys[i]]+'</span></div>'+
          '<div class="bar" style="height:6px"><div style="width:'+pc+'%"></div></div></div>';
  }
  $('genreChart').innerHTML = gh || '<div class="empty">Aucune donnée</div>';

  /* Top contenus */
  var top = cat.slice().sort(function(a,b){ return (b.views||0)-(a.views||0); }).slice(0,8), th='';
  for(i=0;i<top.length;i++){
    th += '<tr><td>'+(i+1)+'</td><td><div class="cell-main"><img class="thumb" style="width:30px;height:42px" src="'+esc(top[i].img)+'"><div class="cell-t">'+esc(top[i].title)+'</div></div></td>'+
      '<td>'+esc(TYPE_LABEL[top[i].type]||'')+'</td><td>'+n(top[i].views)+'</td><td>'+n(top[i].likes)+'</td></tr>';
  }
  $('tb-stats').innerHTML = th || '<tr><td colspan="5" class="empty">Aucune donnée</td></tr>';
}

/* ---------- AUDIT ---------- */
function renderAudit(){
  var a = DB.audit(), h='';
  for(var i=0;i<a.length;i++){
    var kind = a[i].action.indexOf('delete')!==-1 ? 'b-err' : (a[i].action.indexOf('fail')!==-1 ? 'b-warn' : 'b-info');
    h += '<tr><td style="font-size:12.5px;color:var(--t3);white-space:nowrap">'+dt(a[i].at)+'</td>'+
      '<td><span class="badge '+kind+'">'+esc(a[i].action)+'</span></td>'+
      '<td>'+esc(a[i].detail)+'</td><td style="color:var(--t2)">'+esc(a[i].by)+'</td></tr>';
  }
  $('tb-audit').innerHTML = h || '<tr><td colspan="4" class="empty"><div class="empty-ic">📋</div>Aucune activité enregistrée</td></tr>';
}

/* ---------- EXPORT ---------- */
function exportJSON(){
  var data = { catalog:DB.catalog(), licenses:DB.licenses(), profiles:DB.allProfiles(), stats:DB.stats(), exportedAt:new Date().toISOString() };
  var b = new Blob([JSON.stringify(data,null,2)], {type:'application/json'});
  var a = document.createElement('a');
  a.href = URL.createObjectURL(b);
  a.download = 'netluxe-export-'+new Date().toISOString().slice(0,10)+'.json';
  a.click();
  DB.log('export','Export JSON des données');
  toast('Export téléchargé','ok');
}
