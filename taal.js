// Taal kiezen voor alle pagina's van weddiesapp.com.
// Volgorde: ?lang=… in de link, dan de eerder gekozen taal, dan de taal van de browser, anders Engels.
// Teksten staan per pagina in window.TEKSTEN (data-t="sleutel", data-t-alt="sleutel" voor alt-teksten),
// lange teksten in blokken met data-lang="nl|en|de".
(function () {
  var TALEN = ["nl", "en", "de"];
  // Teksten die op elke pagina staan (voettekst); per pagina aangevuld met window.TEKSTEN
  var GEDEELD = {
    nl: { v_omschrijving: "Voetbalwedstrijden bij jou in de buurt en een logboek van elk stadion dat je bezoekt.",
          v_app: "App", v_functies: "Functies", v_support: "Support", v_juridisch: "Juridisch",
          v_privacy: "Privacybeleid", v_voorwaarden: "Gebruiksvoorwaarden", v_contact: "Contact",
          v_merken: "Clubnamen en -logo’s zijn eigendom van de betreffende clubs. Apple, iPhone en App Store zijn handelsmerken van Apple Inc. Google Play is een handelsmerk van Google LLC.",
          nav_functies: "Functies", nav_support: "Support", kop_store: "Binnenkort in de App Store",
          klok_aftrap: "Aftrap", klok_rust: "Rust", klok_einde: "Einde", goal: "GOAL!" },
    en: { v_omschrijving: "Football near you, and a log of every ground you visit.",
          v_app: "App", v_functies: "Features", v_support: "Support", v_juridisch: "Legal",
          v_privacy: "Privacy policy", v_voorwaarden: "Terms of use", v_contact: "Contact",
          v_merken: "Club names and crests belong to their respective clubs. Apple, iPhone and App Store are trademarks of Apple Inc. Google Play is a trademark of Google LLC.",
          nav_functies: "Features", nav_support: "Support", kop_store: "Coming soon to the App Store",
          klok_aftrap: "Kick-off", klok_rust: "Half-time", klok_einde: "Full-time", goal: "GOAL!" },
    de: { v_omschrijving: "Fußballspiele in deiner Nähe und ein Logbuch für jedes Stadion, das du besuchst.",
          v_app: "App", v_functies: "Funktionen", v_support: "Support", v_juridisch: "Rechtliches",
          v_privacy: "Datenschutz", v_voorwaarden: "Nutzungsbedingungen", v_contact: "Kontakt",
          v_merken: "Vereinsnamen und -wappen gehören den jeweiligen Vereinen. Apple, iPhone und App Store sind Marken der Apple Inc. Google Play ist eine Marke der Google LLC.",
          nav_functies: "Funktionen", nav_support: "Support", kop_store: "Demnächst im App Store",
          klok_aftrap: "Anpfiff", klok_rust: "Halbzeit", klok_einde: "Abpfiff", goal: "TOR!" }
  };
  var EIGEN = window.TEKSTEN || {};
  var T = {};
  TALEN.forEach(function (t) { T[t] = Object.assign({}, GEDEELD[t], EIGEN[t] || {}); });

  function bewaard() { try { return localStorage.getItem("taal"); } catch (e) { return null; } }
  function bewaar(t) { try { localStorage.setItem("taal", t); } catch (e) {} }

  function kies() {
    var q = (new URLSearchParams(location.search).get("lang") || "").toLowerCase();
    if (TALEN.indexOf(q) >= 0) return q;
    var b = bewaard();
    if (TALEN.indexOf(b) >= 0) return b;
    var lijst = navigator.languages || [navigator.language || ""];
    for (var i = 0; i < lijst.length; i++) {
      var t = String(lijst[i]).slice(0, 2).toLowerCase();
      if (TALEN.indexOf(t) >= 0) return t;
    }
    return "en";
  }

  function zet(taal) {
    document.documentElement.lang = taal;
    var t = T[taal] || {};
    document.querySelectorAll("[data-t]").forEach(function (el) {
      var k = el.getAttribute("data-t");
      if (t[k] != null) el.textContent = t[k];
    });
    document.querySelectorAll("[data-t-alt]").forEach(function (el) {
      var k = el.getAttribute("data-t-alt");
      if (t[k] != null) el.alt = t[k];
    });
    document.querySelectorAll("[data-lang]").forEach(function (el) {
      el.classList.toggle("aan", el.getAttribute("data-lang") === taal);
    });
    document.querySelectorAll(".talen button").forEach(function (knop) {
      knop.setAttribute("aria-pressed", knop.getAttribute("data-kies") === taal ? "true" : "false");
    });
    if (t.titel) document.title = t.titel;
    var d = document.querySelector('meta[name="description"]');
    if (d && t.omschrijving) d.setAttribute("content", t.omschrijving);
    document.dispatchEvent(new CustomEvent("taal", { detail: taal }));
  }

  document.querySelectorAll(".talen button").forEach(function (knop) {
    knop.addEventListener("click", function () {
      var taal = knop.getAttribute("data-kies");
      bewaar(taal);
      zet(taal);
    });
  });

  window.WeddiesTaal = {
    huidig: function () { return document.documentElement.lang; },
    tekst: function (k) { return (T[document.documentElement.lang] || {})[k] || ""; }
  };
  zet(kies());
})();
