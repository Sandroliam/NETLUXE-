/* ============================================
   NETLUXE — Écran d'abonnement (interface)

   Aucun bouton ne simule un paiement réussi. Quand la
   passerelle est désactivée, l'utilisateur voit un message
   clair et la transaction est bloquée.
   ============================================ */

function nxSubEsc(s){
  return String(s == null ? '' : s).replace(/[&<>"']/g, function(m){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];
  });
}

var NXSUB = { planId:null, billing:'monthly', from:'login', step:'plans' };

/* ---------- CONSTRUCTION ---------- */
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
      '<div id="nxsubBody"></div>'+
    '</div>';
  document.body.appendChild(d);
}

/* ---------- AFFICHAGE ---------- */
function nxShowSubscribe(from){
  nxBuildSubScreen();
  NXSUB.from = from || 'login';
  NXSUB.step = 'plans';
  var cur = nxCurrentPlan();
  NXSUB.planId = cur ? cur.id : null;

  ['authScreen','createProfile','codeAccess','splash','app'].forEach(function(id){
    var e = document.getElementById(id);
    if(e){ e.style.display = 'none'; e.classList.add('hidden'); }
  });
  var sel = document.getElementById('nxSelect');
  if(sel) sel.classList.remove('on');

  nxSubRender();
  document.getElementById('nxSub').classList.add('on');
  document.body.style.overflow = '';
  window.scrollTo(0,0);
}

function nxHideSubscribe(){
  var e = document.getElementById('nxSub');
  if(e) e.classList.remove('on');
}

/* ---------- RENDU PRINCIPAL ---------- */
function nxSubRender(){
  var box = document.getElementById('nxsubBody');
  if(!box) return;
  if(NXSUB.step === 'confirm'){ box.innerHTML = nxSubConfirmView(); return; }
  if(NXSUB.step === 'blocked'){ box.innerHTML = nxSubBlockedView(); return; }
  box.innerHTML = nxSubPlansView();
}

/* ---------- VUE 1 : LES FORFAITS ---------- */
function nxSubPlansView(){
  var plans = nxPublicPlans();
  var st = nxPayStatus();
  var cur = nxCurrentPlan();
  var subSt = nxSubStatus();

  var h = '<h1 class="nxsub-t">Choisissez votre forfait</h1>'+
          '<p class="nxsub-d">Changez ou résiliez à tout moment</p>';

  /* bandeau d'état du paiement — visible et honnête */
  if(!st.enabled){
    h += '<div class="nxsub-alert">'+
         '<div class="ic">🔧</div>'+
         '<div class="tx"><b>Les abonnements seront bientôt disponibles.</b>'+
         '<span>Le système de paiement est actuellement en cours d\'activation.</span></div>'+
         '</div>';
  }

  /* bascule mensuel / annuel */
  var save = 0;
  for(var s=0;s<plans.length;s++){
    var sv = nxAnnualSaving(plans[s]);
    if(sv > save) save = sv;
  }
  h += '<div class="nxsub-toggle">'+
    '<button class="'+(NXSUB.billing==='monthly'?'on':'')+'" onclick="nxSubBilling(\'monthly\')">Mensuel</button>'+
    '<button class="'+(NXSUB.billing==='annual'?'on':'')+'" onclick="nxSubBilling(\'annual\')">Annuel'+
    (save ? '<span class="save">−'+save+'%</span>' : '')+'</button>'+
    '</div>';

  h += '<div class="nxsub-grid">';
  for(var i=0;i<plans.length;i++){
    var p = plans[i];
    var isCur = cur && cur.id === p.id && subSt !== NX_SUB_STATUS.INACTIVE;
    var isSel = NXSUB.planId === p.id;
    var price = nxPlanPrice(p, NXSUB.billing);
    var per = (NXSUB.billing === 'annual') ? 'an' : 'mois';

    h += '<div class="nxsub-card'+(isSel?' sel':'')+(p.recommended?' reco':'')+'" '+
         'onclick="nxSubPick(\''+p.id+'\')" role="button" tabindex="0" style="--pc:'+p.color+'">'+
      (p.badge ? '<span class="nxsub-badge">'+p.badge+'</span>' : '')+
      (isCur ? '<span class="nxsub-cur">FORFAIT ACTUEL</span>' : '')+
      '<div class="nxsub-name">'+nxSubEsc(p.name)+'</div>'+
      '<div class="nxsub-tag">'+nxSubEsc(p.tagline||'')+'</div>'+
      '<div class="nxsub-price">'+
        (price === 0 ? '<span class="amt">Gratuit</span>'
          : '<span class="amt">'+price.toFixed(2)+'</span><span class="cur"> '+
            (p.currency||'USD')+'</span><span class="per">/'+per+'</span>')+
      '</div>'+
      '<div class="nxsub-q">'+nxSubEsc(p.quality||'')+' · '+(p.screens||1)+' écran'+((p.screens||1)>1?'s':'')+'</div>'+
      '<ul class="nxsub-feat">';
    var fs = p.features || [];
    for(var f=0;f<fs.length;f++) h += '<li>'+nxSubEsc(fs[f])+'</li>';
    var ls = p.limits || [];
    for(var l=0;l<ls.length;l++) h += '<li class="no">'+nxSubEsc(ls[l])+'</li>';
    h += '</ul>'+
      '<div class="nxsub-ck">'+(isSel ? '✓ Sélectionné' : 'Choisir')+'</div>'+
    '</div>';
  }
  h += '</div>';

  /* bouton principal — libellé fidèle à ce qui va réellement se passer */
  var sel = NXSUB.planId ? nxPlan(NXSUB.planId) : null;
  h += '<div class="nxsub-act">';
  if(sel){
    if(!sel.requiresPayment){
      h += '<button class="btn btn-p btn-lg" onclick="nxSubProceed()">Activer '+nxSubEsc(sel.name)+'</button>';
    } else if(!st.enabled){
      h += '<button class="btn btn-p btn-lg" onclick="nxSubProceed()">Continuer</button>'+
           '<span class="nxsub-hint">Le paiement n\'est pas encore actif — vous serez informé de l\'ouverture</span>';
    } else {
      h += '<button class="btn btn-p btn-lg" onclick="nxSubProceed()">Continuer vers le paiement</button>';
    }
  } else {
    h += '<button class="btn btn-p btn-lg" disabled>Sélectionnez un forfait</button>';
  }
  if(NXSUB.from === 'login'){
    h += '<button class="nxsub-later" onclick="nxSubSkip()">Continuer avec le forfait gratuit</button>';
  } else {
    h += '<button class="nxsub-later" onclick="nxSubBack()">Retour</button>';
  }
  h += '</div>';

  h += '<div class="nxsub-legal">Aucune donnée bancaire n\'est demandée ni stockée par NETLUXE. '+
       'Le traitement des paiements sera assuré par un prestataire certifié.</div>';
  return h;
}

function nxSubBilling(b){ NXSUB.billing = b; nxSubRender(); }
function nxSubPick(id){ NXSUB.planId = id; nxSubRender(); }

/* ---------- VUE 2 : CONFIRMATION ---------- */
function nxSubConfirmView(){
  var p = nxPlan(NXSUB.planId);
  if(!p) return nxSubPlansView();
  var st = nxPayStatus();
  var price = nxPlanPrice(p, NXSUB.billing);
  var per = (NXSUB.billing === 'annual') ? 'an' : 'mois';
  var methods = nxAvailableMethods();

  var h = '<h1 class="nxsub-t">Confirmez votre abonnement</h1>'+
          '<p class="nxsub-d">Vérifiez les informations avant de poursuivre</p>';

  h += '<div class="nxsub-recap">'+
    '<div class="nxsub-recap-h">'+
      '<span class="nm" style="color:'+p.color+'">'+nxSubEsc(p.name)+'</span>'+
      '<span class="pr">'+price.toFixed(2)+' '+(p.currency||'USD')+' / '+per+'</span>'+
    '</div>'+
    '<div class="nxsub-recap-r"><span>Périodicité</span><span>'+
      (NXSUB.billing === 'annual' ? 'Annuelle' : 'Mensuelle')+'</span></div>'+
    '<div class="nxsub-recap-r"><span>Qualité vidéo</span><span>'+nxSubEsc(p.quality)+'</span></div>'+
    '<div class="nxsub-recap-r"><span>Écrans simultanés</span><span>'+p.screens+'</span></div>'+
    '<div class="nxsub-recap-r"><span>Profils</span><span>'+p.profiles+'</span></div>'+
    '<div class="nxsub-recap-r"><span>Renouvellement</span><span>'+
      (NXSUB.billing === 'annual' ? 'Automatique chaque année' : 'Automatique chaque mois')+'</span></div>'+
    '<div class="nxsub-recap-r tot"><span>Total à payer</span><span>'+
      price.toFixed(2)+' '+(p.currency||'USD')+'</span></div>'+
  '</div>';

  /* moyens de paiement réellement disponibles */
  h += '<div class="nxsub-methods"><div class="lb">Moyens de paiement</div>';
  if(methods.length){
    h += '<div class="ms">';
    for(var m=0;m<methods.length;m++){
      h += '<span class="mtd">'+(NX_METHOD_LABELS[methods[m]] || methods[m])+'</span>';
    }
    h += '</div>';
  } else {
    h += '<div class="ms none">Aucun moyen de paiement activé pour le moment</div>';
  }
  h += '</div>';

  if(!st.enabled){
    h += '<div class="nxsub-alert"><div class="ic">🔧</div><div class="tx">'+
         '<b>Paiement en cours d\'activation</b>'+
         '<span>Votre demande sera enregistrée. Aucun montant ne sera prélevé et '+
         'l\'abonnement ne sera pas activé tant que le paiement n\'est pas opérationnel.</span>'+
         '</div></div>';
  }

  h += '<div class="nxsub-act">'+
    '<button class="btn btn-p btn-lg" onclick="nxSubSubmit()">'+
      (st.enabled ? 'Payer '+price.toFixed(2)+' '+(p.currency||'USD') : 'Enregistrer ma demande')+
    '</button>'+
    '<button class="nxsub-later" onclick="nxSubStep(\'plans\')">Modifier le forfait</button>'+
  '</div>';
  return h;
}

/* ---------- VUE 3 : TRANSACTION BLOQUÉE ---------- */
function nxSubBlockedView(){
  var st = nxPayStatus();
  var p = nxPlan(NXSUB.planId);
  var h = '<div class="nxsub-block">'+
    '<div class="ic">⏳</div>'+
    '<h1 class="nxsub-t">Demande enregistrée</h1>'+
    '<p class="nxsub-bd">Les abonnements seront bientôt disponibles. Le système de paiement '+
    'est actuellement en cours d\'activation.</p>'+
    (p ? '<div class="nxsub-chip">Forfait souhaité : <b>'+nxSubEsc(p.name)+'</b></div>' : '')+
    '<div class="nxsub-why">'+
      '<div class="wh">Ce qui reste à activer</div><ul>';
  for(var i=0;i<st.missing.length;i++) h += '<li>'+nxSubEsc(st.missing[i])+'</li>';
  h += '</ul></div>'+
    '<p class="nxsub-bd sm">Aucun montant n\'a été prélevé. Votre abonnement n\'est '+
    '<b>pas</b> actif. Vous conservez l\'accès au catalogue gratuit.</p>'+
    '<div class="nxsub-act">'+
      '<button class="btn btn-p btn-lg" onclick="nxSubUseFree()">Continuer avec le forfait gratuit</button>'+
      '<button class="nxsub-later" onclick="nxSubStep(\'plans\')">Voir les forfaits</button>'+
    '</div>'+
  '</div>';
  return h;
}

function nxSubStep(s){ NXSUB.step = s; nxSubRender(); window.scrollTo(0,0); }

/* ---------- ENCHAÎNEMENT ---------- */
function nxSubProceed(){
  var p = nxPlan(NXSUB.planId);
  if(!p){ if(typeof showToast === 'function') showToast('Sélectionnez un forfait'); return; }

  /* gratuit : activation directe, il n'y a rien à payer */
  if(!p.requiresPayment){
    var r = nxActivateFreePlan(p.id);
    if(r.ok){
      if(typeof showToast === 'function') showToast('Forfait ' + p.name + ' activé');
      nxSubDone();
    } else if(typeof showToast === 'function') showToast(r.message);
    return;
  }
  nxSubStep('confirm');
}

/* Soumission — c'est ici qu'on refuse proprement si le paiement est inactif */
function nxSubSubmit(){
  var p = nxPlan(NXSUB.planId);
  if(!p) return;

  var res = nxRequestSubscription(p.id, NXSUB.billing);

  if(!res.ok && res.code === NX_PAY_RESULT.GATEWAY_DISABLED){
    /* AUCUN faux succès : on affiche l'état réel */
    nxSubStep('blocked');
    return;
  }
  if(!res.ok){
    if(typeof showToast === 'function') showToast(res.message || 'Impossible de poursuivre');
    return;
  }
  /* passerelle active : le paiement reste en attente de confirmation prestataire */
  if(typeof showToast === 'function'){
    showToast('Paiement en attente de confirmation — votre abonnement sera activé après validation');
  }
  nxSubStep('blocked');
}

/* Forfait gratuit et on avance */
function nxSubUseFree(){
  var pub = nxPublicPlans(), free = null;
  for(var i=0;i<pub.length;i++){ if(!pub[i].requiresPayment){ free = pub[i]; break; } }
  if(free){
    var r = nxActivateFreePlan(free.id);
    if(r.ok && typeof showToast === 'function') showToast('Forfait ' + free.name + ' activé');
  }
  nxSubDone();
}

function nxSubSkip(){ nxSubUseFree(); }
function nxSubBack(){ nxSubDone(); }

/* Sortie de l'écran d'abonnement */
function nxSubDone(){
  nxHideSubscribe();
  if(NXSUB.from === 'settings'){
    var a = document.getElementById('app');
    if(a){ a.style.display = 'block'; a.classList.remove('hidden'); }
    if(typeof goPage === 'function') goPage('settings');
    return;
  }
  if(typeof nxGoProfiles === 'function') nxGoProfiles();
  else if(typeof nxShowProfileSelect === 'function') nxShowProfileSelect();
}

/* Depuis les Paramètres */
function nxOpenSubSettings(){ nxShowSubscribe('settings'); }
