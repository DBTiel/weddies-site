// Beweging op de voorpagina: de banner bovenaan, het verschijnen van blokken en de band met competities.
// Alleen transform en opacity (vloeiend, ook op oudere iPhones). Wie "beperk beweging" aan heeft, ziet alles meteen.
(function () {
  var rustig = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Kent de browser scroll-gestuurde CSS-animaties, dan doet style.css de kaart, de lijn en de bal
  var cssScroll = window.CSS && CSS.supports && CSS.supports("animation-timeline: view()");

  // 0. Stadion (bovenaanzicht) rond de telefoons: tribunes, veldlijnen en vier lichtmasten
  var STADION =
    '<svg class="stadion" viewBox="0 0 400 560" aria-hidden="true">' +
    '<defs><radialGradient id="lichtgloed"><stop offset="0" stop-color="#F9F5EB" stop-opacity=".55"/><stop offset="1" stop-color="#F9F5EB" stop-opacity="0"/></radialGradient></defs>' +
    '<rect class="teken tribune" pathLength="1" x="8" y="8" width="384" height="544" rx="150"/>' +
    '<rect class="rijen" x="26" y="26" width="348" height="508" rx="132"/>' +
    '<rect class="teken binnen" pathLength="1" x="44" y="44" width="312" height="472" rx="112"/>' +
    '<g class="veld">' +
      '<rect class="teken" pathLength="1" x="88" y="78" width="224" height="404"/>' +
      '<path class="teken" pathLength="1" d="M88 280H312"/>' +
      '<circle class="teken" pathLength="1" cx="200" cy="280" r="38"/>' +
      '<rect class="teken" pathLength="1" x="134" y="78" width="132" height="64"/>' +
      '<rect class="teken" pathLength="1" x="168" y="78" width="64" height="22"/>' +
      '<path class="teken" pathLength="1" d="M168 142A38 38 0 0 0 232 142"/>' +
      '<rect class="teken" pathLength="1" x="134" y="418" width="132" height="64"/>' +
      '<rect class="teken" pathLength="1" x="168" y="460" width="64" height="22"/>' +
      '<path class="teken" pathLength="1" d="M168 418A38 38 0 0 1 232 418"/>' +
    '</g>' +
    '<g class="lichten">' +
      [[52, 60], [348, 60], [52, 500], [348, 500]].map(function (p) {
        return '<g class="mast"><circle class="lichtgloed" cx="' + p[0] + '" cy="' + p[1] + '" r="26"/><circle class="licht" cx="' + p[0] + '" cy="' + p[1] + '" r="3.5"/></g>';
      }).join("") +
    '</g></svg>';
  document.querySelectorAll(".toestellen").forEach(function (el) {
    el.insertAdjacentHTML("afterbegin", STADION);
  });
  // 1. Banner: groen met vervaging zodra je een stukje scrolt; de kaart op de achtergrond schuift langzamer mee
  var kop = document.getElementById("kopbalk");
  var laag = document.querySelector(".kaartlaag-in");
  var veld = document.querySelector(".kenmerken, .tekstpagina");
  var lijnen = document.querySelectorAll(".zijlijn-lijn");
  var lijn = lijnen[0];
  var bal = document.querySelector(".bal");
  var veldvlak = document.querySelector(".veldvlak");
  var klok = document.querySelector(".klok-tijd");
  var subpagina = document.body.classList.contains("subpagina");
  var gescoord = false, klokTekst = "";
  function tekst(k) { return window.WeddiesTaal && window.WeddiesTaal.tekst ? window.WeddiesTaal.tekst(k) : ""; }

  // Wedstrijdklok in de banner: de pagina is een wedstrijd van 90 minuten
  function zetKlok() {
    if (!klok) return;
    var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    var p = Math.min(1, Math.max(0, window.scrollY / max));
    var min = Math.round(p * 90), t;
    if (p < 0.012) t = tekst("klok_aftrap");
    else if (p > 0.988) t = tekst("klok_einde");
    else if (min >= 45 && min <= 46) t = tekst("klok_rust");
    else t = min + "’";
    if (t !== klokTekst) { klokTekst = t; klok.textContent = t; }
  }
  document.addEventListener("taal", function () { klokTekst = ""; zetKlok(); });

  // Doelpunt: als de lijn het onderste doel bereikt, één keer per bezoek
  function kijkGoal() {
    if (gescoord || !veldvlak) return;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var klaar = subpagina ? window.scrollY >= max - 4 : veldvlak.getBoundingClientRect().bottom <= window.innerHeight * 0.5 + 4;
    if (!klaar) return;
    gescoord = true;
    veldvlak.classList.add("goal");
    setTimeout(function () { veldvlak.classList.remove("goal"); }, 2800);
  }

  // De bal kun je wegtrappen
  if (bal) {
    bal.addEventListener("click", function () {
      bal.classList.remove("trap"); void bal.offsetWidth; bal.classList.add("trap");
    });
    bal.addEventListener("animationend", function (e) { if (e.animationName === "trap") bal.classList.remove("trap"); });
  }

  // Tekstpagina's: de lijn loopt mee met de hele pagina (leeg bovenaan, af onderaan). De bal blijft dan precies op
  // dezelfde hoogte in beeld als de ruimte onder het veld (marge + voettekst) even hoog is als het scherm min de
  // bovenkant van het veld. Anders liep de bal langzaam omhoog uit beeld, vooral op de telefoon.
  var veldTop = 234;
  function ruimteOnder() {
    var tp = document.querySelector(".tekstpagina"), voet = document.querySelector(".voet");
    if (!subpagina || !tp || !voet) return;
    var boven = tp.getBoundingClientRect().top + window.scrollY;
    veldTop = Math.round(boven);
    document.documentElement.style.setProperty("--veldtop", veldTop + "px");
    tp.style.marginBottom = Math.max(40, Math.round(window.innerHeight - boven - voet.offsetHeight)) + "px";
  }
  ruimteOnder();
  window.addEventListener("resize", ruimteOnder, { passive: true });
  window.addEventListener("load", ruimteOnder);

  if (kop) {
    var bezig = false;
    var zet = function () {
      kop.classList.toggle("vast", window.scrollY > 24);
      if (laag && !rustig && !cssScroll) {
        var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        laag.style.transform = "translate3d(0," + (-(window.scrollY / max) * 600).toFixed(1) + "px,0)";
      }
      if (lijn && veld && !rustig && !cssScroll) {
        var r = veld.getBoundingClientRect();
        var h = lijn.parentNode.offsetHeight;
        var p = Math.min(1, Math.max(0, (window.innerHeight * 0.5 - r.top) / h));
        if (subpagina) p = Math.min(1, Math.max(0, (veldTop - r.top) / h));
        for (var k = 0; k < lijnen.length; k++) lijnen[k].style.transform = "scaleY(" + p.toFixed(4) + ")";
        if (bal) {
          bal.parentNode.style.transform = "translate3d(0," + (p * 100).toFixed(3) + "%,0)";
          bal.style.transform = "rotate(" + (p * 2880).toFixed(0) + "deg)";
        }
      }
      zetKlok();
      kijkGoal();
      bezig = false;
    };
    window.addEventListener("scroll", function () {
      if (!bezig) { bezig = true; requestAnimationFrame(zet); }
    }, { passive: true });
    window.addEventListener("resize", zet, { passive: true });
    zet();
  }

  // 2. Blokken verschijnen zacht als ze in beeld komen
  var blokken = document.querySelectorAll(".onthul");
  if (rustig || !("IntersectionObserver" in window)) {
    blokken.forEach(function (b) { b.classList.add("zichtbaar"); });
  } else {
    var kijker = new IntersectionObserver(function (items) {
      items.forEach(function (it) {
        if (it.isIntersecting) { it.target.classList.add("zichtbaar"); kijker.unobserve(it.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    blokken.forEach(function (b) { kijker.observe(b); });
  }

  // 3. Band met competities: lijst één keer verdubbelen, zodat hij naadloos doorloopt
  var spoor = document.querySelector(".band-spoor");
  if (spoor && !rustig) {
    Array.prototype.slice.call(spoor.children).forEach(function (li) {
      var kopie = li.cloneNode(true);
      kopie.setAttribute("aria-hidden", "true");
      spoor.appendChild(kopie);
    });
    spoor.classList.add("loopt");
  }
})();
