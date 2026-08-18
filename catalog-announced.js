/* ============================================
   NETLUXE PREMIERE — Titres annoncés

   Ce sont des ANNONCES : aucun fichier vidéo n'est
   encore disponible. Elles portent announced:true et
   comingSoon:true, ne sont pas lisibles, et servent
   la section « NETLUXE Premiere » (compte à rebours
   + rappel).

   Les dates sont calculées relativement à aujourd'hui
   pour que la section reste vivante dans le temps.
   Remplacer par les dates réelles depuis l'espace
   administrateur dès qu'elles sont fixées.
   ============================================ */
(function(){
  if(typeof CAT === 'undefined' || !Array.isArray(CAT)) return;

  function inDays(n){
    var d = new Date();
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0,10);
  }

  var ANNOUNCED = [
    { id:900, title:'Lakou Lakay', type:'series', year:new Date().getFullYear(),
      genre:'Drame familial', dur:'1 saison', rat:0, org:true,
      country:'HT', rating:'12+', days:21,
      img:'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600',
      desc:'Trois générations sous un même toit à Jacmel. Quand la maison familiale doit être vendue, chacun défend sa part de mémoire.',
      cast:['Mireille Métellus','Ti Djo Zenny','Nathalie Vil'],
      crew:{ dir:'Gessica Généus', writer:'Gessica Généus' },
      audio:['CR','FR'], subs:['FR','EN','ES'], tags:['famille','héritage','jacmel'] },

    { id:901, title:'Zafè Kè', type:'film', year:new Date().getFullYear(),
      genre:'Romance', dur:'1h48m', rat:0, org:true,
      country:'HT', rating:'10+', days:45,
      img:'https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?w=600',
      desc:'Une luthière de Port-au-Prince et un pêcheur des Cayes s\'écrivent pendant deux ans sans jamais se voir.',
      cast:['Anyès Noël','Jimmy Jean-Louis'],
      crew:{ dir:'Guetty Felin', music:'BélO' },
      audio:['CR','FR'], subs:['FR','EN'], tags:['romance','lettres','mer'] },

    { id:902, title:'Rasin 2 — Retour', type:'film', year:new Date().getFullYear() + 1,
      genre:'Drame', dur:'2h05m', rat:0, org:true,
      country:'HT', rating:'12+', days:120,
      img:'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=600',
      desc:'Suite de Rasin — Racines. Vingt ans plus tard, la fille revient sur la terre que son père avait quittée.',
      cast:['Rose-Marie Étienne','Yanatha Desouvre'],
      crew:{ dir:'Gessica Généus' },
      audio:['CR','FR'], subs:['FR','EN','ES'], tags:['suite','terre','retour'] },

    { id:903, title:'Ti Zwa — Gran Vwayaj', type:'cartoon', year:new Date().getFullYear(),
      genre:'Animation', dur:'1h12m', rat:0, org:true,
      country:'HT', rating:'TP', days:60,
      img:'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=600',
      desc:'Ti Zwa quitte la forêt pour traverser l\'île entière et retrouver sa famille. Premier long-métrage de la série.',
      cast:['Voix : Emeline Michel','Voix : Wanito'],
      crew:{ dir:'Studio Ti Zwa' },
      audio:['CR','FR'], subs:['FR','EN','ES'], tags:['aventure','île','famille'] }
  ];

  var added = 0;
  for(var i=0;i<ANNOUNCED.length;i++){
    var a = ANNOUNCED[i];

    /* ne pas dupliquer si déjà présent */
    var exists = false;
    for(var k=0;k<CAT.length;k++){
      if(String(CAT[k].id) === String(a.id)){ exists = true; break; }
    }
    if(exists) continue;

    var item = {
      id:a.id, title:a.title, type:a.type, year:a.year, genre:a.genre,
      dur:a.dur, rat:a.rat, img:a.img, desc:a.desc, org:a.org,
      cast:a.cast, crew:a.crew, audio:a.audio, subs:a.subs, tags:a.tags,
      country:a.country, rating:a.rating,
      views:0, likes:0,
      releaseDate:inDays(a.days),
      announced:true,      /* pas encore disponible */
      comingSoon:true,
      video:null,          /* aucun fichier : non lisible */
      source:'NETLUXE Originals'
    };

    /* champs dérivés, cohérents avec catalog-meta.js */
    var co = (typeof NX_COUNTRIES !== 'undefined') ? NX_COUNTRIES[a.country] : null;
    item.flag   = co ? co.flag : '🌍';
    item.region = co ? co.region : 'world';
    var ri = (typeof NX_RATINGS !== 'undefined') ? NX_RATINGS[a.rating] : null;
    item.ratingInfo = ri || { label:a.rating, min:0, color:'#22C55E' };
    item.minAge = item.ratingInfo.min;
    item.durMin = (typeof nxDurToMin === 'function') ? nxDurToMin(a.dur) : 0;

    CAT.push(item);
    added++;
  }

  if(added && typeof console !== 'undefined'){
    console.log('NETLUXE Premiere: ' + added + ' titre(s) annonce(s) — non lisibles jusqu\'a leur sortie');
  }
})();
