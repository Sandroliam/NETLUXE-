/* ============================================
   NETLUXE — Avatars portraits (style référence)
   Composition de l'image de référence : cadrage
   buste, fond uni coloré, personnages caribéens.

   Fonds relevés sur la référence :
     Sandro  sombre  · Maya rose saumon
     Junior  bleu vif · Enfants violet

   NOTE : NX_AV est un objet de TABLEAUX par catégorie.
   ============================================ */
NX_AV.portrait = [

/* ---------- SANDRO — adulte, chemise vert olive ---------- */
{ id:'por1', name:'Sandro', cat:'portrait', svg:
'<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">'+
'<defs><radialGradient id="pra" cx="50%" cy="34%" r="76%">'+
'<stop offset="0%" stop-color="#3C3C3C"/><stop offset="100%" stop-color="#181818"/>'+
'</radialGradient></defs>'+
'<rect width="100" height="100" fill="url(#pra)"/>'+
'<path d="M14 100c0-19 16-27 36-27s36 8 36 27z" fill="#7D8451"/>'+
'<path d="M41 79l9 14 9-14-9-6z" fill="#5C6339"/>'+
'<path d="M42 62h16v13l-8 5-8-5z" fill="#8B5E3C"/>'+
'<ellipse cx="50" cy="45" rx="17" ry="20" fill="#A06B42"/>'+
'<path d="M33 42c-1-13 7-21 17-21s18 8 17 21c-2-6-5-9-8-10-3 3-6 4-9 4s-6-1-9-4c-3 1-6 4-8 10z" fill="#1C1410"/>'+
'<circle cx="38" cy="29" r="4" fill="#1C1410"/><circle cx="46" cy="26" r="4.5" fill="#1C1410"/>'+
'<circle cx="54" cy="26" r="4.5" fill="#1C1410"/><circle cx="62" cy="29" r="4" fill="#1C1410"/>'+
'<path d="M36 50c1 9 6 15 14 15s13-6 14-15c-2 8-7 12-14 12s-12-4-14-12z" fill="#1C1410" opacity=".45"/>'+
'<path d="M40 41c2-1.5 5-1.5 7 0" stroke="#1C1410" stroke-width="2" fill="none" stroke-linecap="round"/>'+
'<path d="M53 41c2-1.5 5-1.5 7 0" stroke="#1C1410" stroke-width="2" fill="none" stroke-linecap="round"/>'+
'<ellipse cx="43.5" cy="46" rx="2.6" ry="2.2" fill="#fff"/>'+
'<ellipse cx="56.5" cy="46" rx="2.6" ry="2.2" fill="#fff"/>'+
'<circle cx="43.8" cy="46" r="1.5" fill="#2C1A0E"/><circle cx="56.2" cy="46" r="1.5" fill="#2C1A0E"/>'+
'<path d="M50 48v5" stroke="#8B5E3C" stroke-width="1.6" stroke-linecap="round"/>'+
'<path d="M43 56q7 7 14 0z" fill="#fff"/>'+
'<path d="M43 56q7 7 14 0" stroke="#6B3F26" stroke-width="1.2" fill="none" stroke-linecap="round"/>'+
'</svg>' },

/* ---------- MAYA — adolescente, afro, fond rose saumon ---------- */
{ id:'por2', name:'Maya', cat:'portrait', svg:
'<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">'+
'<rect width="100" height="100" fill="#F0A090"/>'+
'<path d="M14 100c0-19 16-27 36-27s36 8 36 27z" fill="#F7C0B0"/>'+
'<path d="M50 73l-7 5 7 11 7-11z" fill="#E89684"/>'+
'<path d="M43 62h14v12l-7 5-7-5z" fill="#8B5E3C"/>'+
'<circle cx="50" cy="40" r="25" fill="#17110D"/>'+
'<circle cx="30" cy="36" r="10" fill="#17110D"/><circle cx="70" cy="36" r="10" fill="#17110D"/>'+
'<circle cx="34" cy="24" r="9" fill="#17110D"/><circle cx="66" cy="24" r="9" fill="#17110D"/>'+
'<circle cx="50" cy="18" r="10" fill="#17110D"/>'+
'<circle cx="26" cy="46" r="8" fill="#17110D"/><circle cx="74" cy="46" r="8" fill="#17110D"/>'+
'<ellipse cx="50" cy="45" rx="16" ry="19" fill="#A06B42"/>'+
'<circle cx="32" cy="51" r="4.5" fill="none" stroke="#E6B800" stroke-width="2.2"/>'+
'<circle cx="68" cy="51" r="4.5" fill="none" stroke="#E6B800" stroke-width="2.2"/>'+
'<path d="M41 40c2-1.5 5-1.5 7 0" stroke="#17110D" stroke-width="1.8" fill="none" stroke-linecap="round"/>'+
'<path d="M52 40c2-1.5 5-1.5 7 0" stroke="#17110D" stroke-width="1.8" fill="none" stroke-linecap="round"/>'+
'<ellipse cx="44" cy="45" rx="2.6" ry="2.3" fill="#fff"/>'+
'<ellipse cx="56" cy="45" rx="2.6" ry="2.3" fill="#fff"/>'+
'<circle cx="44.2" cy="45" r="1.5" fill="#2C1A0E"/><circle cx="55.8" cy="45" r="1.5" fill="#2C1A0E"/>'+
'<path d="M50 47v4" stroke="#8B5E3C" stroke-width="1.5" stroke-linecap="round"/>'+
'<path d="M44 55q6 6 12 0z" fill="#fff"/>'+
'<path d="M44 55q6 6 12 0" stroke="#8E4A38" stroke-width="1.2" fill="none" stroke-linecap="round"/>'+
'</svg>' },

/* ---------- JUNIOR — garçon, polo rayé, fond bleu vif ---------- */
{ id:'por3', name:'Junior', cat:'portrait', svg:
'<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">'+
'<rect width="100" height="100" fill="#2E7FE8"/>'+
'<path d="M14 100c0-19 16-27 36-27s36 8 36 27z" fill="#1B3A6B"/>'+
'<path d="M16 82h68v5H16z" fill="#F5F5F0"/>'+
'<path d="M15 90h70v4H15z" fill="#E6B800"/>'+
'<path d="M14 97h72v3H14z" fill="#F5F5F0"/>'+
'<path d="M42 78l8 10 8-10-8-5z" fill="#152E56"/>'+
'<path d="M43 63h14v11l-7 4-7-4z" fill="#7A4E30"/>'+
'<ellipse cx="50" cy="45" rx="18" ry="19" fill="#8F5C38"/>'+
'<circle cx="31" cy="46" r="3.5" fill="#8F5C38"/><circle cx="69" cy="46" r="3.5" fill="#8F5C38"/>'+
'<path d="M32 43c-1-13 8-20 18-20s19 7 18 20c-2-7-6-10-9-11-3 3-6 4-9 4s-6-1-9-4c-3 1-7 4-9 11z" fill="#140F0B"/>'+
'<circle cx="37" cy="30" r="4" fill="#140F0B"/><circle cx="45" cy="27" r="4.5" fill="#140F0B"/>'+
'<circle cx="55" cy="27" r="4.5" fill="#140F0B"/><circle cx="63" cy="30" r="4" fill="#140F0B"/>'+
'<path d="M40 40c2-1.5 5-1.5 7 0" stroke="#140F0B" stroke-width="1.8" fill="none" stroke-linecap="round"/>'+
'<path d="M53 40c2-1.5 5-1.5 7 0" stroke="#140F0B" stroke-width="1.8" fill="none" stroke-linecap="round"/>'+
'<ellipse cx="43" cy="45" rx="3" ry="2.6" fill="#fff"/>'+
'<ellipse cx="57" cy="45" rx="3" ry="2.6" fill="#fff"/>'+
'<circle cx="43.3" cy="45" r="1.7" fill="#2C1A0E"/><circle cx="56.7" cy="45" r="1.7" fill="#2C1A0E"/>'+
'<circle cx="42.4" cy="44.2" r=".6" fill="#fff"/><circle cx="55.8" cy="44.2" r=".6" fill="#fff"/>'+
'<path d="M50 47v3.5" stroke="#7A4E30" stroke-width="1.5" stroke-linecap="round"/>'+
'<path d="M42 54q8 9 16 0z" fill="#fff"/>'+
'<path d="M42 54q8 9 16 0" stroke="#6B3F26" stroke-width="1.3" fill="none" stroke-linecap="round"/>'+
'<circle cx="35" cy="52" r="3" fill="#C4785A" opacity=".38"/>'+
'<circle cx="65" cy="52" r="3" fill="#C4785A" opacity=".38"/>'+
'</svg>' },

/* ---------- ENFANTS — panda qui salue, fond violet ---------- */
{ id:'por4', name:'Panda Kids', cat:'portrait', svg:
'<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">'+
'<rect width="100" height="100" fill="#7C5CD6"/>'+
'<ellipse cx="50" cy="84" rx="24" ry="20" fill="#F7F7F5"/>'+
'<ellipse cx="27" cy="80" rx="8" ry="12" fill="#1C1C1C" transform="rotate(-18 27 80)"/>'+
'<ellipse cx="76" cy="60" rx="7" ry="12" fill="#1C1C1C" transform="rotate(28 76 60)"/>'+
'<circle cx="81" cy="50" r="7.5" fill="#1C1C1C"/>'+
'<circle cx="78" cy="45" r="2" fill="#4A4A4A"/><circle cx="82.5" cy="44" r="2" fill="#4A4A4A"/>'+
'<circle cx="86" cy="47" r="2" fill="#4A4A4A"/>'+
'<circle cx="31" cy="26" r="9" fill="#1C1C1C"/>'+
'<circle cx="69" cy="26" r="9" fill="#1C1C1C"/>'+
'<circle cx="50" cy="45" r="26" fill="#F7F7F5"/>'+
'<ellipse cx="39" cy="43" rx="9" ry="10.5" fill="#1C1C1C" transform="rotate(-12 39 43)"/>'+
'<ellipse cx="61" cy="43" rx="9" ry="10.5" fill="#1C1C1C" transform="rotate(12 61 43)"/>'+
'<circle cx="39" cy="44" r="4.6" fill="#fff"/>'+
'<circle cx="61" cy="44" r="4.6" fill="#fff"/>'+
'<circle cx="39.6" cy="44.6" r="2.8" fill="#161616"/>'+
'<circle cx="60.4" cy="44.6" r="2.8" fill="#161616"/>'+
'<circle cx="38.2" cy="43" r="1.3" fill="#fff"/>'+
'<circle cx="59" cy="43" r="1.3" fill="#fff"/>'+
'<ellipse cx="50" cy="55" rx="9" ry="7" fill="#fff"/>'+
'<ellipse cx="50" cy="53" rx="3.4" ry="2.6" fill="#1C1C1C"/>'+
'<path d="M50 56v2.5" stroke="#1C1C1C" stroke-width="1.5" stroke-linecap="round"/>'+
'<path d="M44 59q6 5 6 0" fill="none" stroke="#1C1C1C" stroke-width="1.6" stroke-linecap="round"/>'+
'<path d="M50 59q0 5 6 0" fill="none" stroke="#1C1C1C" stroke-width="1.6" stroke-linecap="round"/>'+
'<circle cx="31" cy="55" r="3.6" fill="#FF9AAF" opacity=".5"/>'+
'<circle cx="69" cy="55" r="3.6" fill="#FF9AAF" opacity=".5"/>'+
'</svg>' }

];
