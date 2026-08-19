/* ============================================
   NETLUXE — Écran d'abonnement (UI)
   S'insère entre la connexion et la sélection de profils.
   ============================================ */

function nxSubEsc(s){
  return String(s == null ? '' : s).replace(/[&<>"']/g, function(m){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];
  });
}

var NXSUB_SEL = null;   /* plan sélectionné avant confirmation */

function nxBuildSubScreen(){
  if(document.getElementById('nxSub')) return;
  var d = document.createElement('div');
  d.id = 'nxSub';
  d.className = 'nxsub';
  d.innerHTML =
    '<div class="nxsub-in">'+
      '<div class="nxsub-logo">'+
        '<div class="logo-ic"><div></div><div></div><div></div><div></div></div>'+
        '<span class="logo-txt"><span class="net">NET</span><span class="luxe">LUXE</span></span>'+
      '</div>'+
      '<h1 class="nxsub-t" id="nxsubTitle">Choisissez votre formule</h1>'+
      '<p class="nxsub-d" id="nxsubDesc">Changez ou annulez à tout moment</p>'+
      '<div class="nxsub-grid" id="nxsubGrid"></div>'+
      '<div class="nxsub-note" id="nxsubNote"></div>'+
      '<div class="nxsub-act">'+
        '<button class="btn btn-p btn-lg" id="nxsubGo" onclick="nxSubConfirm()">Continuer</button>'+
        '<button class="nxsub-later" onclick="nxSubSkip()">Plus tard</button>'+
      '</div>'+
    '</div>';
  document.body.appendChild(d);
}

/* ---------- AFFICHAGE ---------- */
function nxShowSubscribe(){
  nxBuildSubScreen();
  /* masquer tous les autres écrans */
  ['authScreen','createProfile','codeAccess','splash','app'].forEach(function(id){
    var e = document.getElementById(id);
    if(e){ e.style.display = 'none'; e.classList.add('hidden'); }
  });
  var sel = document.getElementById('nxSelect');
  if(sel) sel.classList.remove('on');

  /* présélectionner le plan actuel, sinon le recommandé */
  var cur = nxCurrentPlan();
  NXSUB_SEL = cur ? cur.id : 'essentiel';

  nxSubRender();
  document.getElementById('nxSub').classList.add('on');
  document.body.style.overflow = '';
  window.scrollTo(0, 0);
}

function nxHideSubscribe(){
  var e = document.getElementById('nxSub');
  if(e) e.classList.remove('on');
}

function nxSubRender(){
  var g = document.getElementById('nxsubGrid');
  if(!g) return;

  var cur = nxCurrentPlan();
  var sub = nxSub();
  var h = '';

  for(var i=0;i<NX_PLANS.length;i++){
    var p = NX_PLANS[i];
    var isCur = cur && cur.id === p.id;
    var isSel = NXSUB_SEL === p.id;

    h += '<div class="nxsub-card' + (isSel ? ' sel' : '') + (p.recommended ? ' reco' : '') + '" '+
         'onclick="nxSubPick(\'' + p.id + '\')" role="button" tabindex="0" '+
         'style="--pc:' + p.color + '">'+
      (p.badge ? '<span class="nxsub-badge">' + p.badge + '</span>' : '')+
      (isCur ? '<span class="nxsub-cur">FORMULE ACTUELLE</span>' : '')+
      '<div class="nxsub-name">' + p.name + '</div>'+
      '<div class="nxsub-tag">' + nxSubEsc(p.tagline) + '</div>'+
      '<div class="nxsub-price">' + (p.price === 0 ? 'Gratuit' :
        '<span class="amt">' + p.price.toFixed(2) + '</span><span class="cur"> ' + p.currency + '</span>'+
        '<span class="per">/' + p.period + '</span>') + '</div>'+
      '<div class="nxsub-q">' + p.quality + ' · ' + p.screens + ' écran' + (p.screens > 1 ? 's' : '') + '</div>'+
      '<ul class="nxsub-feat">';
    for(var f=0;f<p.features.length;f++){
      h += '<li>' + nxSubEsc(p.features[f]) + '</li>';
    }
    for(var l=0;l<p.limits.length;l++){
      h += '<li class="no">' + nxSubEsc(p.limits[l]) + '</li>';
    }
    h += '</ul>'+
      '<div class="nxsub-ck">' + (isSel ? '✓ Sélectionné' : 'Choisir') + '</div>'+
    '</div>';
  }
  g.innerHTML = h;

  /* bouton et note contextuels */
  var btn = document.getElementById('nxsubGo');
  var note = document.getElementById('nxsubNote');
  var sel = nxPlan(NXSUB_SEL);

  if(btn && sel){
    if(cur && cur.id === sel.id){
      btn.textContent = 'Continuer avec ' + sel.name;
    } else if(cur){
      btn.textContent = 'Passer à ' + sel.name;
    } else {
      btn.textContent = sel.price === 0
        ? 'Commencer gratuitement'
        : 'S\'abonner — ' + sel.price.toFixed(2) + ' ' + sel.currency + '/mois';
    }
  }

  if(note){
    var txt = '';
    if(sub && sub.status === 'cancelling'){
      txt = '⚠️ Votre abonnement se termine le ' + nxFmtDate(sub.renewsAt) + '. '+
            '<button class="nxsub-link" onclick="nxSubReactivate()">Réactiver</button>';
    } else if(sub && sub.renewsAt && sub.price > 0){
      txt = 'Prochain renouvellement le ' + nxFmtDate(sub.renewsAt) + '.';
    }
    /* mention légale honnête */
    txt += (txt ? '<br>' : '') +
      '<span class="nxsub-demo">Version de démonstration : aucun paiement réel n\'est traité '+
      'et aucune donnée bancaire n\'est demandée ni stockée.</span>';
    note.innerHTML = txt;
  }
}

function nxSubPick(id){
  NXSUB_SEL = id;
  nxSubRender();
}

/* ---------- CONFIRMATION ---------- */
function nxSubConfirm(){
  var p = nxPlan(NXSUB_SEL);
  if(!p){ if(typeof showToast === 'function') showToast('Sélectionnez une formule'); return; }

  var cur = nxCurrentPlan();
  var ok;
  if(cur && cur.id === p.id) ok = true;                 /* déjà sur ce plan */
  else if(cur) ok = nxChangePlan(p.id);
  else ok = nxSubscribe(p.id);

  if(!ok){ if(typeof showToast === 'function') showToast('Erreur lors de l\'enregistrement'); return; }

  if(typeof showToast === 'function'){
    showToast(cur && cur.id === p.id
      ? 'Formule ' + p.name
      : '✓ Formule ' + p.name + ' activée');
  }

  nxHideSubscribe();
  /* étape suivante : sélection des profils */
  if(typeof nxAfterSubscribe === 'function') nxAfterSubscribe();
}

/* Passer l'étape : on attribue la formule gratuite */
function nxSubSkip(){
  if(!nxHasSub()) nxSubscribe('decouverte');
  if(typeof showToast === 'function') showToast('Formule Découverte activée');
  nxHideSubscribe();
  if(typeof nxAfterSubscribe === 'function') nxAfterSubscribe();
}

function nxSubReactivate(){
  if(nxResumeSub()){
    if(typeof showToast === 'function') showToast('Abonnement réactivé');
    nxSubRender();
  }
}

/* ---------- ACTIONS DEPUIS LES PARAMÈTRES ---------- */
/* Résiliation avec confirmation : action importante. */
function nxSettingsCancel(){
  var s = nxSub();
  if(!s) return;
  var msg = 'Résilier votre abonnement ' + s.planName + ' ?\n\n' +
            'Vous conservez l\'accès jusqu\'au ' + nxFmtDate(s.renewsAt) + '.\n' +
            'Aucun nouveau prélèvement ne sera effectué.';
  if(!confirm(msg)) return;
  if(nxCancelSub()){
    if(typeof showToast === 'function') showToast('Résiliation enregistrée — accès jusqu\'au ' + nxFmtDate(s.renewsAt));
    if(typeof renderSettings === 'function') renderSettings();
  }
}

function nxSettingsResume(){
  if(nxResumeSub()){
    if(typeof showToast === 'function') showToast('✓ Abonnement réactivé');
    if(typeof renderSettings === 'function') renderSettings();
  }
}

/* ---------- GESTION DEPUIS LES PARAMÈTRES ---------- */
function nxOpenSubSettings(){
  nxBuildSubScreen();
  var t = document.getElementById('nxsubTitle');
  var d = document.getElementById('nxsubDesc');
  if(t) t.textContent = 'Votre abonnement';
  if(d) d.textContent = 'Changez de formule ou résiliez';
  nxShowSubscribe();
  /* retour vers l'app, pas vers les profils */
  NXSUB_FROM = 'settings';
}

var NXSUB_FROM = 'login';

/* Après confirmation : où va-t-on ? */
function nxAfterSubscribe(){
  if(NXSUB_FROM === 'settings'){
    NXSUB_FROM = 'login';
    var a = document.getElementById('app');
    if(a){ a.style.display = 'block'; a.classList.remove('hidden'); }
    if(typeof goPage === 'function') goPage('settings');
    return;
  }
  /* flux normal : passer aux profils */
  if(typeof nxGoProfiles === 'function') nxGoProfiles();
  else if(typeof nxShowProfileSelect === 'function') nxShowProfileSelect();
}
