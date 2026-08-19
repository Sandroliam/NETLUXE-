/* ============================================
   NETLUXE — « Mon abonnement » (Paramètres)
   Forfait, statut réel, prochaine facturation,
   historique des transactions, actions.
   ============================================ */

function nxMySubEsc(s){
  return String(s == null ? '' : s).replace(/[&<>"']/g, function(m){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];
  });
}

/* Libellés des statuts de transaction */
var NX_TX_LABELS = {
  SUCCEEDED:      { txt:'Payé',                  cls:'ok' },
  PENDING:        { txt:'En attente',            cls:'pend' },
  FAILED:         { txt:'Échec',                 cls:'fail' },
  CANCELED:       { txt:'Résiliation',           cls:'canc' },
  REFUNDED:       { txt:'Remboursé',             cls:'canc' },
  RESUMED:        { txt:'Reprise',               cls:'ok' },
  NOT_REQUIRED:   { txt:'Sans paiement',         cls:'free' },
  GATEWAY_DISABLED:{ txt:'Paiement non activé',  cls:'pend' }
};

/* Bloc principal, injecté dans la page Paramètres */
function nxMySubBlock(){
  var st = nxSubStatus();
  var rec = nxSubRecord();
  var plan = nxCurrentPlan();
  var lbl = NX_SUB_LABELS[st] || NX_SUB_LABELS.INACTIVE;
  var pay = nxPayStatus();

  var h = '<div class="settings-sec"><h3>💳 Mon abonnement</h3>';

  /* état du système de paiement */
  if(!pay.enabled){
    h += '<div class="nxms-warn">Système de paiement en cours d\'activation — '+
         'les abonnements payants ne peuvent pas encore être souscrits.</div>';
  }

  if(!rec || st === NX_SUB_STATUS.INACTIVE){
    h += '<div class="nxms-empty">Aucun forfait actif</div>'+
         '<div class="setting-row"><span class="setting-lbl">Découvrir les forfaits</span>'+
         '<button class="btn btn-p" style="padding:7px 14px;font-size:12.5px" '+
         'onclick="nxOpenSubSettings()">Voir les forfaits</button></div></div>';
    return h;
  }

  /* carte du forfait */
  h += '<div class="nxms-card" style="--pc:'+((plan&&plan.color)||'#D4AF37')+'">'+
    '<div class="nxms-h">'+
      '<span class="nxms-n">'+nxMySubEsc(rec.planName||'—')+'</span>'+
      '<span class="nxms-st '+lbl.cls+'">'+lbl.txt+'</span>'+
    '</div>';

  var per = (rec.billing === 'annual') ? 'an' : 'mois';
  h += '<div class="nxms-r"><span>Prix</span><span>'+
       (rec.amount ? rec.amount.toFixed(2)+' '+(rec.currency||'USD')+' / '+per : 'Gratuit')+'</span></div>';

  if(plan){
    h += '<div class="nxms-r"><span>Qualité vidéo</span><span>'+nxMySubEsc(plan.quality)+'</span></div>'+
         '<div class="nxms-r"><span>Écrans simultanés</span><span>'+plan.screens+'</span></div>'+
         '<div class="nxms-r"><span>Profils autorisés</span><span>'+plan.profiles+'</span></div>'+
         '<div class="nxms-r"><span>Téléchargements</span><span>'+
           (plan.downloads < 0 ? 'Illimités' : plan.downloads)+'</span></div>'+
         '<div class="nxms-r"><span>Publicité</span><span>'+(plan.ads?'Oui':'Non')+'</span></div>';
  }

  h += '<div class="nxms-r"><span>Accès premium</span><span>'+
       (nxCanWatchPremium() ? '<b style="color:#22C55E">Autorisé</b>'
                            : '<b style="color:#FF6B35">Bloqué</b>')+'</span></div>';

  h += '<div class="nxms-r"><span>Depuis le</span><span>'+nxFmtDate(rec.startedAt)+'</span></div>';

  /* dates selon le statut réel */
  if(st === NX_SUB_STATUS.ACTIVE && rec.expiresAt){
    var dl = nxDaysLeft(rec.expiresAt);
    h += '<div class="nxms-r"><span>Prochaine facturation</span><span>'+
         nxFmtDate(rec.expiresAt)+(dl !== null ? ' (dans '+dl+' j)' : '')+'</span></div>';
  } else if(st === NX_SUB_STATUS.CANCELED && rec.expiresAt){
    h += '<div class="nxms-r"><span>Fin d\'accès</span><span>'+nxFmtDate(rec.expiresAt)+'</span></div>';
  } else if(st === NX_SUB_STATUS.PAYMENT_FAILED && rec.graceUntil){
    h += '<div class="nxms-r"><span>Période de grâce jusqu\'au</span><span>'+
         nxFmtDate(rec.graceUntil)+'</span></div>';
  } else if(st === NX_SUB_STATUS.PENDING_PAYMENT){
    h += '<div class="nxms-r"><span>Paiement</span><span>En attente de confirmation</span></div>';
  } else if(st === NX_SUB_STATUS.EXPIRED){
    h += '<div class="nxms-r"><span>Expiré le</span><span>'+nxFmtDate(rec.expiresAt)+'</span></div>';
  }

  if(rec.provider){
    h += '<div class="nxms-r"><span>Prestataire</span><span>'+nxMySubEsc(rec.provider)+'</span></div>';
  }
  h += '</div>';

  /* messages contextuels */
  if(st === NX_SUB_STATUS.PENDING_PAYMENT){
    h += '<div class="nxms-warn">Votre abonnement n\'est pas encore actif : '+
         'il sera activé dès confirmation du paiement par le prestataire.</div>';
  }
  if(st === NX_SUB_STATUS.PAYMENT_FAILED){
    h += '<div class="nxms-warn">Le dernier paiement a échoué. Votre accès reste ouvert '+
         'jusqu\'au '+nxFmtDate(rec.graceUntil)+'. Mettez à jour votre moyen de paiement.</div>';
  }
  if(st === NX_SUB_STATUS.EXPIRED){
    h += '<div class="nxms-warn">Votre abonnement a expiré. L\'accès premium est bloqué.</div>';
  }

  /* actions réellement disponibles */
  h += '<div class="setting-row"><span class="setting-lbl">Changer de forfait</span>'+
       '<button class="btn btn-p" style="padding:7px 14px;font-size:12.5px" '+
       'onclick="nxOpenSubSettings()">Voir les forfaits</button></div>';

  if(st === NX_SUB_STATUS.CANCELED){
    h += '<div class="setting-row"><span class="setting-lbl">Reprendre l\'abonnement</span>'+
         '<button class="btn btn-o" style="padding:7px 14px;font-size:12.5px;color:#22C55E" '+
         'onclick="nxMySubResume()">Réactiver</button></div>';
  } else if(st === NX_SUB_STATUS.ACTIVE && rec.amount > 0){
    h += '<div class="setting-row"><span class="setting-lbl">Résilier l\'abonnement</span>'+
         '<button class="btn btn-o" style="padding:7px 14px;font-size:12.5px;color:var(--red)" '+
         'onclick="nxMySubCancel()">Résilier</button></div>';
  }

  /* historique des paiements */
  var tx = nxTxHistory();
  h += '<div class="nxms-hist"><div class="hh">Historique des paiements</div>';
  if(!tx.length){
    h += '<div class="nxms-empty sm">Aucune transaction</div>';
  } else {
    h += '<div class="nxms-tx">';
    for(var i=0;i<tx.length && i<12; i++){
      var t = tx[i];
      var tl = NX_TX_LABELS[t.status] || { txt:t.status, cls:'pend' };
      h += '<div class="nxms-tr">'+
        '<div class="d">'+nxFmtDate(t.createdAt)+'</div>'+
        '<div class="p">'+nxMySubEsc(t.planName||'—')+
          (t.billing ? ' · '+(t.billing==='annual'?'annuel':'mensuel') : '')+'</div>'+
        '<div class="a">'+(t.amount !== null && t.amount > 0
            ? t.amount.toFixed(2)+' '+(t.currency||'USD') : '—')+'</div>'+
        '<div class="s"><span class="tag '+tl.cls+'">'+tl.txt+'</span></div>'+
        '<div class="i">'+(t.invoiceUrl
            ? '<a href="'+t.invoiceUrl+'" target="_blank" rel="noopener">Reçu</a>'
            : '<span class="na">—</span>')+'</div>'+
      '</div>';
    }
    h += '</div>';
    h += '<div class="nxms-note">Les reçus seront émis par le prestataire de paiement '+
         'dès son activation.</div>';
  }
  h += '</div>';

  h += '</div>';
  return h;
}

/* ---------- ACTIONS ---------- */
function nxMySubCancel(){
  var rec = nxSubRecord();
  if(!rec) return;
  var msg = 'Résilier votre abonnement '+rec.planName+' ?\n\n'+
            (rec.expiresAt
              ? 'Vous conservez l\'accès jusqu\'au '+nxFmtDate(rec.expiresAt)+'.\n'
              : '')+
            'Aucun nouveau prélèvement ne sera effectué.';
  if(!confirm(msg)) return;
  var r = nxCancelSubscription();
  if(r.ok){
    if(typeof showToast === 'function'){
      showToast('Résiliation enregistrée'+(r.expiresAt ? ' — accès jusqu\'au '+nxFmtDate(r.expiresAt) : ''));
    }
    if(typeof renderSettings === 'function') renderSettings();
  } else if(typeof showToast === 'function') showToast(r.message);
}

function nxMySubResume(){
  var r = nxResumeSubscription();
  if(r.ok){
    if(typeof showToast === 'function') showToast('Abonnement repris');
    if(typeof renderSettings === 'function') renderSettings();
  } else if(typeof showToast === 'function') showToast(r.message);
}
