/* ============================================
   NETLUXE PLAYER — Structure DOM (injectée)
   ============================================ */
function nxpBuildDOM(){
  if(document.getElementById('nxp')) return;
  var d = document.createElement('div');
  d.className = 'nxp';
  d.id = 'nxp';
  d.innerHTML =
    '<video id="nxpVid" playsinline webkit-playsinline preload="metadata"></video>'+
    '<div class="nxp-dim" id="nxpDim"></div>'+
    '<div class="nxp-veil"></div>'+

    /* zones de geste : gauche=luminosité, milieu=play/pause, droite=volume */
    '<div class="nxp-zones" id="nxpZones">'+
      '<div class="nxp-zone" id="nxpZL"></div>'+
      '<div class="nxp-zone mid" id="nxpZM"></div>'+
      '<div class="nxp-zone" id="nxpZR"></div>'+
    '</div>'+

    /* indicateurs de geste */
    '<div class="nxp-hint l" id="nxpHintBri"><div class="ic">☀</div><div class="bar"><i id="nxpBriBar"></i></div><div class="pc" id="nxpBriPc">100%</div></div>'+
    '<div class="nxp-hint r" id="nxpHintVol"><div class="ic" id="nxpVolIco">🔊</div><div class="bar"><i id="nxpVolBar"></i></div><div class="pc" id="nxpVolPc">100%</div></div>'+
    '<div class="nxp-jump l" id="nxpJumpL"><div class="n">-10s</div><div class="s">◀◀</div></div>'+
    '<div class="nxp-jump r" id="nxpJumpR"><div class="n">+10s</div><div class="s">▶▶</div></div>'+

    /* barre haute */
    '<div class="nxp-top" id="nxpTop">'+
      '<button class="nxp-back" onclick="nxpClose()" aria-label="Retour">←</button>'+
      '<div class="nxp-head"><div class="nxp-ttl" id="nxpTtl">—</div><div class="nxp-sub" id="nxpSub"></div></div>'+
      '<div class="nxp-top-act">'+
        '<button class="nxp-ico" onclick="nxpToggleInfo()" title="Informations">ℹ</button>'+
        '<button class="nxp-ico" id="nxpBtnPanel" onclick="nxpTogglePanel()" title="Paramètres">⚙</button>'+
      '</div>'+
    '</div>'+

    /* centre */
    '<button class="nxp-big" id="nxpBig" onclick="nxpTogglePlay()" aria-label="Lecture">▶</button>'+
    '<div class="nxp-load" id="nxpLoad"><i></i></div>'+

    /* sous-titres */
    '<div class="nxp-cc off" id="nxpCc"><span id="nxpCcTxt"></span></div>'+

    /* bas */
    '<div class="nxp-bot" id="nxpBot">'+
      '<div class="nxp-peek" id="nxpPeek"><b id="nxpPeekLb">Aperçu</b><span id="nxpPeekTm">00:00</span></div>'+
      '<div class="nxp-track" id="nxpTrack">'+
        '<div class="nxp-rail">'+
          '<div class="nxp-buf" id="nxpBuf"></div>'+
          '<div class="nxp-fill" id="nxpFill"></div>'+
          '<div class="nxp-knob" id="nxpKnob"></div>'+
        '</div>'+
      '</div>'+
      '<div class="nxp-row">'+
        '<div class="nxp-grp">'+
          '<button class="nxp-btn" id="nxpPrev" onclick="nxpPrevEp()" title="Épisode précédent">⏮</button>'+
          '<button class="nxp-btn" onclick="nxpSkip(-10)" title="Reculer 10s">⏪</button>'+
          '<button class="nxp-btn pp" id="nxpPP" onclick="nxpTogglePlay()" title="Lecture/Pause">▶</button>'+
          '<button class="nxp-btn" onclick="nxpSkip(10)" title="Avancer 10s">⏩</button>'+
          '<button class="nxp-btn" id="nxpNext" onclick="nxpNextEp()" title="Épisode suivant">⏭</button>'+
          '<div class="nxp-vol" id="nxpVolWrap">'+
            '<button class="nxp-btn" id="nxpMute" onclick="nxpToggleMute()" title="Volume">🔊</button>'+
            '<div class="nxp-vol-sl"><input type="range" id="nxpVolSl" min="0" max="100" value="100" oninput="nxpSetVol(this.value/100)"></div>'+
          '</div>'+
          '<span class="nxp-time" id="nxpTime"><b>00:00</b> / 00:00</span>'+
        '</div>'+
        '<div class="nxp-grp r">'+
          '<button class="nxp-btn hide-xs" id="nxpCcBtn" onclick="nxpToggleCc()" title="Sous-titres" style="font-size:13px;font-weight:700">CC</button>'+
          '<button class="nxp-btn hide-xs" onclick="nxpOpenPanel(\'speed\')" title="Vitesse" style="font-size:12.5px;font-weight:700" id="nxpSpdBtn">1×</button>'+
          '<button class="nxp-btn" onclick="nxpTogglePanel()" title="Paramètres">⚙</button>'+
          '<button class="nxp-btn" id="nxpFsBtn" onclick="nxpToggleFs()" title="Plein écran">⛶</button>'+
        '</div>'+
      '</div>'+
    '</div>'+

    /* panneau paramètres */
    '<div class="nxp-panel" id="nxpPanel">'+
      '<div class="nxp-ph" id="nxpPh"><button class="bk" onclick="nxpOpenPanel(\'root\')">←</button><h4 id="nxpPhT">Paramètres</h4></div>'+
      '<div class="nxp-pb" id="nxpPb"></div>'+
    '</div>'+

    /* fiche info */
    '<div class="nxp-info" id="nxpInfo">'+
      '<button class="nxp-info-x" onclick="nxpToggleInfo()">✕</button>'+
      '<div class="nxp-info-in" id="nxpInfoIn"></div>'+
    '</div>'+

    /* carton épisode suivant */
    '<div class="nxp-next" id="nxpNextCard">'+
      '<div class="lb">Épisode suivant</div>'+
      '<div class="tt" id="nxpNcT">—</div>'+
      '<div class="mt" id="nxpNcM"></div>'+
      '<div class="bar"><i id="nxpNcBar"></i></div>'+
      '<div class="row">'+
        '<button class="go" onclick="nxpNextEp()">Lire maintenant</button>'+
        '<button class="no" onclick="nxpCancelNext()">Annuler</button>'+
      '</div>'+
    '</div>'+

    /* aide rotation */
    '<div class="nxp-rot" id="nxpRot">📱 Tournez pour le plein écran</div>'+
    '<div class="nxp-toast" id="nxpToast"></div>';

  document.body.appendChild(d);
}
