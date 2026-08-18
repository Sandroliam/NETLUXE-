/* NETLUXE — Paramètres complets et fonctionnels */

var SETTINGS_DEFAULTS = {
  autoplay:true, autoplayNext:true, quality:'auto', speed:1, skipIntro:false,
  lang:'FR', audio:'FR', subs:'FR', subsSize:'md',
  theme:'dark', accent:'red', reduceMotion:false, compact:false,
  notifNew:true, notifRecos:true, notifResume:true,
  saveHistory:true, personalized:true, shareStats:false,
  pinLock:false, pin:'', kidsMode:false, maxRating:'all'
};

function prefs(){
  if(!prof) return SETTINGS_DEFAULTS;
  if(!prof.prefs) prof.prefs = {};
  for(var k in SETTINGS_DEFAULTS){
    if(SETTINGS_DEFAULTS.hasOwnProperty(k) && prof.prefs[k]===undefined) prof.prefs[k]=SETTINGS_DEFAULTS[k];
  }
  return prof.prefs;
}

function setPref(key, val){
  if(!prof) return;
  prefs()[key] = val;
  saveProfile();
  applySettings();
  renderSettings();
  showToast('Paramètre enregistré');
}

function togglePref(key){
  if(!prof) return;
  setPref(key, !prefs()[key]);
}

/* Applique réellement les préférences visuelles */
function applySettings(){
  var p = prefs();
  var r = document.documentElement;
  var accents = { red:'#E50914', gold:'#D4AF37', turq:'#00CED1', violet:'#8B5CF6' };
  r.style.setProperty('--red', accents[p.accent] || accents.red);
  if(p.theme==='light'){
    r.style.setProperty('--bg','#F5F5F0'); r.style.setProperty('--s1','#FFFFFF');
    r.style.setProperty('--s2','#EFEFEA'); r.style.setProperty('--t1','#0A0A0A');
    r.style.setProperty('--t2','#555'); document.body.style.background='#F5F5F0';
  } else {
    r.style.setProperty('--bg','#0A0A0A'); r.style.setProperty('--s1','#141414');
    r.style.setProperty('--s2','#1C1C1C'); r.style.setProperty('--t1','#F5F5F0');
    r.style.setProperty('--t2','#9A9A9A'); document.body.style.background='#0A0A0A';
  }
  document.body.style.transition = p.reduceMotion ? 'none' : '';
  if(p.reduceMotion){
    if(!document.getElementById('noMotion')){
      var s=document.createElement('style'); s.id='noMotion';
      s.textContent='*{animation:none!important;transition:none!important}';
      document.head.appendChild(s);
    }
  } else { var n=document.getElementById('noMotion'); if(n) n.remove(); }
  var sizes={sm:'14px',md:'18px',lg:'23px'};
  r.style.setProperty('--subSize', sizes[p.subsSize]||sizes.md);
}

/* --- Composants UI --- */
function swRow(label, key, hint){
  var on = prefs()[key];
  return '<div class="setting-row"><div style="flex:1"><div class="setting-lbl">'+label+'</div>'+
    (hint?'<div style="font-size:11.5px;color:var(--t3);margin-top:2px">'+hint+'</div>':'')+'</div>'+
    '<div class="toggle'+(on?' on':'')+'" onclick="togglePref(\''+key+'\')"></div></div>';
}
function selRow(label, key, opts){
  var cur = prefs()[key], o='';
  for(var i=0;i<opts.length;i++){
    var v=opts[i][0], t=opts[i][1];
    o += '<option value="'+v+'"'+(String(cur)===String(v)?' selected':'')+'>'+t+'</option>';
  }
  return '<div class="setting-row"><span class="setting-lbl">'+label+'</span>'+
    '<select class="sel" onchange="setPref(\''+key+'\',this.value)">'+o+'</select></div>';
}
function infoRow(label, val){
  return '<div class="setting-row"><span class="setting-lbl">'+label+'</span><span class="setting-val">'+val+'</span></div>';
}
function btnRow(label, action, style){
  return '<div class="setting-row"><span class="setting-lbl">'+label+'</span>'+
    '<button class="btn btn-o" style="padding:7px 14px;font-size:12.5px;'+(style||'')+'" onclick="'+action+'">Modifier</button></div>';
}

/* --- Rendu principal --- */
function renderSettings(){
  var c = document.getElementById('settingsContent');
  if(!c) return;
  var p = prefs();
  var h = '';

  /* PROFIL */
  h += '<div class="settings-sec"><h3>👤 Profil</h3>';
  h += infoRow('Nom', prof?prof.name:'—');
  h += '<div class="setting-row"><span class="setting-lbl">Modifier mon profil</span><button class="btn btn-o" style="padding:7px 14px;font-size:12.5px" onclick="openEditProfile()">Modifier</button></div>';
  h += '<div class="setting-row"><span class="setting-lbl">Changer de profil</span><button class="btn btn-o" style="padding:7px 14px;font-size:12.5px" onclick="openProfileSwitch()">Changer</button></div>';
  h += '<div class="setting-row"><span class="setting-lbl">Ajouter un profil</span><button class="btn btn-p" style="padding:7px 14px;font-size:12.5px" onclick="openAddProfile()">+ Ajouter</button></div>';
  h += '</div>';

  /* COMPTE */
  h += '<div class="settings-sec"><h3>🔑 Compte</h3>';
  h += infoRow('Email', user?user.email:'—');
  h += infoRow('Membre depuis', (user&&user.createdAt)?new Date(user.createdAt).toLocaleDateString('fr-FR'):'—');
  h += infoRow('Profils', (user&&user.profiles)?user.profiles.length:1);
  h += infoRow('Abonnement', '<span style="color:var(--gold)">Gratuit</span>');
  h += '<div class="setting-row"><span class="setting-lbl">Se déconnecter</span><button class="btn btn-o" style="padding:7px 14px;font-size:12.5px;color:var(--red)" onclick="logout()">Déconnexion</button></div>';
  h += '</div>';

  /* APPARENCE */
  h += '<div class="settings-sec"><h3>🎨 Apparence</h3>';
  h += selRow('Thème','theme',[['dark','Sombre'],['light','Clair']]);
  h += selRow('Couleur d\'accent','accent',[['red','Rouge NETLUXE'],['gold','Or antique'],['turq','Turquoise'],['violet','Violet']]);
  h += swRow('Réduire les animations','reduceMotion','Améliore les performances');
  h += swRow('Affichage compact','compact','Plus de contenu à l\'écran');
  h += '</div>';

  /* LECTURE */
  h += '<div class="settings-sec"><h3>▶️ Lecture</h3>';
  h += swRow('Lecture automatique','autoplay','Démarrer dès l\'ouverture');
  h += swRow('Épisode suivant automatique','autoplayNext');
  h += swRow('Passer les intros','skipIntro','Quand l\'information est disponible');
  h += selRow('Qualité vidéo','quality',[['auto','Auto (recommandé)'],['1080','1080p'],['720','720p'],['480','480p — économise les données']]);
  h += selRow('Vitesse par défaut','speed',[['0.5','0.5×'],['0.75','0.75×'],['1','Normale'],['1.25','1.25×'],['1.5','1.5×'],['2','2×']]);
  h += '</div>';

  /* AUDIO & SOUS-TITRES */
  h += '<div class="settings-sec"><h3>🔊 Audio et sous-titres</h3>';
  h += selRow('Langue audio','audio',[['FR','Français'],['EN','English'],['ES','Español'],['CR','Kreyòl Ayisyen']]);
  h += selRow('Sous-titres','subs',[['FR','Français'],['EN','English'],['ES','Español'],['CR','Kreyòl Ayisyen'],['off','Désactivés']]);
  h += selRow('Taille des sous-titres','subsSize',[['sm','Petite'],['md','Moyenne'],['lg','Grande']]);
  h += '<div style="font-size:11.5px;color:var(--t3);padding:8px 0;line-height:1.5">Seules les pistes réellement disponibles pour chaque contenu sont proposées pendant la lecture.</div>';
  h += '</div>';

  /* LANGUE */
  h += '<div class="settings-sec"><h3>🌍 Langue</h3>';
  h += selRow('Langue de l\'interface','lang',[['FR','Français'],['EN','English'],['ES','Español'],['CR','Kreyòl Ayisyen']]);
  h += '</div>';

  /* NOTIFICATIONS */
  h += '<div class="settings-sec"><h3>🔔 Notifications</h3>';
  h += swRow('Nouveautés du catalogue','notifNew');
  h += swRow('Recommandations personnalisées','notifRecos');
  h += swRow('Reprendre un visionnage','notifResume');
  h += '</div>';

  /* SECURITE */
  h += '<div class="settings-sec"><h3>🔒 Sécurité</h3>';
  h += swRow('Verrouiller ce profil par code','pinLock','Demande un code à l\'ouverture');
  if(p.pinLock) h += '<div class="setting-row"><span class="setting-lbl">Code du profil</span><button class="btn btn-o" style="padding:7px 14px;font-size:12.5px" onclick="openPinSet()">'+(p.pin?'Modifier':'Définir')+'</button></div>';
  h += swRow('Mode enfant','kidsMode','Limite le catalogue aux contenus adaptés');
  h += selRow('Classification maximale','maxRating',[['all','Tout public'],['12','12+'],['16','16+'],['18','18+']]);
  h += '</div>';

  /* CONFIDENTIALITE */
  h += '<div class="settings-sec"><h3>🛡️ Confidentialité</h3>';
  h += swRow('Enregistrer l\'historique','saveHistory','Nécessaire pour reprendre la lecture');
  h += swRow('Recommandations personnalisées','personalized','Basées sur votre historique');
  h += swRow('Partager des statistiques anonymes','shareStats');
  h += '<div class="setting-row"><span class="setting-lbl">Effacer mon historique</span><button class="btn btn-o" style="padding:7px 14px;font-size:12.5px;color:var(--red)" onclick="clearHistory()">Effacer</button></div>';
  h += '<div class="setting-row"><span class="setting-lbl">Exporter mes données</span><button class="btn btn-o" style="padding:7px 14px;font-size:12.5px" onclick="exportMyData()">Télécharger</button></div>';
  h += '</div>';

  /* A PROPOS */
  h += '<div class="settings-sec"><h3>ℹ️ À propos</h3>';
  h += infoRow('Version','NETLUXE 14.0');
  h += infoRow('Contenus au catalogue', CAT.length);
  h += '<div class="setting-row"><span class="setting-lbl">Espace administrateur</span><button class="btn btn-o" style="padding:7px 14px;font-size:12.5px" onclick="goToAdmin()">Ouvrir</button></div>';
  h += '</div>';

  c.innerHTML = h;
}

/* --- Actions confidentialité --- */
function clearHistory(){
  if(!prof) return;
  if(!confirm('Effacer tout votre historique de visionnage ?')) return;
  prof.history = []; prof.progress = {};
  saveProfile(); showToast('Historique effacé'); renderSettings();
}
function exportMyData(){
  var data = { profil:prof, compte:user?{email:user.email,createdAt:user.createdAt}:null, exporte:new Date().toISOString() };
  var b = new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  var a = document.createElement('a');
  a.href = URL.createObjectURL(b); a.download='mes-donnees-netluxe.json'; a.click();
  showToast('Données téléchargées');
}
function openPinSet(){
  var v = prompt('Entrez un code à 4 chiffres :','');
  if(v===null) return;
  if(!/^\d{4}$/.test(v)) return showToast('Le code doit contenir 4 chiffres');
  prefs().pin = v; saveProfile(); showToast('Code enregistré'); renderSettings();
}
