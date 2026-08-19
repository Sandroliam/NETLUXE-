/* ============================================
   NETLUXE — Barrière premium
   Affichée quand un contenu exige un forfait que
   l'utilisateur n'a pas. Explique le statut réel.
   ============================================ */

function nxGateEsc(s){
  return String(s == null ? '' : s).replace(/[&<>"']/g, function(m){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];
  });
}

function nxBuildGate(){
  if(document.getElementById('nxGate')) return;
  var d = document.createElement('div');
  d.id = 'nxGate';
  d.className = 'nxgate';
  d.innerHTML = '<div class="nxgate-box" id="nxgateBox"></div>';
  document.body.appendChild(d);
  d.addEventListener('click', function(e){ if(e.target === d) nxCloseGate(); });
}

function nxShowPremiumGate(item){
  nxBuildGate();
  var st = nxSubStatus();
  var lbl = NX_SUB_LABELS[st] || NX_SUB_LABELS.INACTIVE;
  var rec = nxSubRecord();

  /* raison précise du blocage */
  var reason, action;
  if(st === NX_SUB_STATUS.INACTIVE){
    reason = 'Ce titre fait partie des NETLUXE Originals. Un forfait premium est nécessaire.';
    action = 'Voir les forfaits';
  } else if(st === NX_SUB_STATUS.PENDING_PAYMENT){
    reason = 'Votre abonnement est en attente de confirmation du paiement. '+
             'L\'accès sera ouvert dès validation par le prestataire.';
    action = 'Voir mon abonnement';
  } else if(st === NX_SUB_STATUS.EXPIRED){
    reason = 'Votre abonnement a expiré' +
             (rec && rec.expiresAt ? ' le ' + nxFmtDate(rec.expiresAt) : '') + '.';
    action = 'Renouveler';
  } else if(!nxPlanGivesPremium()){
    reason = 'Votre forfait ' + ((rec && rec.planName) || 'actuel') +
             ' ne comprend pas les NETLUXE Originals.';
    action = 'Changer de forfait';
  } else {
    reason = 'Accès premium indisponible pour le moment.';
    action = 'Voir mon abonnement';
  }

  var box = document.getElementById('nxgateBox');
  box.innerHTML =
    '<button class="nxgate-x" onclick="nxCloseGate()" aria-label="Fermer">✕</button>'+
    '<div class="nxgate-ic">⭐</div>'+
    '<div class="nxgate-t">Contenu NETLUXE Original</div>'+
    (item ? '<div class="nxgate-ti">'+nxGateEsc(item.title)+'</div>' : '')+
    '<div class="nxgate-st"><span class="nxms-st '+lbl.cls+'">'+lbl.txt+'</span></div>'+
    '<p class="nxgate-r">'+nxGateEsc(reason)+'</p>'+
    '<div class="nxgate-act">'+
      '<button class="btn btn-p" onclick="nxGateGoPlans()">'+action+'</button>'+
      '<button class="btn btn-o" onclick="nxCloseGate()">Plus tard</button>'+
    '</div>'+
    '<div class="nxgate-free">Le catalogue du domaine public reste accessible sans abonnement.</div>';

  document.getElementById('nxGate').classList.add('on');
}

function nxCloseGate(){
  var e = document.getElementById('nxGate');
  if(e) e.classList.remove('on');
}

function nxGateGoPlans(){
  nxCloseGate();
  /* fermer les modales ouvertes */
  var dm = document.getElementById('detailModal');
  if(dm) dm.classList.remove('active');
  if(typeof nxShowSubscribe === 'function') nxShowSubscribe('settings');
}

/* ---------- MARQUAGE VISUEL DES CONTENUS VERROUILLÉS ---------- */
/* Un cadenas sur les cartes évite de cliquer pour rien. */
function nxIsLocked(c){
  if(!c) return false;
  if(typeof nxCanWatch !== 'function') return false;
  return !nxCanWatch(c);
}
