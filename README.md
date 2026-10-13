# Samspire · The Mushroom Café

Concept website for **Samspire – The Mushroom Café**, India's first mushroom café, in Baner, Pune (with a farm outlet on Pawana Dam Road, Maval).

**Live demo:** https://matzo02.github.io/samspire-mushroom-cafe/

## Stack

Next.js 16 (App Router, TypeScript), exported as a static site and deployed to GitHub Pages by `.github/workflows/deploy.yml` on every push to `main`.

```
app/layout.tsx      fonts (Fraunces + Inter) and page metadata
app/page.tsx        the page sections
app/globals.css     all styles (colour tokens at the top)
app/icon.svg        favicon
components/         Nav, MenuTabs (client components), Mushroom illustration
data/menu.ts        menu data: edit this to update dishes and prices
data/site.ts        links, address details, hours
```

## Run locally

```sh
npm install
npm run dev        # http://localhost:3000
npm run build      # static export to out/
```

## Updating the menu

The current menu is a **sample** written for the demo. Replace the items in `data/menu.ts` with the café's real menu. Items tagged `"chef"` are shown automatically in the "Signatures" section.

## To do before going live

- Real menu and prices
- Phone number / WhatsApp link and full opening hours
- Real food and interior photos (the site currently uses illustrations)
- Confirm the Google Maps pin
