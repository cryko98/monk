# Monk — $monk

Landing page for **Monk**, a monkey monk meme coin on Solana.

Plain static site: one HTML file, one stylesheet, one script, no build step and no
dependencies. Drop it on GitHub Pages, Netlify, Vercel or any static host.

```
index.html
assets/
  css/style.css
  js/main.js
  img/            optimised images + favicons
```

## Things you need to fill in

Everything that changes per launch lives at the top of `assets/js/main.js`:

```js
const MONK = {
  ca:       'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // real mint address
  telegram: 'https://t.me/MONKONSOL'
};
```

The contract address is still a placeholder. Both values are injected into every
place they appear (hero, contract section, footer, nav icon), so this is the only
file to touch.

Also worth checking before launch:

- **`index.html` → Four Precepts and the stats strip.** Supply, tax, burned
  liquidity and revoked mint are written there as claims. Make them true, or
  change the wording.
- **Meta tags** in `<head>` — `og:image` currently points at `assets/img/monk-og.jpg`.
  Social platforms need an absolute URL, so once the domain is live replace
  `assets/img/monk-og.jpg` with `https://yourdomain.tld/assets/img/monk-og.jpg`
  in the `og:image` and `twitter:image` tags.

## Local preview

Any static server works, for example:

```bash
npx serve .
```

## Images

The images in `assets/img/` are resized and compressed copies of the original
renders. The full-size sources stay out of the repo — see `.gitignore`.

`monk-hero.jpg` and the favicons are generated from the logo; the rest are the
memes used in the lore and gallery sections.

## Deploying to GitHub Pages

Repository → Settings → Pages → Source: *Deploy from a branch*, branch `main`,
folder `/ (root)`. The site is served from the repository root, no configuration
file needed.
