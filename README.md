# weddiesapp.com

De website van Weddies: een voorpagina (NL/EN/DE) met de privacy-, support- en uitnodigingspagina. Gewone HTML, CSS en
een klein scriptje voor de taal (`taal.js`), zonder bouwstap. GitHub Pages zet de `main`-branch online op
https://weddiesapp.com (`CNAME`).

- `index.html` voorpagina. Zodra de app in de App Store staat: vul `APP_STORE_URL` in, dan wordt de knop klikbaar.
- `privacy.html`, `support.html` drie talen; bij verschil geldt de Nederlandse tekst.
- `vriend.html` uitnodiging voor vrienden (`/vriend?u=<gebruikersnaam>` opent `weddies://vriend?u=…`).
- `beweging.js` meebewegende banner, blokken die verschijnen, band met competities (respecteert "beperk beweging").
- `img/` logo en screenshots (nu Engels: `en-*.jpg`).

Na een wijziging in `style.css`, `taal.js` of `beweging.js`: verhoog `?v=` in de links op alle pagina's, anders gebruiken browsers nog de oude versie uit hun cache.

## Instellingen bovenaan het script in `index.html`
- `APP_STORE_URL`: de App Store-link; dan worden de knoppen klikbaar. Zet dan ook de `apple-itunes-app`-regel in de `<head>` aan.
- `BETA_URL`: openbare TestFlight-link; dan verschijnt "Doe mee aan de bèta".
- `AANMELD_URL` / `AANMELD_SLEUTEL`: mail bij lancering (zie `weddies/appstore/Website - mail bij lancering.md`).
- `SCHERMEN`: welke Nederlandse/Duitse screenshots er zijn (`img/nl-kaart.webp` enz.); anders de Engelse.

## Overige bestanden
- `extra.js` opstelling, stadionkaart, bèta, aanmelden, screenshots per taal. `live.js` wedstrijden van vandaag (uit weddies-data).
- `img/stadionkaart.svg` alle stadions als stippen (gemaakt uit `stadions.json` van de app, zonder de Canarische Eilanden).
- `img/og.jpg` het deelplaatje voor WhatsApp/Instagram.
