/* ============================================
   NETLUXE — Sources vidéo vérifiées
   Remplace les flux de démonstration morts (403/404/SSL)
   par des sources testées et joignables.

   IMPORTANT : les contenus caribéens NETLUXE utilisent ici
   une source de démonstration en attente de leurs fichiers
   définitifs. Chaque entrée porte `demoSource:true` — à
   remplacer depuis l'espace administrateur dès livraison
   par l'ayant droit.
   ============================================ */

/* Flux HLS testés joignables (200 OK) */
var NX_HLS_OK = [
  'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8',
  'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.mp4/.m3u8',
  'https://diceyk6a7voy4.cloudfront.net/e78752a1-2e83-43fa-85ae-3d508be29366/hls/fitfest-sample-1_Ott_Hls_Ts_Avc_Aac_16x9_1280x720p_30Hz_6.0Mbps_qvbr.m3u8'
];

/* MP4 progressifs du domaine public, testés joignables.
   Servent de source de démonstration pour les titres dont
   le fichier définitif n'est pas encore fourni. */
var NX_MP4_OK = [
  'https://archive.org/download/Popeye_forPresident/Popeye_forPresident_512kb.mp4',
  'https://archive.org/download/house_on_haunted_hill/house_on_haunted_hill.mp4',
  'https://archive.org/download/HisGirlFriday/MoviePowderPresentsHisGirlFriday_512kb.mp4',
  'https://archive.org/download/ElephantsDream/ed_1024_512kb.mp4',
  'https://archive.org/download/charlie_chaplin_film_fest/charlie_chaplin_film_fest_512kb.mp4'
];

/* Flux morts à écarter systématiquement */
var NX_DEAD = [
  'bitdash-a.akamaihd.net',
  'test-streams.mux.dev',
  'res.cloudinary.com/dannykeane',
  'd1gnaphp93fop2.cloudfront.net',
  'cph-p2p-msl.akamaized.net'      /* live : pas adapté à un catalogue VOD */
];

function nxIsDeadSource(url){
  if(!url) return true;
  for(var i=0;i<NX_DEAD.length;i++){
    if(url.indexOf(NX_DEAD[i]) !== -1) return true;
  }
  return false;
}

/* Réparation du catalogue */
(function(){
  if(typeof CAT === 'undefined' || !Array.isArray(CAT)) return;
  var fixed = 0, mp4i = 0, hlsi = 0;

  for(var i=0;i<CAT.length;i++){
    var c = CAT[i];

    /* on ne touche pas aux sources Internet Archive déjà vérifiées */
    if(c.source === 'Internet Archive' && c.video) continue;

    if(!c.video || nxIsDeadSource(c.video)){
      /* alterner MP4 / HLS pour varier, en privilégiant les MP4 (plus fiables) */
      if(i % 3 === 2){
        c.video = NX_HLS_OK[hlsi % NX_HLS_OK.length];
        hlsi++;
      } else {
        c.video = NX_MP4_OK[mp4i % NX_MP4_OK.length];
        mp4i++;
      }
      c.demoSource = true;   /* signale un fichier de démonstration */
      fixed++;
    }

    /* propager aux épisodes qui héritaient d'une source morte */
    if(c.episodes && c.episodes.length){
      for(var k=0;k<c.episodes.length;k++){
        var e = c.episodes[k];
        if(!e.video || nxIsDeadSource(e.video)){
          e.video = c.video;
          e.demoSource = true;
        }
      }
    }
  }

  if(typeof console !== 'undefined'){
    console.log('NETLUXE: ' + fixed + ' source(s) vidéo réparée(s) — ' +
                CAT.filter(function(c){ return !!c.video; }).length + '/' + CAT.length + ' contenus lisibles');
  }
})();
