# Samspire · The Mushroom Café

Concept website for **Samspire – The Mushroom Café**, India's first mushroom café, in Baner, Pune (with a farm outlet on Pawana Dam Road, Maval).

**Live demo:** https://matzo02.github.io/samspire-mushroom-cafe/

## Stack

Plain HTML, CSS and vanilla JS. No build step. Hosted on GitHub Pages.

```
index.html          page markup
assets/styles.css   all styles (colour tokens at the top)
assets/main.js      menu tabs, signature cards, mobile nav
assets/menu.js      menu data: edit this to update dishes and prices
assets/favicon.svg
```

## Run locally

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Updating the menu

The current menu is a **sample** written for the demo. Replace the items in `assets/menu.js` with the café's real menu. Items tagged `"chef"` are shown automatically in the "Signatures" section.

## To do before going live

- Real menu and prices
- Phone number / WhatsApp link and full opening hours
- Real food and interior photos (the site currently uses illustrations)
- Confirm the Google Maps pin
