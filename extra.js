// Voorpagina: opstelling, stadionkaart, bèta-knop, mail bij lancering en screenshots per taal.
// Wordt vóór taal.js geladen, zodat de "taal"-gebeurtenis bij het openen ook hier aankomt.
(function () {
  function T() { return (window.TEKSTEN || {})[document.documentElement.lang] || {}; }

  // ---------- Opstelling: tik op een speler ----------
  var gekozen = 9;
  var kaart = document.querySelector(".spelerkaart");
  function toonSpeler(nr) {
    gekozen = nr;
    var t = T();
    document.querySelectorAll(".speler").forEach(function (b) {
      b.setAttribute("aria-pressed", String(+b.getAttribute("data-nr") === nr));
    });
    if (!kaart) return;
    kaart.querySelector(".rug").textContent = nr;
    var naam = kaart.querySelector(".spelerkaart-naam"), tekst = kaart.querySelector(".spelerkaart-tekst");
    naam.setAttribute("data-t", "sp" + nr + "_naam");
    tekst.setAttribute("data-t", "sp" + nr + "_tekst");
    naam.textContent = t["sp" + nr + "_naam"] || "";
    tekst.textContent = t["sp" + nr + "_tekst"] || "";
    kaart.classList.remove("wissel"); void kaart.offsetWidth; kaart.classList.add("wissel");
  }
  document.querySelectorAll(".speler").forEach(function (b) {
    b.addEventListener("click", function () { toonSpeler(+b.getAttribute("data-nr")); });
  });

  // ---------- Stadionkaart: laden zodra hij bijna in beeld is; land kiezen ----------
  var eu = document.querySelector(".europa-kaart");
  if (eu) {
    var laad = function () {
      if (eu.dataset.geladen) return;
      eu.dataset.geladen = "1";
      fetch(eu.getAttribute("data-bron")).then(function (r) { return r.text(); })
        .then(function (svg) { if (svg.indexOf("<svg") === 0) eu.innerHTML = svg; }).catch(function () {});
    };
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (e) { if (e[0].isIntersecting) { laad(); io.disconnect(); } }, { rootMargin: "600px" });
      io.observe(eu);
    } else laad();
    var knoppen = document.querySelectorAll(".landen button");
    var kies = function (land) {
      if (land) eu.setAttribute("data-land", land); else eu.removeAttribute("data-land");
      knoppen.forEach(function (k) { k.setAttribute("aria-pressed", String(k.getAttribute("data-land") === land)); });
    };
    var vast = null;
    knoppen.forEach(function (k) {
      var land = k.getAttribute("data-land");
      k.addEventListener("mouseenter", function () { kies(land); });
      k.addEventListener("mouseleave", function () { kies(vast); });
      k.addEventListener("focus", function () { kies(land); });
      k.addEventListener("blur", function () { kies(vast); });
      k.addEventListener("click", function () { vast = vast === land ? null : land; kies(vast); });
    });
  }

  // ---------- Bèta-knop en mail bij lancering (alleen als ze zijn ingesteld in index.html) ----------
  var beta = document.getElementById("beta");
  if (beta && window.BETA_URL) { beta.href = window.BETA_URL; beta.hidden = false; }
  var form = document.getElementById("aanmelden");
  if (form && window.AANMELD_URL && window.AANMELD_SLEUTEL) {
    form.hidden = false;
    var melding = form.querySelector(".aanmelden-melding");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var t = T(), veld = form.querySelector("input"), mail = veld.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail) || mail.length > 254) { melding.textContent = t.mail_ongeldig; return; }
      form.classList.add("bezig");
      fetch(window.AANMELD_URL.replace(/\/$/, "") + "/rest/v1/lancering_aanmeldingen", {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: window.AANMELD_SLEUTEL,
                   Authorization: "Bearer " + window.AANMELD_SLEUTEL, Prefer: "return=minimal" },
        body: JSON.stringify({ email: mail, taal: document.documentElement.lang })
      }).then(function (r) {
        // 409 = staat er al: voor de bezoeker ook gewoon gelukt
        if (!r.ok && r.status !== 409) throw new Error(r.status);
        form.classList.add("klaar"); veld.value = ""; melding.textContent = t.mail_bedankt;
      }).catch(function () { melding.textContent = t.mail_fout; })
        .then(function () { form.classList.remove("bezig"); });
    });
  }

  // ---------- Bij elke taalwissel ----------
  document.addEventListener("taal", function (e) {
    var taal = e.detail, t = T();
    // screenshots in de eigen taal als die er zijn
    var lijst = (window.SCHERMEN || {})[taal] || [];
    document.querySelectorAll("img[data-scherm]").forEach(function (img) {
      var naam = img.getAttribute("data-scherm");
      var bron = "img/" + (lijst.indexOf(naam) >= 0 ? taal : "en") + "-" + naam + ".webp";
      if (img.getAttribute("src") !== bron) img.setAttribute("src", bron);
    });
    // aantallen per land in de stadionkaart
    var nf = new Intl.NumberFormat(taal);
    document.querySelectorAll(".land-meta[data-meta]").forEach(function (el) {
      var d = el.getAttribute("data-meta").split("|");
      el.textContent = (t.eu_meta || "").replace("{c}", nf.format(+d[0])).replace("{s}", nf.format(+d[1]));
    });
    document.querySelectorAll("[data-t-ph]").forEach(function (el) {
      var k = el.getAttribute("data-t-ph"); if (t[k]) el.placeholder = t[k];
    });
    toonSpeler(gekozen);
  });
})();
