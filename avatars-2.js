/* ============================================
   NETLUXE — Avatars : Futuriste, Classique, Enfants, Premium
   ============================================ */

/* ---------- 🚀 FUTURISTE ---------- */
NX_AV.futuristic = [
  { id:'fut1', name:'Cyber', cat:'futuristic', bg:['#0d0221','#1b1464'],
    svg:'<path d="M32 30h36v34q0 12-18 16-18-4-18-16z" fill="#1a1a2e" stroke="#00CED1" stroke-width="2"/>'+
        '<rect x="38" y="40" width="10" height="4" rx="2" fill="#00CED1"/>'+
        '<rect x="52" y="40" width="10" height="4" rx="2" fill="#00CED1"/>'+
        '<path d="M42 56h16" stroke="#E50914" stroke-width="2.5" stroke-linecap="round"/>'+
        '<path d="M32 30l-6-8M68 30l6-8" stroke="#00CED1" stroke-width="2.5" stroke-linecap="round"/>'+
        '<circle cx="26" cy="20" r="3" fill="#00CED1"/><circle cx="74" cy="20" r="3" fill="#00CED1"/>' },
  { id:'fut2', name:'Néon', cat:'futuristic', bg:['#12002e','#3a0ca3'],
    svg:'<circle cx="50" cy="50" r="24" fill="none" stroke="#F72585" stroke-width="3"/>'+
        '<circle cx="50" cy="50" r="16" fill="none" stroke="#4CC9F0" stroke-width="2.5"/>'+
        '<circle cx="50" cy="50" r="7" fill="#F72585"/>'+
        '<path d="M50 14v10M50 76v10M14 50h10M76 50h10" stroke="#4CC9F0" stroke-width="3" stroke-linecap="round"/>' },
  { id:'fut3', name:'Hologramme', cat:'futuristic', bg:['#001220','#003554'],
    svg:'<path d="M50 22l22 14v28L50 78 28 64V36z" fill="none" stroke="#00CED1" stroke-width="2.5"/>'+
        '<path d="M50 34l12 8v16l-12 8-12-8V42z" fill="#00CED1" opacity=".35"/>'+
        '<circle cx="50" cy="50" r="4" fill="#00CED1"/>'+
        '<path d="M28 36l22 14 22-14M50 50v28" stroke="#00CED1" stroke-width="1.5" opacity=".6"/>' },
  { id:'fut4', name:'Astro', cat:'futuristic', bg:['#0b132b','#1c2541'],
    svg:'<circle cx="50" cy="44" r="19" fill="#F5F5F0"/>'+
        '<path d="M36 40q14-8 28 0v10q-14 8-28 0z" fill="#1a1a2e"/>'+
        '<path d="M40 44q6-3 12 0" stroke="#00CED1" stroke-width="2" fill="none" opacity=".8"/>'+
        '<path d="M34 66q16-8 32 0v14H34z" fill="#E0E0E0"/>'+
        '<rect x="44" y="70" width="12" height="5" rx="2" fill="#E50914"/>' },
  { id:'fut5', name:'Circuit', cat:'futuristic', bg:['#0a0e17','#16222e'],
    svg:'<g stroke="#00CED1" stroke-width="2" fill="none">'+
        '<path d="M22 30h20v20h16V30h20M22 70h20V50M58 70h20V50"/></g>'+
        '<circle cx="42" cy="30" r="4" fill="#D4AF37"/><circle cx="58" cy="30" r="4" fill="#D4AF37"/>'+
        '<circle cx="42" cy="70" r="4" fill="#E50914"/><circle cx="58" cy="70" r="4" fill="#E50914"/>'+
        '<circle cx="50" cy="50" r="6" fill="#00CED1"/>' }
];

/* ---------- 👤 CLASSIQUE ---------- */
NX_AV.classic = [
  { id:'cla1', name:'Silhouette', cat:'classic', bg:['#263238','#455a64'],
    svg:'<circle cx="50" cy="37" r="16" fill="#CFD8DC"/>'+
        '<path d="M24 82q0-20 26-20t26 20z" fill="#CFD8DC"/>' },
  { id:'cla2', name:'Élégance', cat:'classic', bg:['#1a1a1a','#333'],
    svg:'<circle cx="50" cy="36" r="15" fill="#F5D0A9"/>'+
        '<path d="M32 62q18-10 36 0v20H32z" fill="#F5F5F0"/>'+
        '<path d="M50 62l-8 8 8 12 8-12z" fill="#1a1a1a"/>'+
        '<path d="M42 70l8-8 8 8" stroke="#E50914" stroke-width="2.5" fill="none"/>'+
        '<circle cx="44" cy="36" r="2" fill="#1a1a1a"/><circle cx="56" cy="36" r="2" fill="#1a1a1a"/>' },
  { id:'cla3', name:'Monogramme', cat:'classic', bg:['#1a1200','#4a3800'],
    svg:'<circle cx="50" cy="50" r="30" fill="none" stroke="#D4AF37" stroke-width="2.5"/>'+
        '<circle cx="50" cy="50" r="24" fill="none" stroke="#D4AF37" stroke-width="1" opacity=".5"/>'+
        '<text x="50" y="62" font-family="Georgia,serif" font-size="30" font-weight="700" fill="#D4AF37" text-anchor="middle">N</text>' },
  { id:'cla4', name:'Duo', cat:'classic', bg:['#37474f','#546e7a'],
    svg:'<circle cx="38" cy="40" r="12" fill="#B0BEC5"/><path d="M20 76q0-15 18-15t18 15z" fill="#B0BEC5"/>'+
        '<circle cx="62" cy="40" r="12" fill="#ECEFF1"/><path d="M44 76q0-15 18-15t18 15z" fill="#ECEFF1"/>' },
  { id:'cla5', name:'Initiale', cat:'classic', bg:['#4a148c','#7b1fa2'],
    svg:'<circle cx="50" cy="50" r="28" fill="rgba(255,255,255,.12)"/>'+
        '<circle cx="50" cy="50" r="28" fill="none" stroke="#F5F5F0" stroke-width="2" opacity=".5"/>' }
];

/* ---------- 🧒 ENFANTS ---------- */
NX_AV.kids = [
  { id:'kid1', name:'Petit lion', cat:'kids', bg:['#f57f17','#fbc02d'],
    svg:'<circle cx="50" cy="50" r="26" fill="#FF9800"/>'+
        '<circle cx="50" cy="52" r="18" fill="#FFCC80"/>'+
        '<circle cx="43" cy="48" r="2.8" fill="#3E2723"/><circle cx="57" cy="48" r="2.8" fill="#3E2723"/>'+
        '<path d="M50 55l-3 3h6z" fill="#3E2723"/>'+
        '<path d="M44 62q6 5 12 0" stroke="#3E2723" stroke-width="2" fill="none" stroke-linecap="round"/>'+
        '<circle cx="34" cy="36" r="7" fill="#FF9800"/><circle cx="66" cy="36" r="7" fill="#FF9800"/>' },
  { id:'kid2', name:'Zèbre', cat:'kids', bg:['#00695c','#4db6ac'],
    svg:'<circle cx="50" cy="50" r="24" fill="#F5F5F0"/>'+
        '<path d="M34 36q8 6 4 14M62 34q-8 8-4 16M40 66q10 4 20 0" stroke="#212121" stroke-width="4" fill="none" stroke-linecap="round"/>'+
        '<circle cx="43" cy="48" r="3" fill="#212121"/><circle cx="57" cy="48" r="3" fill="#212121"/>'+
        '<ellipse cx="50" cy="60" rx="6" ry="4" fill="#212121"/>'+
        '<path d="M38 28l4 8M62 28l-4 8" stroke="#212121" stroke-width="4" stroke-linecap="round"/>' },
  { id:'kid3', name:'Étoile', cat:'kids', bg:['#1a237e','#3949ab'],
    svg:'<path d="M50 20l9 20 22 3-16 15 4 22-19-11-19 11 4-22-16-15 22-3z" fill="#FFD54F"/>'+
        '<circle cx="44" cy="46" r="2.5" fill="#1a237e"/><circle cx="56" cy="46" r="2.5" fill="#1a237e"/>'+
        '<path d="M45 54q5 5 10 0" stroke="#1a237e" stroke-width="2" fill="none" stroke-linecap="round"/>' },
  { id:'kid4', name:'Poisson', cat:'kids', bg:['#01579b','#0288d1'],
    svg:'<ellipse cx="46" cy="50" rx="22" ry="16" fill="#4FC3F7"/>'+
        '<path d="M68 50l14-11v22z" fill="#29B6F6"/>'+
        '<circle cx="36" cy="46" r="3.5" fill="#01579b"/>'+
        '<path d="M30 54q6 4 12 1" stroke="#01579b" stroke-width="2" fill="none" stroke-linecap="round"/>'+
        '<circle cx="58" cy="42" r="3" fill="#81D4FA"/><circle cx="62" cy="54" r="2.5" fill="#81D4FA"/>' },
  { id:'kid5', name:'Fusée', cat:'kids', bg:['#311b92','#5e35b1'],
    svg:'<path d="M50 20q10 14 10 30v14H40V50q0-16 10-30z" fill="#F5F5F0"/>'+
        '<circle cx="50" cy="42" r="6" fill="#4FC3F7"/>'+
        '<path d="M40 58l-10 12h10zM60 58l10 12H60z" fill="#E50914"/>'+
        '<path d="M44 64h12l-3 14h-6z" fill="#FF9800"/>' },
  { id:'kid6', name:'Perroquet', cat:'kids', bg:['#004d40','#00897b'],
    svg:'<ellipse cx="50" cy="52" rx="18" ry="22" fill="#43A047"/>'+
        '<circle cx="50" cy="34" r="13" fill="#66BB6A"/>'+
        '<circle cx="46" cy="32" r="2.8" fill="#1B5E20"/>'+
        '<path d="M58 34q8 2 6 8-6 0-8-4z" fill="#FF9800"/>'+
        '<path d="M32 46q-8 12 4 22" stroke="#E53935" stroke-width="6" fill="none" stroke-linecap="round"/>'+
        '<path d="M50 22q4-8 10-4-4 4-10 6z" fill="#FDD835"/>' }
];

/* ---------- ⭐ PREMIUM ---------- */
NX_AV.premium = [
  { id:'pre1', name:'Or NETLUXE', cat:'premium', bg:['#3e2723','#1a1200'],
    svg:'<circle cx="50" cy="50" r="30" fill="none" stroke="#D4AF37" stroke-width="3"/>'+
        '<path d="M50 24l7 16 17 2-13 12 3 17-14-9-14 9 3-17-13-12 17-2z" fill="#D4AF37"/>'+
        '<circle cx="50" cy="47" r="5" fill="#1a1200"/>' },
  { id:'pre2', name:'Diamant', cat:'premium', bg:['#0d1b2a','#1b263b'],
    svg:'<path d="M50 22l24 20-24 36-24-36z" fill="#00CED1" opacity=".85"/>'+
        '<path d="M50 22l24 20H26z" fill="#4DD0E1"/>'+
        '<path d="M26 42h48L50 78z" fill="#00ACC1"/>'+
        '<path d="M50 22v56M38 42l12 36M62 42L50 78" stroke="#E0F7FA" stroke-width="1.2" opacity=".7"/>' },
  { id:'pre3', name:'Couronne', cat:'premium', bg:['#4a148c','#1a0033'],
    svg:'<path d="M26 62l4-26 12 12 8-18 8 18 12-12 4 26z" fill="#D4AF37"/>'+
        '<rect x="26" y="62" width="48" height="9" rx="3" fill="#B8942E"/>'+
        '<circle cx="34" cy="40" r="3.5" fill="#E50914"/><circle cx="50" cy="34" r="4" fill="#00CED1"/>'+
        '<circle cx="66" cy="40" r="3.5" fill="#E50914"/>' },
  { id:'pre4', name:'Signature', cat:'premium', bg:['#141414','#2a2a2a'],
    svg:'<rect x="18" y="30" width="64" height="40" rx="5" fill="none" stroke="#D4AF37" stroke-width="2"/>'+
        '<text x="50" y="49" font-family="Georgia,serif" font-size="14" font-weight="700" fill="#F5F5F0" text-anchor="middle">NET</text>'+
        '<text x="50" y="63" font-family="Georgia,serif" font-size="14" font-weight="700" fill="#E50914" text-anchor="middle">LUXE</text>' }
];
