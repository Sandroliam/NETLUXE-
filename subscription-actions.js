/* ============================================
   NETLUXE — Transitions d'abonnement

   RÈGLE : seul nxWebhookActivate() peut passer un
   abonnement en ACTIVE, et il exige une preuve de
   confirmation prestataire. Aucun bouton de l'interface
   n'y a accès directement.
   ============================================ */

/* Calcule la date d'expiration selon la périodicité */
function nxComputeExpiry(billing, from){
  var d = from ? new Date(from) : new Date();
  var months = (billing === 'annual') ? 12 : 1;
  d.setMonth(d.getMonth() + months);
  return d.toISOString();
}

/* ---------- 1. SOUSCRIPTION GRATUITE ---------- */
/* Un forfait sans paiement peut être activé directement :
   il n'y a aucune transaction à confirmer. */
function nxActivateFreePlan(planId){
  var p = nxPlan(planId);
  if(!p) return { ok:false, message:'Forfait inconnu' };
  if(p.requiresPayment) return { ok:false, message:'Ce forfait exige un paiement' };
  if(!nxUid()) return { ok:false, message:'Aucun compte connecté' };

  var now = new Date().toISOString();
  var rec = {
    userId: nxUid(),
    planId: p.id,
    planName: p.name,
    billing: 'monthly',
    amount: 0,
    currency: p.currency || 'USD',
    status: NX_SUB_STATUS.ACTIVE,
    startedAt: now,
    expiresAt: null,          /* gratuit : pas d'échéance */
    autoRenew: false,
    graceUntil: null,
    provider: null,
    providerSubId: null,
    paymentStatus: 'NOT_REQUIRED',
    history: [{ at:now, action:'activation forfait gratuit', plan:p.name }]
  };
  if(!nxWriteSub(rec)) return { ok:false, message:'Échec d\'enregistrement' };

  nxLogTx({ planId:p.id, planName:p.name, amount:0, currency:p.currency,
            status:'NOT_REQUIRED', note:'Forfait gratuit — aucun paiement' });

  return { ok:true, status:NX_SUB_STATUS.ACTIVE, plan:p };
}

/* ---------- 2. DEMANDE D'ABONNEMENT PAYANT ---------- */
/* Ne crée PAS d'abonnement actif. Enregistre une intention
   en PENDING_PAYMENT et interroge la passerelle. */
function nxRequestSubscription(planId, billing){
  var p = nxPlan(planId);
  if(!p) return { ok:false, code:'UNKNOWN_PLAN', message:'Forfait inconnu' };
  if(p.active === false) return { ok:false, code:'PLAN_INACTIVE', message:'Ce forfait n\'est pas disponible' };
  if(!nxUid()) return { ok:false, code:'NO_ACCOUNT', message:'Aucun compte connecté' };

  /* forfait gratuit : chemin direct */
  if(!p.requiresPayment){
    var free = nxActivateFreePlan(planId);
    return { ok:free.ok, code:free.ok ? 'ACTIVATED_FREE' : 'ERROR',
             message:free.ok ? 'Forfait ' + p.name + ' activé' : free.message, plan:p };
  }

  var bill = (billing === 'annual') ? 'annual' : 'monthly';
  var amount = nxPlanPrice(p, bill);

  /* la passerelle est-elle opérationnelle ? */
  var intent = nxCreatePaymentIntent(p.id, bill);

  if(!intent.ok && intent.code === NX_PAY_RESULT.GATEWAY_DISABLED){
    /* On journalise la demande pour ne rien perdre, mais AUCUN accès n'est ouvert. */
    nxLogTx({
      planId:p.id, planName:p.name, billing:bill, amount:amount,
      currency:p.currency, status:'GATEWAY_DISABLED',
      note:'Demande enregistrée — paiement en cours d\'activation'
    });
    return {
      ok:false,
      code:NX_PAY_RESULT.GATEWAY_DISABLED,
      message:intent.message,
      missing:intent.missing,
      plan:p, billing:bill, amount:amount
    };
  }

  /* passerelle active : on inscrit l'attente de confirmation */
  var now = new Date().toISOString();
  var prev = nxSubRecord();
  var rec = {
    userId: nxUid(),
    planId: p.id,
    planName: p.name,
    billing: bill,
    amount: amount,
    currency: p.currency || 'USD',
    status: NX_SUB_STATUS.PENDING_PAYMENT,
    startedAt: prev && prev.startedAt ? prev.startedAt : now,
    expiresAt: prev && prev.expiresAt ? prev.expiresAt : null,
    autoRenew: true,
    graceUntil: null,
    provider: nxPayConfig().activeProvider,
    providerSubId: null,
    paymentStatus: 'PENDING',
    pendingIntentId: intent.intentId || null,
    history: (prev && prev.history ? prev.history : []).concat([
      { at:now, action:'demande d\'abonnement', plan:p.name, billing:bill }
    ])
  };
  nxWriteSub(rec);
  nxLogTx({ planId:p.id, planName:p.name, billing:bill, amount:amount,
            currency:p.currency, status:'PENDING',
            provider:rec.provider, providerRef:intent.intentId || null,
            note:'En attente de confirmation du prestataire' });

  return { ok:true, code:NX_PAY_RESULT.PENDING, message:'Paiement en attente de confirmation',
           clientSecret:intent.clientSecret || null, plan:p, billing:bill, amount:amount };
}

/* ---------- 3. WEBHOOK : seul chemin vers ACTIVE ---------- */
/* `proof` doit contenir la référence prestataire et la signature
   vérifiée côté serveur. Sans preuve, refus. */
function nxWebhookActivate(proof){
  if(!proof || !proof.providerRef || !proof.signatureVerified){
    return { ok:false, message:'Preuve de paiement absente ou non vérifiée — activation refusée' };
  }
  var r = nxSubRecord();
  if(!r) return { ok:false, message:'Aucun abonnement en attente' };

  var now = new Date().toISOString();
  r.status = NX_SUB_STATUS.ACTIVE;
  r.paymentStatus = 'PAID';
  r.provider = proof.provider || r.provider;
  r.providerSubId = proof.providerSubId || r.providerSubId;
  r.expiresAt = nxComputeExpiry(r.billing, proof.paidAt || now);
  r.graceUntil = null;
  r.autoRenew = true;
  r.history = r.history || [];
  r.history.unshift({ at:now, action:'paiement confirmé (webhook)',
                      plan:r.planName, ref:proof.providerRef });
  nxWriteSub(r);

  nxLogTx({ planId:r.planId, planName:r.planName, billing:r.billing,
            amount:r.amount, currency:r.currency, status:'SUCCEEDED',
            provider:r.provider, providerRef:proof.providerRef,
            method:proof.method || null, invoiceUrl:proof.invoiceUrl || null,
            note:'Confirmé par le prestataire' });

  return { ok:true, status:NX_SUB_STATUS.ACTIVE, expiresAt:r.expiresAt };
}

/* Échec de paiement — ouvre la période de grâce */
function nxWebhookPaymentFailed(proof){
  var r = nxSubRecord();
  if(!r) return { ok:false, message:'Aucun abonnement' };
  var now = new Date();
  var grace = new Date(now);
  grace.setDate(grace.getDate() + NX_GRACE_DAYS);

  r.status = NX_SUB_STATUS.PAYMENT_FAILED;
  r.paymentStatus = 'FAILED';
  r.graceUntil = grace.toISOString();
  r.history = r.history || [];
  r.history.unshift({ at:now.toISOString(), action:'échec de paiement',
                      plan:r.planName, ref:(proof && proof.providerRef) || null });
  nxWriteSub(r);

  nxLogTx({ planId:r.planId, planName:r.planName, amount:r.amount,
            currency:r.currency, status:'FAILED',
            provider:r.provider, providerRef:(proof && proof.providerRef) || null,
            note:'Échec — période de grâce jusqu\'au ' + nxFmtDate(r.graceUntil) });

  return { ok:true, status:NX_SUB_STATUS.PAYMENT_FAILED, graceUntil:r.graceUntil };
}

/* Renouvellement réussi — prolonge la période */
function nxWebhookRenewed(proof){
  if(!proof || !proof.signatureVerified){
    return { ok:false, message:'Preuve non vérifiée — renouvellement refusé' };
  }
  var r = nxSubRecord();
  if(!r) return { ok:false, message:'Aucun abonnement' };
  var now = new Date().toISOString();
  var base = (r.expiresAt && new Date(r.expiresAt) > new Date()) ? r.expiresAt : now;

  r.status = NX_SUB_STATUS.ACTIVE;
  r.paymentStatus = 'PAID';
  r.graceUntil = null;
  r.expiresAt = nxComputeExpiry(r.billing, base);
  r.history = r.history || [];
  r.history.unshift({ at:now, action:'renouvellement', plan:r.planName,
                      ref:proof.providerRef || null });
  nxWriteSub(r);

  nxLogTx({ planId:r.planId, planName:r.planName, billing:r.billing,
            amount:r.amount, currency:r.currency, status:'SUCCEEDED',
            provider:r.provider, providerRef:proof.providerRef || null,
            invoiceUrl:proof.invoiceUrl || null, note:'Renouvellement confirmé' });

  return { ok:true, expiresAt:r.expiresAt };
}

/* Remboursement / révocation — coupe l'accès */
function nxWebhookRevoked(proof){
  var r = nxSubRecord();
  if(!r) return { ok:false, message:'Aucun abonnement' };
  var now = new Date().toISOString();
  r.status = NX_SUB_STATUS.INACTIVE;
  r.paymentStatus = 'REFUNDED';
  r.expiresAt = now;
  r.autoRenew = false;
  r.history = r.history || [];
  r.history.unshift({ at:now, action:'accès révoqué (remboursement)', plan:r.planName });
  nxWriteSub(r);
  nxLogTx({ planId:r.planId, planName:r.planName, amount:r.amount,
            currency:r.currency, status:'REFUNDED',
            providerRef:(proof && proof.providerRef) || null, note:'Remboursement' });
  return { ok:true, status:NX_SUB_STATUS.INACTIVE };
}

/* ---------- 4. RÉSILIATION ---------- */
/* Accès conservé jusqu'à l'échéance déjà payée. */
function nxCancelSubscription(){
  var r = nxSubRecord();
  if(!r) return { ok:false, message:'Aucun abonnement' };
  var st = nxSubStatus();
  if(st === NX_SUB_STATUS.INACTIVE || st === NX_SUB_STATUS.EXPIRED){
    return { ok:false, message:'Aucun abonnement actif à résilier' };
  }
  var now = new Date().toISOString();
  r.status = NX_SUB_STATUS.CANCELED;
  r.autoRenew = false;
  r.canceledAt = now;
  r.history = r.history || [];
  r.history.unshift({ at:now, action:'résiliation demandée', plan:r.planName });
  nxWriteSub(r);
  nxLogTx({ planId:r.planId, planName:r.planName, status:'CANCELED',
            note:'Résiliation — accès jusqu\'au ' + (r.expiresAt ? nxFmtDate(r.expiresAt) : 'fin de période') });
  return { ok:true, status:NX_SUB_STATUS.CANCELED, expiresAt:r.expiresAt };
}

/* Reprise avant expiration */
function nxResumeSubscription(){
  var r = nxSubRecord();
  if(!r) return { ok:false, message:'Aucun abonnement' };
  if(nxSubStatus() !== NX_SUB_STATUS.CANCELED){
    return { ok:false, message:'Aucune résiliation en cours' };
  }
  var now = new Date().toISOString();
  r.status = NX_SUB_STATUS.ACTIVE;
  r.autoRenew = true;
  r.canceledAt = null;
  r.history = r.history || [];
  r.history.unshift({ at:now, action:'reprise de l\'abonnement', plan:r.planName });
  nxWriteSub(r);
  nxLogTx({ planId:r.planId, planName:r.planName, status:'RESUMED', note:'Abonnement repris' });
  return { ok:true, status:NX_SUB_STATUS.ACTIVE };
}

/* ---------- 5. CHANGEMENT DE FORFAIT ---------- */
function nxChangeSubscription(planId, billing){
  var p = nxPlan(planId);
  if(!p) return { ok:false, message:'Forfait inconnu' };
  var cur = nxSubRecord();

  /* vers un forfait gratuit : immédiat */
  if(!p.requiresPayment) return nxActivateFreePlan(planId);

  /* vers un forfait payant : repasse par la demande de paiement */
  if(cur){
    cur.history = cur.history || [];
    cur.history.unshift({ at:new Date().toISOString(),
      action:'changement de forfait demandé', from:cur.planName, plan:p.name });
    nxWriteSub(cur);
  }
  return nxRequestSubscription(planId, billing);
}
