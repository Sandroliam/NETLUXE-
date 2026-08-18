/* ============================================
   NETLUXE — Structure d'épisodes des séries
   Chaque série reçoit une saison avec épisodes nommés.
   NOTE : tant qu'un fichier vidéo distinct n'est pas fourni
   par l'ayant droit, chaque épisode pointe vers la source
   disponible du titre. Remplacer `video` par le vrai fichier
   depuis l'espace administrateur quand il est livré.
   ============================================ */
var NX_EPISODES = {
  100: { title:'Rue des Jasmins',
    seasons: 3,
    list: [
      { t:'Le corps du canal',        d:'48min', s:'Un cadavre remonte dans le canal de Bois-Verna. Inspecteur Célestin ouvre l\'enquête.' },
      { t:'Les carnets de Madame Rose', d:'45min', s:'Un carnet retrouvé chez la victime mène vers une notable de Pétion-Ville.' },
      { t:'Rue sans nom',             d:'51min', s:'Célestin remonte jusqu\'à une adresse qui n\'existe sur aucun plan.' },
      { t:'Le témoin de minuit',      d:'47min', s:'Un vendeur de rue a vu quelque chose. Il refuse de parler.' },
      { t:'Jasmins',                  d:'53min', s:'La vérité éclate là où personne ne regardait.' }
    ]
  },
  101: { title:'Madan Nou',
    seasons: 2,
    list: [
      { t:'Arrivée à Miami',   d:'26min', s:'La famille Delva débarque en Floride avec deux valises et beaucoup d\'espoir.' },
      { t:'Lakou Little Haiti',d:'24min', s:'Manman Delva découvre le voisinage et ses règles non écrites.' },
      { t:'Griyo ak McDonald', d:'25min', s:'Conflit de générations autour du dîner du dimanche.' },
      { t:'Rezo fanmi',        d:'27min', s:'Un cousin arrive sans prévenir et bouscule l\'équilibre.' }
    ]
  },
  102: { title:'Breaking Bad',
    seasons: 5,
    list: [
      { t:'Épisode 1', d:'58min', s:'' },
      { t:'Épisode 2', d:'48min', s:'' },
      { t:'Épisode 3', d:'48min', s:'' }
    ]
  },
  103: { title:'Dark',
    seasons: 3,
    list: [
      { t:'Épisode 1', d:'51min', s:'' },
      { t:'Épisode 2', d:'44min', s:'' },
      { t:'Épisode 3', d:'46min', s:'' }
    ]
  },
  200: { title:'Ti Zwa',
    seasons: 2,
    list: [
      { t:'Ti Zwa nan forè a',  d:'11min', s:'Ti Zwa s\'aventure au-delà du grand fromager.' },
      { t:'Zanmi Kabrit',       d:'10min', s:'Une amitié improbable avec un cabri têtu.' },
      { t:'Lapli premye',       d:'12min', s:'La première pluie de la saison change tout dans la forêt.' },
      { t:'Chante zwazo yo',    d:'11min', s:'Ti Zwa apprend le langage des oiseaux.' }
    ]
  },
  201: { title:'Konpè Bètje',
    seasons: 1,
    list: [
      { t:'Konpè Bètje ak Konpè Lapen', d:'9min',  s:'La ruse contre la ruse : personne ne gagne vraiment.' },
      { t:'Sac vide',                   d:'10min', s:'Un sac qu\'on croyait plein cache une leçon.' },
      { t:'Nan mache a',                d:'9min',  s:'Au marché, les apparences coûtent cher.' }
    ]
  }
};

/* Injection dans le catalogue */
(function(){
  if(typeof CAT === 'undefined' || !Array.isArray(CAT)) return;
  var n = 0;
  for(var i=0;i<CAT.length;i++){
    var c = CAT[i];
    if(c.type !== 'series' && c.type !== 'cartoon') continue;
    var def = NX_EPISODES[c.id];
    if(!def || c.episodes) continue;
    /* Sécurité : plusieurs contenus peuvent porter le même id numérique
       (201 = Konpè Bètje côté originaux, One Piece côté international).
       On n'attache les épisodes que si le titre correspond. */
    if(def.title && String(c.title).toLowerCase() !== String(def.title).toLowerCase()) continue;
    c.seasons = def.seasons;
    c.episodes = def.list.map(function(e, k){
      return {
        id: c.id + '_e' + (k+1),
        title: (k+1) + '. ' + e.t,
        dur: e.d,
        desc: e.s || c.desc,
        video: c.video,          /* source disponible du titre */
        img: c.img,
        year: c.year,
        audio: c.audio,
        subs: c.subs,
        tracks: c.tracks || null,
        provisional: true        /* fichier épisode définitif à fournir */
      };
    });
    n++;
  }
  if(n && typeof console !== 'undefined') console.log('NETLUXE: épisodes ajoutés à ' + n + ' séries');
})();
