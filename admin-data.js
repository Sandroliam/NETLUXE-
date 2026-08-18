/* NETLUXE ADMIN — Data Store (localStorage, partagé avec index.html) */
var DB = {
  K: { users:'netluxe_users', cat:'netluxe_catalog', adm:'netluxe_admin_session', log:'netluxe_audit', lic:'netluxe_licenses' },

  get: function(k, def){
    try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : def; }
    catch(e){ return def; }
  },
  set: function(k, v){
    try { localStorage.setItem(k, JSON.stringify(v)); return true; }
    catch(e){ return false; }
  },

  /* ---- CATALOGUE ---- */
  catalog: function(){
    var c = this.get(this.K.cat, null);
    if(!c || !c.length){ c = SEED_CATALOG.slice(); this.set(this.K.cat, c); }
    return c;
  },
  saveCatalog: function(c){ return this.set(this.K.cat, c); },
  byType: function(t){ return this.catalog().filter(function(x){ return x.type===t; }); },
  find: function(id){
    var c = this.catalog();
    for(var i=0;i<c.length;i++){ if(c[i].id==id) return c[i]; }
    return null;
  },
  upsert: function(item){
    var c = this.catalog(), i;
    if(!item.id){
      var max = 0;
      for(i=0;i<c.length;i++){ if(c[i].id>max) max=c[i].id; }
      item.id = max+1;
      item.createdAt = new Date().toISOString();
      c.push(item);
      this.log('create', 'Contenu créé : '+item.title);
    } else {
      for(i=0;i<c.length;i++){
        if(c[i].id==item.id){
          item.createdAt = c[i].createdAt || new Date().toISOString();
          item.views = c[i].views||0; item.likes = c[i].likes||0;
          c[i] = item; break;
        }
      }
      this.log('update', 'Contenu modifié : '+item.title);
    }
    this.saveCatalog(c);
    return item;
  },
  remove: function(id){
    var c = this.catalog(), out=[], t='';
    for(var i=0;i<c.length;i++){
      if(c[i].id==id){ t=c[i].title; } else { out.push(c[i]); }
    }
    this.saveCatalog(out);
    this.log('delete', 'Contenu supprimé : '+t);
    return out;
  },

  /* ---- UTILISATEURS / PROFILS ---- */
  users: function(){ return this.get(this.K.users, {}); },
  saveUsers: function(u){ return this.set(this.K.users, u); },
  allProfiles: function(){
    var u = this.users(), out=[];
    for(var em in u){
      if(!u.hasOwnProperty(em)) continue;
      var acc = u[em], profs = acc.profiles || [];
      for(var i=0;i<profs.length;i++){
        var p = profs[i];
        out.push({
          id: p.id, name: p.name, color: p.color, photo: p.photo || null,
          email: em, accName: acc.name || em.split('@')[0],
          createdAt: p.createdAt || acc.createdAt,
          prefs: p.prefs || { lang:'FR', audio:'FR', subs:'FR', speed:1 },
          history: p.history || [], list: p.list || [],
          progress: p.progress || {}, lastActive: p.lastActive || p.createdAt,
          isAdmin: !!acc.isAdmin
        });
      }
    }
    return out;
  },
  profile: function(pid){
    var all = this.allProfiles();
    for(var i=0;i<all.length;i++){ if(String(all[i].id)===String(pid)) return all[i]; }
    return null;
  },
  deleteUser: function(email){
    var u = this.users();
    if(u[email]){ delete u[email]; this.saveUsers(u); this.log('delete','Compte supprimé : '+email); }
  },

  /* ---- LICENCES ---- */
  licenses: function(){
    var l = this.get(this.K.lic, null);
    if(!l){ l = SEED_LICENSES.slice(); this.set(this.K.lic, l); }
    return l;
  },
  saveLicenses: function(l){ return this.set(this.K.lic, l); },

  /* ---- AUDIT LOG ---- */
  log: function(action, detail){
    var l = this.get(this.K.log, []);
    l.unshift({ at:new Date().toISOString(), action:action, detail:detail, by:(SESSION.user||'système') });
    if(l.length>120) l = l.slice(0,120);
    this.set(this.K.log, l);
  },
  audit: function(){ return this.get(this.K.log, []); },

  /* ---- STATS ---- */
  stats: function(){
    var c = this.catalog(), p = this.allProfiles(), i;
    var views=0, likes=0;
    for(i=0;i<c.length;i++){ views += (c[i].views||0); likes += (c[i].likes||0); }
    var u = this.users(), nbAcc=0;
    for(var k in u){ if(u.hasOwnProperty(k)) nbAcc++; }
    return {
      accounts: nbAcc, profiles: p.length, contents: c.length,
      films: this.byType('film').length,
      series: this.byType('series').length,
      cartoons: this.byType('cartoon').length,
      views: views, likes: likes,
      revenue: Math.round(nbAcc * 7.99 * 100)/100
    };
  }
};

/* SEED — catalogue initial (aligné sur index.html) */
var SEED_CATALOG = [
  {id:1,title:'Lumière Noire',type:'film',year:2024,genre:'Thriller',rat:4.8,dur:'2h18m',img:'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400',org:true,dir:'Claude L. François',views:24589,likes:1823,audio:['FR','EN'],subs:['FR','EN','ES'],status:'live',desc:'Un détective hanté traque un tueur à Port-au-Prince.'},
  {id:2,title:'Rasin — Racines',type:'film',year:2023,genre:'Drame',rat:4.7,dur:'1h52m',img:'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=400',org:true,dir:'Nadia C. Juste',views:18234,likes:1456,audio:['CR','FR'],subs:['FR','CR','EN'],status:'live',desc:'Une famille haïtienne à travers trois générations.'},
  {id:4,title:'Titad la',type:'film',year:2024,genre:'Drame',rat:4.9,dur:'2h10m',img:'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400',org:true,dir:'Roseline M. Augustin',views:32100,likes:2890,audio:['CR','FR'],subs:['FR','CR'],status:'live',desc:'L\'ascension d\'une femme en politique.'},
  {id:5,title:'Nèg Mawon',type:'film',year:2019,genre:'Historique',rat:4.8,dur:'2h20m',img:'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400',org:true,dir:'L. C. Antoine',views:28900,likes:2345,audio:['CR'],subs:['FR','CR','EN'],status:'live',desc:'L\'histoire d\'un esclave devenu héros.'},
  {id:6,title:'Code Noir',type:'film',year:2024,genre:'Historique',rat:4.7,dur:'2h30m',img:'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400',org:true,dir:'Henri L. François',views:22400,likes:1890,audio:['FR'],subs:['FR','EN'],status:'live',desc:'Les Caraïbes coloniales méconnues.'},
  {id:100,title:'Rue des Jasmins',type:'series',year:2024,genre:'Thriller',rat:4.7,dur:'3 saisons',img:'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',org:true,dir:'Fabien L. Célestin',views:18234,likes:1456,audio:['FR','CR'],subs:['FR','CR','EN'],status:'live',desc:'Série policière à Port-au-Prince.'},
  {id:101,title:'Madan Nou',type:'series',year:2023,genre:'Comédie',rat:4.8,dur:'2 saisons',img:'https://images.unsplash.com/photo-1524813686514-a57563d77965?w=400',org:true,dir:'Cassandre L.',views:15000,likes:1234,audio:['CR','EN'],subs:['FR','CR','EN'],status:'live',desc:'Une famille haïtienne à Miami.'},
  {id:200,title:'Ti Zwa',type:'cartoon',year:2024,genre:'Animation',rat:4.4,dur:'2 saisons',img:'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400',org:true,dir:'Studio Créole',views:12000,likes:987,audio:['FR','CR'],subs:['FR','CR','EN'],status:'live',desc:'Un petit zèbre courageux explore la forêt.'},
  {id:201,title:'Konpè Bètje',type:'cartoon',year:2025,genre:'Animation',rat:4.5,dur:'1 saison',img:'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',org:true,dir:'Studio Créole',views:8400,likes:712,audio:['CR'],subs:['FR','CR'],status:'draft',desc:'Contes créoles animés.'}
];

var SEED_LICENSES = [
  {id:1,title:'Lumière Noire',holder:'NETLUXE Originals',type:'Propriété',start:'2024-01-01',end:'—',territory:'Monde',share:'100% NETLUXE',status:'ok'},
  {id:2,title:'Rasin — Racines',holder:'Nadia C. Juste',type:'Partenariat',start:'2023-06-01',end:'2028-06-01',territory:'Monde',share:'70% créateur / 30% NETLUXE',status:'ok'},
  {id:3,title:'Titad la',holder:'Roseline M. Augustin',type:'Partenariat',start:'2024-03-15',end:'2029-03-15',territory:'Caraïbes + Diaspora',share:'70% créateur / 30% NETLUXE',status:'ok'},
  {id:4,title:'Konpè Bètje',holder:'Studio Créole',type:'Partenariat',start:'2025-01-10',end:'2026-01-10',territory:'Monde',share:'70% créateur / 30% NETLUXE',status:'warn'}
];
