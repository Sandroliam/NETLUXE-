/* NETLUXE ADMIN — App (rendu, navigation, CRUD) */
var CUR = 'dash';
var EDIT_ID = null;
var TYPE_LABEL = { film:'Film', series:'Série', cartoon:'Dessin animé' };
var LANGS = ['FR','EN','ES','CR'];

/* ---------- UTILS ---------- */
function $(id){ return document.getElementById(id); }
function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]; }); }
function n(v){ return (v||0).toLocaleString('fr-FR'); }
function dt(s){ if(!s) return '—'; try{ return new Date(s).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'}); }catch(e){ return '—'; } }
function toast(msg, kind){
  var t = $('toast'); t.textContent = msg;
  t.className = 'toast on' + (kind ? ' '+kind : '');
  clearTimeout(window._tt);
  window._tt = setTimeout(function(){ t.className = 'toast'; }, 2600);
}

/* ---------- NAV ---------- */
function nav(page, title){
  if(!SESSION.active) return;
  CUR = page;
  var pages = document.querySelectorAll('.page');
  for(var i=0;i<pages.length;i++) pages[i].classList.remove('act');
  var el = $('pg-'+page); if(el) el.classList.add('act');
  var items = document.querySelectorAll('.nav-item');
  for(i=0;i<items.length;i++) items[i].classList.remove('act');
  var ni = document.querySelector('[data-nav="'+page+'"]');
  if(ni) ni.classList.add('act');
  $('tbTitle').textContent = title || page;
  closeSb();
  window.scrollTo(0,0);
  render(page);
}
function toggleSb(){ $('sidebar').classList.toggle('open'); $('sbOv').classList.toggle('on'); }
function closeSb(){ $('sidebar').classList.remove('open'); $('sbOv').classList.remove('on'); }

/* ---------- RENDER DISPATCH ---------- */
function render(page){
  if(page==='dash') renderDash();
  else if(page==='films') renderContent('film');
  else if(page==='series') renderContent('series');
  else if(page==='cartoons') renderContent('cartoon');
  else if(page==='users') renderUsers();
  else if(page==='lics') renderLicenses();
  else if(page==='stats') renderStats();
  else if(page==='audit') renderAudit();
  refreshBadges();
}
function refreshBadges(){
  var s = DB.stats();
  if($('bFilms')) $('bFilms').textContent = s.films;
  if($('bSeries')) $('bSeries').textContent = s.series;
  if($('bCart')) $('bCart').textContent = s.cartoons;
  if($('bUsers')) $('bUsers').textContent = s.profiles;
}

/* ---------- DASHBOARD ---------- */
function renderDash(){
  var s = DB.stats();
  $('dashStats').innerHTML =
    statCard('👥', n(s.profiles), 'Profils actifs', '+'+s.accounts+' comptes', 'up') +
    statCard('🎬', n(s.contents), 'Contenus au catalogue', s.films+' films · '+s.series+' séries', 'up') +
    statCard('▶️', n(s.views), 'Vues cumulées', '+'+n(Math.round(s.views*0.12))+' ce mois', 'up') +
    statCard('💰', '$'+n(s.revenue), 'Revenu potentiel/mois', 'base abonnement 7,99$', 'up');

  var cat = DB.catalog().slice().sort(function(a,b){ return (b.views||0)-(a.views||0); }).slice(0,5);
  var h = '';
  for(var i=0;i<cat.length;i++){
    var c = cat[i];
    h += '<tr><td><div class="cell-main"><img class="thumb" src="'+esc(c.img)+'" alt=""><div><div class="cell-t">'+esc(c.title)+'</div><div class="cell-s">'+esc(TYPE_LABEL[c.type]||c.type)+' · '+c.year+'</div></div></div></td>'+
         '<td>'+n(c.views)+'</td><td>'+n(c.likes)+'</td><td><span class="badge b-gold">★ '+(c.rat||'—')+'</span></td></tr>';
  }
  $('dashTop').innerHTML = h || '<tr><td colspan="4" class="empty">Aucun contenu</td></tr>';

  var a = DB.audit().slice(0,6), ah='';
  for(i=0;i<a.length;i++){
    ah += '<tr><td>'+dt(a[i].at)+'</td><td><span class="badge b-info">'+esc(a[i].action)+'</span></td><td>'+esc(a[i].detail)+'</td><td>'+esc(a[i].by)+'</td></tr>';
  }
  $('dashAudit').innerHTML = ah || '<tr><td colspan="4" class="empty">Aucune activité</td></tr>';
}
function statCard(ic, val, lbl, chg, dir){
  return '<div class="stat"><div class="stat-ic" style="background:rgba(229,9,20,.12)">'+ic+'</div>'+
    '<div class="stat-val">'+val+'</div><div class="stat-lbl">'+lbl+'</div>'+
    '<div class="stat-chg '+(dir||'up')+'">'+chg+'</div></div>';
}

/* ---------- CONTENUS (CRUD) ---------- */
function renderContent(type){
  var list = DB.byType(type), h='';
  for(var i=0;i<list.length;i++){
    var c = list[i];
    var st = c.status==='draft' ? '<span class="badge b-warn">Brouillon</span>' : '<span class="badge b-ok">En ligne</span>';
    h += '<tr>'+
      '<td><div class="cell-main"><img class="thumb" src="'+esc(c.img)+'" alt=""><div><div class="cell-t">'+esc(c.title)+(c.org?' <span class="badge b-gold" style="margin-left:4px">ORIGINAL</span>':'')+'</div><div class="cell-s">'+esc(c.dir||'—')+'</div></div></div></td>'+
      '<td>'+c.year+'</td><td>'+esc(c.genre||'—')+'</td>'+
      '<td>'+(c.audio||[]).join(', ')+'</td>'+
      '<td>'+n(c.views)+'</td><td>'+st+'</td>'+
      '<td><div class="acts">'+
        '<button class="ico-btn" onclick="openForm('+c.id+')" title="Modifier">✏️</button>'+
        '<button class="ico-btn del" onclick="askDelete('+c.id+')" title="Supprimer">🗑</button>'+
      '</div></td></tr>';
  }
  var tb = $('tb-'+type);
  if(tb) tb.innerHTML = h || '<tr><td colspan="7" class="empty"><div class="empty-ic">🎬</div>Aucun contenu — cliquez sur « Ajouter »</td></tr>';
}
function openForm(id){
  if(!requirePerm('content.write')) return;
  EDIT_ID = id || null;
  var c = id ? DB.find(id) : null;
  var type = c ? c.type : (CUR==='series'?'series':(CUR==='cartoons'?'cartoon':'film'));
  $('mTitle').textContent = c ? 'Modifier — '+c.title : 'Ajouter un contenu';
  $('fTitle').value = c?c.title:'';
  $('fType').value = type;
  $('fYear').value = c?c.year:new Date().getFullYear();
  $('fGenre').value = c?(c.genre||''):'';
  $('fDur').value = c?(c.dur||''):'';
  $('fDir').value = c?(c.dir||''):'';
  $('fImg').value = c?(c.img||''):'';
  $('fDesc').value = c?(c.desc||''):'';
  $('fRat').value = c?(c.rat||''):'';
  $('fStatus').value = c?(c.status||'live'):'live';
  $('fOrg').checked = c?!!c.org:false;
  buildChips('fAudio', c?(c.audio||[]):['FR']);
  buildChips('fSubs', c?(c.subs||[]):['FR']);
  $('ovForm').classList.add('on');
}
function buildChips(box, sel){
  var h='';
  for(var i=0;i<LANGS.length;i++){
    var on = sel.indexOf(LANGS[i])!==-1;
    h += '<div class="chip'+(on?' on':'')+'" onclick="this.classList.toggle(\'on\')" data-v="'+LANGS[i]+'">'+LANGS[i]+'</div>';
  }
  $(box).innerHTML = h;
}
function readChips(box){
  var out=[], els=$(box).querySelectorAll('.chip.on');
  for(var i=0;i<els.length;i++) out.push(els[i].getAttribute('data-v'));
  return out;
}
function closeForm(){ $('ovForm').classList.remove('on'); EDIT_ID=null; }

function saveForm(e){
  e.preventDefault();
  if(!requirePerm('content.write')) return;
  var t = $('fTitle').value.trim();
  if(!t) return toast('Le titre est obligatoire','err');
  var audio = readChips('fAudio'), subs = readChips('fSubs');
  if(!audio.length) return toast('Sélectionnez au moins une piste audio','err');
  var item = {
    id: EDIT_ID, title:t, type:$('fType').value,
    year: parseInt($('fYear').value)||new Date().getFullYear(),
    genre: $('fGenre').value.trim(), dur:$('fDur').value.trim(),
    dir: $('fDir').value.trim(),
    img: $('fImg').value.trim() || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400',
    desc: $('fDesc').value.trim(),
    rat: parseFloat($('fRat').value)||0,
    status: $('fStatus').value, org: $('fOrg').checked,
    audio: audio, subs: subs
  };
  DB.upsert(item);
  closeForm();
  toast(EDIT_ID?'Contenu modifié':'Contenu ajouté','ok');
  render(CUR);
}

var DEL_ID = null;
function askDelete(id){
  if(!requirePerm('content.delete')) return;
  var c = DB.find(id); if(!c) return;
  DEL_ID = id;
  $('delTxt').innerHTML = 'Supprimer définitivement <strong>'+esc(c.title)+'</strong> ?<br><span style="color:var(--t3);font-size:12.5px">Cette action est irréversible.</span>';
  $('ovDel').classList.add('on');
}
function closeDel(){ $('ovDel').classList.remove('on'); DEL_ID=null; }
function confirmDelete(){
  if(DEL_ID){ DB.remove(DEL_ID); toast('Contenu supprimé','ok'); }
  closeDel(); render(CUR);
}
