/* ============================================
   NETLUXE — API Avatars
   Rendu, recherche, catégories.
   ============================================ */

var NX_AV_CATS = [
  { key:'portrait',  ic:'🧑', label:'Portraits' },
  { key:'cinema',    ic:'🎬', label:'Cinéma' },
  { key:'caribbean',  ic:'🌴', label:'Caraïbes' },
  { key:'futuristic', ic:'🚀', label:'Futuriste' },
  { key:'classic',    ic:'👤', label:'Classique' },
  { key:'kids',       ic:'🧒', label:'Enfants' },
  { key:'premium',    ic:'⭐', label:'Premium' }
];

/* Liste plate de tous les avatars */
function nxAvAll(){
  var out = [];
  for(var i=0;i<NX_AV_CATS.length;i++){
    var list = NX_AV[NX_AV_CATS[i].key] || [];
    for(var j=0;j<list.length;j++) out.push(list[j]);
  }
  return out;
}

/* Retrouver un avatar par identifiant */
function nxAvGet(id){
  var all = nxAvAll();
  for(var i=0;i<all.length;i++){ if(all[i].id === id) return all[i]; }
  return null;
}

/* Avatars adaptés aux profils enfants */
function nxAvForKids(){
  return (NX_AV.kids || []).concat(NX_AV.caribbean || []);
}

/* Rendu SVG complet d'un avatar (chaîne HTML) */
function nxAvRender(id, size){
  var a = nxAvGet(id);
  var s = size || 100;
  if(!a){
    /* repli : monogramme NETLUXE */
    return '<svg viewBox="0 0 100 100" width="'+s+'" height="'+s+'" xmlns="http://www.w3.org/2000/svg">'+
      '<rect width="100" height="100" fill="#1a1a1a"/>'+
      '<text x="50" y="64" font-family="Georgia,serif" font-size="34" font-weight="700" fill="#D4AF37" text-anchor="middle">N</text></svg>';
  }
  var gid = 'nxg_' + a.id;
  return '<svg viewBox="0 0 100 100" width="'+s+'" height="'+s+'" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="'+a.name+'">'+
    '<defs><linearGradient id="'+gid+'" x1="0" y1="0" x2="1" y2="1">'+
    '<stop offset="0" stop-color="'+a.bg[0]+'"/><stop offset="1" stop-color="'+a.bg[1]+'"/>'+
    '</linearGradient></defs>'+
    '<rect width="100" height="100" fill="url(#'+gid+')"/>'+
    a.svg + '</svg>';
}

/* Avatar par défaut selon le type de profil */
/* Avatar par défaut. On privilégie les portraits, plus proches
   de la référence visuelle, plutôt que des pictogrammes. */
function nxAvDefault(ptype, ageGroup){
  /* selon la tranche d'âge quand elle est connue */
  if(ageGroup === 'kids')  return 'por4';   /* panda */
  if(ageGroup === 'child') return 'por3';   /* Junior */
  if(ageGroup === 'teen' || ageGroup === 'teenF') return 'por2';  /* Maya */
  if(ageGroup === 'adult') return 'por1';   /* Sandro */

  var map = {
    kids:'por4', cartoon:'por4', films:'por1',
    series:'por2', mixed:'por1'
  };
  return map[ptype] || 'por1';
}

/* Statistiques (pour vérification) */
function nxAvStats(){
  var s = { total:0, byCat:{} };
  for(var i=0;i<NX_AV_CATS.length;i++){
    var k = NX_AV_CATS[i].key;
    var n = (NX_AV[k] || []).length;
    s.byCat[k] = n; s.total += n;
  }
  return s;
}
