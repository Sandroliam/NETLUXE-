/* ============================================
   NETLUXE — Enrichissement du modèle de contenu
   Ajoute : rating, country, flag, region, cast,
   crew, releaseDate, tags, champs éditoriaux.

   NOTE DE DROITS : les titres internationaux du
   catalogue de départ sont des ENTRÉES DE
   DÉMONSTRATION. Ils portent licenseRequired:true
   et ne doivent pas être diffusés sans accord.
   Seuls les originaux NETLUXE et le domaine public
   sont diffusables en l'état.
   ============================================ */

var NX_RATINGS = {
  'TP':  { label:'Tout public', min:0,  color:'#22C55E' },
  '6+':  { label:'6 ans et +',  min:6,  color:'#84CC16' },
  '10+': { label:'10 ans et +', min:10, color:'#EAB308' },
  '12+': { label:'12 ans et +', min:12, color:'#F59E0B' },
  '16+': { label:'16 ans et +', min:16, color:'#EF4444' },
  '18+': { label:'18 ans et +', min:18, color:'#991B1B' }
};

var NX_COUNTRIES = {
  HT: { name:'Haïti',                flag:'🇭🇹', region:'caribbean' },
  DO: { name:'Rép. dominicaine',     flag:'🇩🇴', region:'caribbean' },
  JM: { name:'Jamaïque',             flag:'🇯🇲', region:'caribbean' },
  CU: { name:'Cuba',                 flag:'🇨🇺', region:'caribbean' },
  PR: { name:'Porto Rico',           flag:'🇵🇷', region:'caribbean' },
  TT: { name:'Trinité-et-Tobago',    flag:'🇹🇹', region:'caribbean' },
  MQ: { name:'Martinique',           flag:'🇲🇶', region:'caribbean' },
  GP: { name:'Guadeloupe',           flag:'🇬🇵', region:'caribbean' },
  SN: { name:'Sénégal',              flag:'🇸🇳', region:'africa' },
  CI: { name:"Côte d'Ivoire",        flag:'🇨🇮', region:'africa' },
  NG: { name:'Nigeria',              flag:'🇳🇬', region:'africa' },
  BR: { name:'Brésil',               flag:'🇧🇷', region:'latam' },
  MX: { name:'Mexique',              flag:'🇲🇽', region:'latam' },
  CO: { name:'Colombie',             flag:'🇨🇴', region:'latam' },
  FR: { name:'France',               flag:'🇫🇷', region:'europe' },
  US: { name:'États-Unis',           flag:'🇺🇸', region:'america' },
  DE: { name:'Allemagne',            flag:'🇩🇪', region:'europe' },
  JP: { name:'Japon',                flag:'🇯🇵', region:'asia' },
  GB: { name:'Royaume-Uni',          flag:'🇬🇧', region:'europe' }
};

/* Métadonnées par identifiant de contenu */
var NX_META = {
  /* ---------- ORIGINAUX NETLUXE (diffusables) ---------- */
  1: { rating:'16+', country:'HT', tags:['polar','urbain','nuit'],
       cast:['Jean-Claude Bélizaire','Marie Chadeau','Frantz Dorsainvil'],
       crew:{ dir:'Claude L. François', writer:'Claude L. François', music:'Wanito' },
       releaseDate:'2024-03-15', topRank:3 },
  2: { rating:'12+', country:'HT', tags:['famille','mémoire','terre'],
       cast:['Yanatha Desouvre','Rose-Marie Étienne'],
       crew:{ dir:'Gessica Généus', writer:'Gessica Généus', music:'BélO' },
       releaseDate:'2023-09-08', topRank:5 },
  3: { rating:'12+', country:'JM', tags:['action','plage','course'],
       cast:['Marcus Reid','Aaliyah Brown'],
       crew:{ dir:'Storm Saulter' },
       releaseDate:'2024-06-21' },
  4: { rating:'12+', country:'HT', tags:['quartier','solidarité','jeunesse'],
       cast:['Ti Djo Zenny','Nathalie Vil'],
       crew:{ dir:'Arnold Antonin', music:'Ti Coca' },
       releaseDate:'2024-01-19', topRank:1 },
  5: { rating:'16+', country:'HT', tags:['histoire','liberté','révolution'],
       cast:['Jimmy Jean-Louis','Anyès Noël'],
       crew:{ dir:'Raoul Peck', writer:'Raoul Peck' },
       releaseDate:'2019-11-18', topRank:2 },
  6: { rating:'16+', country:'HT', tags:['histoire','colonial','justice'],
       cast:['Alex Descas','Mireille Métellus'],
       crew:{ dir:'Guetty Felin', writer:'Guetty Felin' },
       releaseDate:'2024-05-10', topRank:4 },
  100:{ rating:'16+', country:'HT', tags:['enquête','policier','série'],
        cast:['Fabrice Célestin','Josette Darguste'],
        crew:{ dir:'Richard Sénécal' },
        releaseDate:'2024-02-02', topRank:1 },
  101:{ rating:'10+', country:'HT', tags:['diaspora','famille','comédie'],
        cast:['Manman Delva','Junior Delva','Tante Rosita'],
        crew:{ dir:'Rachèle Magloire' },
        releaseDate:'2023-07-14', topRank:2 },
  200:{ rating:'TP',  country:'HT', tags:['forêt','amitié','nature'],
        cast:['Voix : Emeline Michel'],
        crew:{ dir:'Studio Ti Zwa' },
        releaseDate:'2024-04-05', topRank:1 },

  /* ---------- ENTRÉES DE DÉMONSTRATION (licence requise) ---------- */
  7:  { rating:'16+', country:'US', licenseRequired:true, tags:['antiquité','combat'] },
  8:  { rating:'10+', country:'FR', licenseRequired:true, tags:['paris','romance'] },
  9:  { rating:'16+', country:'US', licenseRequired:true, tags:['désert','traque'] },
  10: { rating:'12+', country:'US', licenseRequired:true, tags:['mémoire','amour'] },
  102:{ rating:'16+', country:'US', licenseRequired:true, tags:['crime','transformation'] },
  103:{ rating:'16+', country:'DE', licenseRequired:true, tags:['temps','mystère'] },
  201:{ rating:'10+', country:'JP', licenseRequired:true, tags:['pirates','aventure'] },
  202:{ rating:'6+',  country:'US', licenseRequired:true, tags:['dragons','vikings'] },
  203:{ rating:'6+',  country:'FR', licenseRequired:true, tags:['héros','école'] }
};

/* ---------- CLASSIFICATION AUTOMATIQUE ---------- */
/* Pour le domaine public : déduite du genre et du titre. */
function nxGuessRating(c){
  var t = ((c.genre || '') + ' ' + (c.title || '') + ' ' + (c.desc || '')).toLowerCase();
  if(/horreur|horror|haunted|terror|slasher/.test(t)) return '16+';
  if(/thriller|crime|policier|noir|meurtre|murder|guerre|war/.test(t)) return '12+';
  if(/drame|drama/.test(t)) return '12+';
  if(/animation|cartoon|dessin/.test(t)) return 'TP';
  if(/comédie|comedy|famille|family|aventure|adventure/.test(t)) return '6+';
  return '10+';
}

/* Pays par défaut selon la source */
function nxGuessCountry(c){
  if(c.source === 'Internet Archive') return 'US';
  return 'US';
}

/* ---------- APPLICATION ---------- */
(function(){
  if(typeof CAT === 'undefined' || !Array.isArray(CAT)) return;
  var n = 0, guessed = 0;

  for(var i=0;i<CAT.length;i++){
    var c = CAT[i];
    var m = NX_META[c.id];

    if(m){
      if(m.rating)          c.rating = m.rating;
      if(m.country)         c.country = m.country;
      if(m.tags)            c.tags = m.tags;
      if(m.cast && (!c.cast || !c.cast.length)) c.cast = m.cast;
      if(m.crew)            c.crew = m.crew;
      if(m.releaseDate)     c.releaseDate = m.releaseDate;
      if(m.topRank)         c.topRank = m.topRank;
      if(m.licenseRequired) c.licenseRequired = true;
      n++;
    } else {
      /* domaine public : déduction */
      if(!c.rating){ c.rating = nxGuessRating(c); guessed++; }
      if(!c.country) c.country = nxGuessCountry(c);
      if(!c.tags) c.tags = (c.genre ? [String(c.genre).toLowerCase()] : []);
    }

    /* champs dérivés, toujours calculés */
    var co = NX_COUNTRIES[c.country];
    c.flag   = co ? co.flag : '🌍';
    c.region = co ? co.region : 'world';
    c.ratingInfo = NX_RATINGS[c.rating] || NX_RATINGS['10+'];
    c.minAge = c.ratingInfo.min;

    /* date de sortie de repli à partir de l'année */
    if(!c.releaseDate && c.year) c.releaseDate = c.year + '-01-01';

    /* durée en minutes, exploitable pour les filtres et le temps restant */
    c.durMin = nxDurToMin(c.dur);

    /* épisodes : hériter des métadonnées et calculer leur propre durée */
    if(c.episodes && c.episodes.length){
      for(var e=0;e<c.episodes.length;e++){
        var ep = c.episodes[e];
        ep.durMin = nxDurToMin(ep.dur);
        if(!ep.rating)  ep.rating = c.rating;
        if(!ep.country) ep.country = c.country;
        ep.flag = c.flag;
        ep.region = c.region;
        ep.ratingInfo = c.ratingInfo;
        ep.minAge = c.minAge;
        if(c.licenseRequired) ep.licenseRequired = true;
      }
    }
  }

  if(typeof console !== 'undefined'){
    console.log('NETLUXE meta: ' + n + ' fiche(s) enrichie(s), ' + guessed +
                ' classification(s) deduite(s) | ' +
                CAT.filter(function(x){ return !!x.rating; }).length + '/' + CAT.length + ' classees');
  }
})();

/* Convertit "2h18m" / "48min" / "1h" en minutes.
   Renvoie 0 pour "3 saisons" : ce n'est pas une durée mais un
   nombre de saisons (sinon on lisait "3 saisons" comme 3 minutes). */
function nxDurToMin(d){
  if(!d) return 0;
  var s = String(d).toLowerCase();
  if(/saison|season|épisode|episode/.test(s)) return 0;
  var h = s.match(/(\d+)\s*h/);
  var m = s.match(/(\d+)\s*m/);
  var total = 0;
  if(h) total += parseInt(h[1], 10) * 60;
  if(m) total += parseInt(m[1], 10);
  if(!h && !m){
    var num = s.match(/(\d+)/);
    if(num) total = parseInt(num[1], 10);
  }
  return total;
}
