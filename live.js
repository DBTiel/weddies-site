// Echte wedstrijden van vandaag op de voorpagina: de teller boven de band en de band zelf.
// Bron: dezelfde openbare bestanden als de app (GitHub Pages van weddies-data). Lukt het ophalen niet,
// dan blijft de band met competitienamen gewoon staan.
(function () {
  var BRON = "https://kithaversweddies.github.io/weddies-data/wedstrijden/";
  // Vlag per land (naam zoals in de bestanden). De bestanden bevatten precies de competities die Weddies volgt,
  // dus we tellen alles, net als de app. Eerst stond hier een vaste lijst van 100 competities: die liep achter
  // toen er landen bijkwamen (site 31 wedstrijden, app 43).
  var VLAG = {"Netherlands": "nl", "Belgium": "be", "Germany": "de", "England": "eng", "Scotland": "sco", "France": "fr", "Spain": "es", "Italy": "it", "Denmark": "dk", "Portugal": "pt", "Austria": "at", "Switzerland": "ch", "Poland": "pl", "Czech-Republic": "cz", "Sweden": "se", "Norway": "no"};
  var LIVE = { "1H": 1, "HT": 1, "2H": 1, "ET": 1, "BT": 1, "P": 1, "LIVE": 1, "INT": 1 };
  var KLAAR = { "FT": 1, "AET": 1, "PEN": 1, "PST": 1, "CANC": 1, "ABD": 1, "AWD": 1, "WO": 1 };

  var titel = document.getElementById("band-titel");
  var spoor = document.querySelector(".band-spoor");
  if (!titel || !spoor) return;

  function datum(plus) {
    var d = new Date(Date.now() + plus * 864e5);
    // de bestanden zijn per Nederlandse datum
    return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Amsterdam" }).format(d);
  }
  function haal(dag) {
    return fetch(BRON + dag + ".json?t=" + Math.floor(Date.now() / 6e4), { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : { wedstrijden: [] }; })
      .then(function (j) {
        var comps = j.competities || {};
        return (j.wedstrijden || []).map(function (m) {
          var c = comps[m.competitie] || {};
          m.ligaNaam = c.naam || ""; m.vlag = VLAG[c.land] || ""; return m;
        });
      });
  }
  function T() { return (window.TEKSTEN || {})[document.documentElement.lang] || {}; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  var staat = null; // { vandaag: [...], morgen: [...] }

  function telTekst() {
    // Speelt er vandaag weinig (doordeweeks, of 's avonds laat), dan tellen we morgen.
    // In de band zelf staat alleen vlag, tijd en clubs (zonder "morgen").
    var t = T(), lijst = staat.vandaag, sleutel = "band_vandaag";
    if (lijst.length < 5 && staat.morgen.length > lijst.length) { lijst = staat.morgen; sleutel = "band_morgen"; }
    if (!lijst.length || !t[sleutel]) return null;
    var landen = {};
    lijst.forEach(function (m) { landen[m.vlag || m.ligaNaam] = 1; });
    var k = Object.keys(landen).length;
    var nf = new Intl.NumberFormat(document.documentElement.lang);
    return t[sleutel].replace("{n}", nf.format(lijst.length)).replace("{k}", nf.format(k))
      .replace("{landen}", k === 1 ? t.band_land1 : t.band_landen);
  }

  function tijd(m) {
    return new Intl.DateTimeFormat(document.documentElement.lang, { hour: "2-digit", minute: "2-digit" }).format(new Date(m.aftrap));
  }

  function bouwBand() {
    var t = T();
    var nu = Date.now();
    var komend = staat.vandaag.filter(function (m) { return !KLAAR[m.status] && (LIVE[m.status] || new Date(m.aftrap).getTime() > nu - 15 * 6e4); });
    // Elk vakje: vlag + competitie + tijd (of LIVE en stand), daaronder thuis vs uit
    function vakje(m) {
      var live = LIVE[m.status];
      var info = live
        ? '<span class="live">' + esc(t.band_live || "LIVE") + "</span>" + (m.stand ? '<span class="tijd">' + m.stand[0] + "–" + m.stand[1] + "</span>" : "")
        : '<span class="tijd">' + esc(tijd(m)) + "</span>";
      return { html: (m.vlag ? '<img class="vlag" src="img/vlag/' + m.vlag + '.svg" alt="" width="24" height="16">' : "") +
        '<span class="wedstrijd"><span class="regel1"><span class="liga">' + esc(m.ligaNaam) + "</span>" + info + "</span>" +
        '<span class="regel2">' + esc(m.thuis.naam) + ' <span class="vs">vs</span> ' + esc(m.uit.naam) + "</span></span>" };
    }
    var items = komend.slice(0, 40).map(vakje);
    if (items.length < 8) {
      staat.morgen.slice(0, 30 - items.length).forEach(function (m) { items.push(vakje(m)); });
    }
    if (items.length < 6) return; // te weinig: de competitienamen blijven staan
    var html = items.map(function (i) { return "<li>" + i.html + "</li>"; }).join("");
    var kopie = items.map(function (i) { return '<li aria-hidden="true">' + i.html + "</li>"; }).join("");
    var rustig = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    spoor.innerHTML = html + (rustig ? "" : kopie);
    spoor.style.animationDuration = Math.max(40, items.length * 4.5) + "s";
    spoor.classList.add("wedstrijden");
  }

  function zet() {
    if (!staat) return;
    var tekst = telTekst();
    if (tekst) titel.textContent = tekst;
    bouwBand();
  }

  Promise.all([haal(datum(0)), haal(datum(1))]).then(function (r) {
    staat = { vandaag: r[0], morgen: r[1] };
    zet();
  }).catch(function () { /* geen verbinding: band met competities blijft */ });

  document.addEventListener("taal", function () { zet(); });
})();
