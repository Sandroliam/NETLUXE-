/* ============================================
   NETLUXE — Avatars : Cinéma & Caraïbes
   SVG inline, aucune dépendance externe.
   ============================================ */
var NX_AV = {};

function nxAvWrap(bg, inner){
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">'+
    '<defs><linearGradient id="g'+(nxAvWrap._i=(nxAvWrap._i||0)+1)+'" x1="0" y1="0" x2="1" y2="1">'+
    '<stop offset="0" stop-color="'+bg[0]+'"/><stop offset="1" stop-color="'+bg[1]+'"/>'+
    '</linearGradient></defs>'+
    '<rect width="100" height="100" fill="url(#g'+nxAvWrap._i+')"/>'+ inner +'</svg>';
}

/* ---------- 🎬 CINÉMA ---------- */
NX_AV.cinema = [
  { id:'cin1', name:'Projectionniste', cat:'cinema', bg:['#1a1a2e','#16213e'],
    svg:'<circle cx="50" cy="38" r="15" fill="#F5D0A9"/><path d="M35 62q15-10 30 0v20H35z" fill="#E50914"/>'+
        '<rect x="38" y="26" width="24" height="7" rx="3" fill="#2C2C34"/><rect x="34" y="30" width="32" height="4" rx="2" fill="#2C2C34"/>'+
        '<circle cx="44" cy="38" r="2.2" fill="#2C2C34"/><circle cx="56" cy="38" r="2.2" fill="#2C2C34"/>' },
  { id:'cin2', name:'Bobine', cat:'cinema', bg:['#0f0f1a','#2a1a3e'],
    svg:'<circle cx="50" cy="50" r="27" fill="none" stroke="#D4AF37" stroke-width="4"/>'+
        '<circle cx="50" cy="50" r="6" fill="#D4AF37"/>'+
        '<circle cx="50" cy="32" r="5" fill="#D4AF37"/><circle cx="50" cy="68" r="5" fill="#D4AF37"/>'+
        '<circle cx="32" cy="50" r="5" fill="#D4AF37"/><circle cx="68" cy="50" r="5" fill="#D4AF37"/>' },
  { id:'cin3', name:'Clap', cat:'cinema', bg:['#141414','#2d2d44'],
    svg:'<rect x="24" y="46" width="52" height="30" rx="3" fill="#F5F5F0"/>'+
        '<path d="M22 32l52-8 4 14-52 8z" fill="#1a1a1a"/>'+
        '<path d="M30 30l4 12M42 28l4 12M54 26l4 12M66 25l4 12" stroke="#F5F5F0" stroke-width="3.5"/>'+
        '<rect x="30" y="54" width="24" height="3" rx="1.5" fill="#9A9A9A"/>'+
        '<rect x="30" y="62" width="34" height="3" rx="1.5" fill="#9A9A9A"/>' },
  { id:'cin4', name:'Réalisatrice', cat:'cinema', bg:['#2b1055','#7597de'],
    svg:'<circle cx="50" cy="38" r="15" fill="#8D5524"/>'+
        '<path d="M33 34q0-18 17-18t17 18q-4-6-17-6t-17 6z" fill="#1a1a1a"/>'+
        '<path d="M35 62q15-10 30 0v20H35z" fill="#00CED1"/>'+
        '<circle cx="44" cy="38" r="2.2" fill="#1a1a1a"/><circle cx="56" cy="38" r="2.2" fill="#1a1a1a"/>'+
        '<path d="M45 46q5 4 10 0" stroke="#1a1a1a" stroke-width="1.8" fill="none" stroke-linecap="round"/>' },
  { id:'cin5', name:'Écran d\'or', cat:'cinema', bg:['#1a1200','#3d2c00'],
    svg:'<rect x="20" y="28" width="60" height="40" rx="4" fill="#D4AF37"/>'+
        '<rect x="26" y="34" width="48" height="28" rx="2" fill="#0A0A0A"/>'+
        '<path d="M44 42l14 6-14 6z" fill="#D4AF37"/>'+
        '<rect x="40" y="70" width="20" height="4" rx="2" fill="#D4AF37"/>'+
        '<rect x="34" y="76" width="32" height="3" rx="1.5" fill="#8B7355"/>' }
];

/* ---------- 🌴 CARAÏBES ---------- */
NX_AV.caribbean = [
  { id:'car1', name:'Kréyòl', cat:'caribbean', bg:['#004d40','#00897b'],
    svg:'<circle cx="50" cy="38" r="15" fill="#6B4423"/>'+
        '<path d="M33 33q2-17 17-17t17 17q-3-8-17-8t-17 8z" fill="#1a1a1a"/>'+
        '<path d="M35 62q15-10 30 0v20H35z" fill="#D4AF37"/>'+
        '<circle cx="44" cy="38" r="2.2" fill="#1a1a1a"/><circle cx="56" cy="38" r="2.2" fill="#1a1a1a"/>'+
        '<path d="M45 46q5 4 10 0" stroke="#1a1a1a" stroke-width="1.8" fill="none" stroke-linecap="round"/>' },
  { id:'car2', name:'Palmier', cat:'caribbean', bg:['#00695c','#26a69a'],
    svg:'<path d="M48 44h4v34h-4z" fill="#6B4423"/>'+
        '<path d="M50 42q-16-10-22 2 10-4 22 2z" fill="#2E7D32"/>'+
        '<path d="M50 42q16-10 22 2-10-4-22 2z" fill="#388E3C"/>'+
        '<path d="M50 42q-8-16-24-12 12 2 24 12z" fill="#43A047"/>'+
        '<path d="M50 42q8-16 24-12-12 2-24 12z" fill="#2E7D32"/>'+
        '<circle cx="46" cy="46" r="3" fill="#D4AF37"/><circle cx="54" cy="47" r="3" fill="#D4AF37"/>'+
        '<path d="M22 78h56" stroke="#D4AF37" stroke-width="3" stroke-linecap="round"/>' },
  { id:'car3', name:'Tambour', cat:'caribbean', bg:['#3e2723','#6d4c41'],
    svg:'<ellipse cx="50" cy="34" rx="22" ry="8" fill="#F5D0A9"/>'+
        '<path d="M28 34v30q0 8 22 8t22-8V34" fill="#8D6E63"/>'+
        '<ellipse cx="50" cy="34" rx="22" ry="8" fill="none" stroke="#D4AF37" stroke-width="2.5"/>'+
        '<path d="M32 42h36M32 54h36" stroke="#D4AF37" stroke-width="2"/>'+
        '<path d="M38 34v34M50 34v38M62 34v34" stroke="#5D4037" stroke-width="1.5"/>' },
  { id:'car4', name:'Soleil créole', cat:'caribbean', bg:['#e65100','#ff8f00'],
    svg:'<circle cx="50" cy="50" r="18" fill="#FFD54F"/>'+
        '<g stroke="#FFF176" stroke-width="3.5" stroke-linecap="round">'+
        '<path d="M50 22v-8M50 78v8M22 50h-8M78 50h8M30 30l-6-6M70 30l6-6M30 70l-6 6M70 70l6 6"/></g>'+
        '<circle cx="44" cy="47" r="2" fill="#E65100"/><circle cx="56" cy="47" r="2" fill="#E65100"/>'+
        '<path d="M43 56q7 6 14 0" stroke="#E65100" stroke-width="2.2" fill="none" stroke-linecap="round"/>' },
  { id:'car5', name:'Vague turquoise', cat:'caribbean', bg:['#006064','#00acc1'],
    svg:'<path d="M12 58q10-12 19 0t19 0 19 0 19 0v26H12z" fill="#00CED1" opacity=".9"/>'+
        '<path d="M12 68q10-10 19 0t19 0 19 0 19 0v18H12z" fill="#4DD0E1" opacity=".8"/>'+
        '<circle cx="50" cy="32" r="12" fill="#FFD54F"/>'+
        '<path d="M30 46q6-4 12 0M58 46q6-4 12 0" stroke="#F5F5F0" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".7"/>' }
];
