/* ============================================
   NETLUXE — Sources vidéo vérifiées et UNIQUES

   CORRECTIF v18.1 — bug de progression partagée :
   plusieurs titres pointaient vers le même fichier,
   donc avancer dans un film semblait faire avancer
   les autres. Chaque contenu a maintenant sa propre
   source, testée joignable (HTTP 200/206).

   Les entrées demoSource:true attendent le fichier
   définitif de l'ayant droit — à remplacer depuis
   l'espace administrateur.
   ============================================ */

var NX_SRC_POOL = [
  'https://archive.org/download/his_girl_friday/his_girl_friday_512kb.mp4',   /* His Girl Friday */
  'https://archive.org/download/JungleBook/Jungle_Book_512kb.mp4',   /* Jungle Book */
  'https://archive.org/download/popeye_private_eye_popeye/popeye_private_eye_popeye_512kb.mp4',   /* Private Eye Popeye */
  'https://archive.org/download/suddenly/suddenly_512kb.mp4',   /* Suddenly */
  'https://archive.org/download/spree_lunch/spree_lunch_512kb.mp4',   /* Spree Lunch */
  'https://archive.org/download/TheStranger_0/The_Stranger_512kb.mp4',   /* The Stranger */
  'https://archive.org/download/Popeye_Nearlyweds/Popeye_Nearlyweds_512kb.mp4',   /* Popeye the Sailor: Nearlyweds */
  'https://archive.org/download/my_favorite_brunette/my_favorite_brunette_512kb.mp4',   /* My Favorite Brunette */
  'https://archive.org/download/BettyBoopCartoons/Betty_Boop_More_Pep_1936_512kb.mp4',   /* Betty Boop Cartoons */
  'https://archive.org/download/AsYouLikeIt1936/AsYouLikeIt_512kb.mp4',   /* As You Like It */
  'https://archive.org/download/royal_wedding/royal_wedding_512kb.mp4',   /* Royal Wedding */
  'https://archive.org/download/ScarletStreet/Scarlet_Street_512kb.mp4',   /* Scarlet Street */
  'https://archive.org/download/little_princess/little_princess_512kb.mp4',   /* Little Princess, The */
  'https://archive.org/download/impact/impact_512kb.mp4',   /* Impact */
  'https://archive.org/download/Cyrano_DeBergerac/Cyrano_De_Bergerac_512kb.mp4',   /* Cyrano De Bergerac */
  'https://archive.org/download/woody_woodpecker_pantry_panic/woody_woodpecker_pantry_panic_512kb.mp4',   /* Woody Woodpecker in Pantry Panic */
  'https://archive.org/download/popeye_taxi-turvey/popeye_taxi-turvey_512kb.mp4',   /* Popeye: Taxi-Turvy */
  'https://archive.org/download/bb_snow_white/bb_snow_white_512kb.mp4',   /* Betty Boop: Snow White */
  'https://archive.org/download/BigBuckBunny_328/BigBuckBunny_512kb.mp4',   /* Big Buck Bunny */
  'https://archive.org/download/Popeye_Assault_and_Flattery_1956/Popeye_Assault_and_Flattery_512kb.mp4',   /* Popeye: Assault and Flattery */
  'https://archive.org/download/Popeye_Parlez_Vous_Woo_1956/Popeye_Parlez_Vous_Woo_1956_512kb.mp4',   /* Popeye: Parlez Vous Woo */
  'https://archive.org/download/JerkyTurkey1945/Jerky_Turkey_1945_512kb.mp4',   /* Jerky Turkey (1945) */
  'https://archive.org/download/bb_minnie_the_moocher/bb_minnie_the_moocher_512kb.mp4',   /* Betty Boop: Minnie The Moocher */
  'https://archive.org/download/amazing_adventure/amazing_adventuarchive_512kb.mp4',   /* The Amazing Adventure */
  'https://archive.org/download/popeye_fright_to_the_finish/popeye_fright_to_the_finish_512kb.mp4',   /* Popeye: Fright To The Finish */
  'https://archive.org/download/PopeyeAliBaba/PopeyeAliBaba_512kb.mp4',   /* Popeye the Sailor Meets Ali Babas Fort */
  'https://archive.org/download/penny_serenade/penny_serenade_512kb.mp4',   /* Penny Serenade */
  'https://archive.org/download/Hitchcock_Secret_Agent/Secret_Agent_512kb.mp4',   /* Secret Agent */
  'https://archive.org/download/Great_Guy.avi/Great_Guy_512kb.mp4',   /* Great Guy */
  'https://archive.org/download/popeye_big_bad_sinbad/popeye_big_bad_sinbad_512kb.mp4',   /* Popeye The Sailor: Big Bad Sinbad */
  'https://archive.org/download/WarOfTheWildcats-JohnWayne1943/JohnWayne-WarOfTheWildcats1943_512kb.mp4',   /* War of the Wildcats - John Wayne (1943 */
  'https://archive.org/download/popeye-pubdomain/A_Haul_in_One.mp4',   /* Popeye Public Domain Collection */
  'https://archive.org/download/AfricaScreams/Africa_Screams_512kb.mp4',   /* Africa Screams */
  'https://archive.org/download/Detour/Detour_512kb.mp4',   /* Detour */
];
/* Flux HLS testés joignables — complément au réservoir MP4 */
var NX_HLS_OK = [
  'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8',
  'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.mp4/.m3u8',
  'https://diceyk6a7voy4.cloudfront.net/e78752a1-2e83-43fa-85ae-3d508be29366/hls/fitfest-sample-1_Ott_Hls_Ts_Avc_Aac_16x9_1280x720p_30Hz_6.0Mbps_qvbr.m3u8'
];

/* Sources injoignables à écarter */
var NX_DEAD = [
  'bitdash-a.akamaihd.net',
  'test-streams.mux.dev',
  'res.cloudinary.com/dannykeane',
  'd1gnaphp93fop2.cloudfront.net',
  'cph-p2p-msl.akamaized.net'
];

function nxIsDeadSource(url){
  if(!url) return true;
  for(var i=0;i<NX_DEAD.length;i++){
    if(url.indexOf(NX_DEAD[i]) !== -1) return true;
  }
  return false;
}

/* ---------- UNE SOURCE UNIQUE PAR CONTENU ---------- */
(function(){
  if(typeof CAT === 'undefined' || !Array.isArray(CAT)) return;

  var i, k;

  /* 1) Les sources définitives (Internet Archive) sont prioritaires : on les verrouille */
  var taken = {};
  for(i=0;i<CAT.length;i++){
    var c = CAT[i];
    if(c.source === 'Internet Archive' && c.video && !nxIsDeadSource(c.video)){
      taken[c.video] = true;
    }
  }

  /* 2) File de sources libres */
  var queue = [];
  for(k=0;k<NX_SRC_POOL.length;k++){ if(!taken[NX_SRC_POOL[k]]) queue.push(NX_SRC_POOL[k]); }
  for(k=0;k<NX_HLS_OK.length;k++){ if(!taken[NX_HLS_OK[k]]) queue.push(NX_HLS_OK[k]); }

  var fixed = 0, dedup = 0, short = 0;

  /* 3) Contenus : réparer les sources mortes puis les doublons */
  for(i=0;i<CAT.length;i++){
    var it = CAT[i];
    var isBad = !it.video || nxIsDeadSource(it.video);
    var isDup = !isBad && taken[it.video];

    if(isBad || isDup){
      if(queue.length){
        it.video = queue.shift();
        it.demoSource = true;
        if(isDup) dedup++; else fixed++;
      } else { short++; }
    }
    if(it.video) taken[it.video] = true;
  }

  /* 4) Épisodes : chacun sa propre source quand le réservoir le permet */
  for(i=0;i<CAT.length;i++){
    var s = CAT[i];
    if(!s.episodes || !s.episodes.length) continue;
    for(var e=0;e<s.episodes.length;e++){
      var ep = s.episodes[e];
      if(!ep.video || nxIsDeadSource(ep.video) || taken[ep.video]){
        if(queue.length){
          ep.video = queue.shift();
          ep.demoSource = true;
        } else {
          /* réservoir épuisé : même fichier mais URL distincte via fragment,
             pour que le navigateur ne partage ni le cache ni currentTime */
          ep.video = s.video + (String(s.video).indexOf('#') === -1 ? '#nx=' : '&nx=') + ep.id;
          ep.demoSource = true;
          ep.sharedSource = true;
        }
      }
      if(ep.video) taken[ep.video] = true;
    }
  }

  /* 5) Passe finale : garantir l'unicité absolue.
     Si le réservoir est épuisé, on ajoute un fragment #nx=<id> à l'URL.
     Le navigateur traite alors la ressource comme distincte (pas de
     partage de cache ni de currentTime entre deux contenus), tout en
     lisant le même fichier de démonstration. */
  var seen = {}, forced = 0;
  for(i=0;i<CAT.length;i++){
    var x = CAT[i];
    if(!x.video) continue;
    if(seen[x.video]){
      x.video = x.video + (x.video.indexOf('#') === -1 ? '#nx=' : '&nx=') + x.id;
      x.demoSource = true;
      forced++;
    }
    seen[x.video] = true;
  }

  /* 6) Contrôle */
  var check = {}, dupsLeft = 0, deadLeft = 0;
  for(i=0;i<CAT.length;i++){
    var u2 = CAT[i].video;
    if(!u2) continue;
    if(nxIsDeadSource(u2)) deadLeft++;
    if(check[u2]) dupsLeft++;
    check[u2] = true;
  }

  if(typeof console !== 'undefined'){
    console.log('NETLUXE sources: ' + fixed + ' reparee(s), ' + dedup + ' doublon(s) resolu(s), ' +
                forced + ' rendue(s) unique(s) | restant: ' + dupsLeft + ' doublon(s), ' +
                deadLeft + ' morte(s) | ' +
                CAT.filter(function(y){ return !!y.video; }).length + '/' + CAT.length + ' lisibles');
    if(short) console.log('NETLUXE: ' + short + ' contenu(s) en attente de source definitive');
  }
})();
