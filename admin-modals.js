/* NETLUXE ADMIN — Modales (injectées dynamiquement) */
document.addEventListener('DOMContentLoaded', function(){
  var d = document.createElement('div');
  d.innerHTML = ''+
  /* --- FORM CONTENU --- */
  '<div class="ov" id="ovForm">'+
    '<div class="modal">'+
      '<div class="m-hdr"><div class="m-t" id="mTitle">Ajouter un contenu</div><button class="m-x" onclick="closeForm()">×</button></div>'+
      '<form onsubmit="saveForm(event)">'+
      '<div class="m-b">'+
        '<div class="fg"><label class="fl">Titre *</label><input class="fi" id="fTitle" placeholder="Ex: Lumière Noire"></div>'+
        '<div class="fr">'+
          '<div class="fg"><label class="fl">Type</label><select class="fs" id="fType"><option value="film">Film</option><option value="series">Série</option><option value="cartoon">Dessin animé</option></select></div>'+
          '<div class="fg"><label class="fl">Année</label><input class="fi" id="fYear" type="number" min="1900" max="2100"></div>'+
        '</div>'+
        '<div class="fr">'+
          '<div class="fg"><label class="fl">Genre</label><input class="fi" id="fGenre" placeholder="Thriller, Drame..."></div>'+
          '<div class="fg"><label class="fl">Durée</label><input class="fi" id="fDur" placeholder="2h18m ou 3 saisons"></div>'+
        '</div>'+
        '<div class="fr">'+
          '<div class="fg"><label class="fl">Réalisateur</label><input class="fi" id="fDir" placeholder="Nom du réalisateur"></div>'+
          '<div class="fg"><label class="fl">Note (0-5)</label><input class="fi" id="fRat" type="number" step="0.1" min="0" max="5"></div>'+
        '</div>'+
        '<div class="fg"><label class="fl">Image (URL affiche)</label><input class="fi" id="fImg" placeholder="https://..."></div>'+
        '<div class="fg"><label class="fl">Synopsis</label><textarea class="ft" id="fDesc" placeholder="Résumé du contenu..."></textarea></div>'+
        '<div class="fg"><label class="fl">Pistes audio disponibles *</label><div class="chips" id="fAudio"></div></div>'+
        '<div class="fg"><label class="fl">Sous-titres disponibles</label><div class="chips" id="fSubs"></div></div>'+
        '<div class="fr">'+
          '<div class="fg"><label class="fl">Statut</label><select class="fs" id="fStatus"><option value="live">En ligne</option><option value="draft">Brouillon</option></select></div>'+
          '<div class="fg"><label class="fl">Production</label><label style="display:flex;align-items:center;gap:8px;padding:11px 0;font-size:13.5px;cursor:pointer"><input type="checkbox" id="fOrg" style="width:16px;height:16px;accent-color:#D4AF37"> Original NETLUXE</label></div>'+
        '</div>'+
        '<div style="background:rgba(212,175,55,.06);border:1px solid rgba(212,175,55,.2);border-radius:8px;padding:10px 13px;font-size:12px;color:var(--gold);line-height:1.6">'+
          '⚖️ Ne renseignez que des contenus dont NETLUXE détient les droits, sous licence, ou libres de droits. Ne déclarez pas de pistes audio/sous-titres inexistantes.</div>'+
      '</div>'+
      '<div class="m-f"><button type="button" class="btn btn-o" onclick="closeForm()">Annuler</button><button type="submit" class="btn btn-p">Enregistrer</button></div>'+
      '</form>'+
    '</div>'+
  '</div>'+

  /* --- FICHE PROFIL --- */
  '<div class="ov" id="ovProfile">'+
    '<div class="modal lg">'+
      '<div class="m-hdr"><div class="m-t">Fiche profil utilisateur</div><button class="m-x" onclick="closeProfile()">×</button></div>'+
      '<div class="m-b" id="pdBody"></div>'+
      '<div class="m-f"><button class="btn btn-o" onclick="closeProfile()">Fermer</button></div>'+
    '</div>'+
  '</div>'+

  /* --- CONFIRM SUPPRESSION --- */
  '<div class="ov" id="ovDel">'+
    '<div class="modal sm">'+
      '<div class="m-hdr"><div class="m-t">Confirmer la suppression</div><button class="m-x" onclick="closeDel()">×</button></div>'+
      '<div class="m-b" id="delTxt"></div>'+
      '<div class="m-f"><button class="btn btn-o" onclick="closeDel()">Annuler</button><button class="btn btn-d" onclick="doDelete()">Supprimer</button></div>'+
    '</div>'+
  '</div>';
  document.body.appendChild(d);

  /* Fermer les modales au clic sur le fond */
  var ovs = document.querySelectorAll('.ov');
  for(var i=0;i<ovs.length;i++){
    ovs[i].addEventListener('click', function(e){
      if(e.target === this) this.classList.remove('on');
    });
  }
  /* Échap ferme */
  document.addEventListener('keydown', function(e){
    if(e.key==='Escape'){
      var on = document.querySelectorAll('.ov.on');
      for(var j=0;j<on.length;j++) on[j].classList.remove('on');
    }
  });
});

/* Routage de la suppression (contenu OU utilisateur) */
function doDelete(){
  if(DEL_EMAIL){ DB.deleteUser(DEL_EMAIL); DEL_EMAIL=null; closeDel(); toast('Compte supprimé','ok'); renderUsers(); refreshBadges(); return; }
  confirmDelete();
}
