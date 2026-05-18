# Gnosis: A Reading Series

A five-part long-form reading of the Nag Hammadi texts.
Written, designed, and built by Shama Thakur for Sovereign by Source.

Live: deploy to GitHub Pages or any static host.

---

## Files

```
gnosis/
├── index.html       Initiation gate with 5 part cards + guide companion
├── part-1.html      The Black Cube and the Hexagon
├── part-2.html      Sophia
├── part-3.html      Yaldabaoth
├── part-4.html      The Archons
├── part-5.html      Gnosis
├── shared.css       All common styles
├── shared.js        Progress bar, scroll reveal, Sophia AI companion
└── README.md        This file
```

That's it. No build step. No dependencies. No npm. No node. Drag, drop, deploy.

---

## Deploy to GitHub Pages in 5 minutes

1. Create a new public GitHub repo. Name it whatever you want, e.g. `gnosis-series`.
2. Drop all 8 files into the repo root.
3. Commit and push.
4. Repo Settings → Pages → Source: `Deploy from a branch` → Branch: `main` → Folder: `/ (root)` → Save.
5. Wait 1 to 2 minutes. GitHub gives you a URL like `https://shamathakur77.github.io/gnosis-series/`.
6. Open it. The series is live.

To use a custom subdomain like `gnosis.sovereignbysource.com`, add a `CNAME` file containing that subdomain to the repo, then add a CNAME record at your DNS provider pointing to `shamathakur77.github.io`.

---

## The AI companion: the one thing you have to decide

Every part page has a "Sophia" chat companion. She is wired to call Anthropic's API directly from the browser:

```js
fetch('https://api.anthropic.com/v1/messages', { ... })
```

This works perfectly inside the Claude.ai artifact preview because Claude.ai injects authentication.

It will NOT work on GitHub Pages out of the box. The browser will hit the Anthropic API and get a 401 error because no API key is attached.

You have three options. Pick one.

### Option A: Deploy without the companion (ship today, fix later)

Cleanest path if you want the essays live this week. The chat box will simply show an error if anyone tries it. The essays themselves work perfectly.

In each `part-X.html` and `index.html`, find the section that starts with `<!-- AI COMPANION -->` and either delete it or hide it with `style="display:none"`.

Time: 5 minutes. Risk: zero.

### Option B: Cloudflare Worker proxy (recommended, ~30 min setup)

The proper way. Anthropic key lives in a Cloudflare Worker, never exposed to the browser. The browser hits your worker URL, the worker forwards to Anthropic with the key attached.

1. Sign up for Cloudflare (free tier is fine).
2. Create a new Worker. Paste this code:

```js
export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }
    if (request.method !== 'POST') return new Response('POST only', { status: 405 });

    const body = await request.text();
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body,
    });

    return new Response(await resp.text(), {
      status: resp.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  },
};
```

3. In the Worker dashboard: Settings → Variables → Add `ANTHROPIC_API_KEY` as a secret.
4. Deploy. Cloudflare gives you a URL like `https://gnosis-proxy.your-name.workers.dev`.
5. In `shared.js`, change the one fetch URL from `https://api.anthropic.com/v1/messages` to your worker URL.

Done. Free tier handles 100,000 requests/day.

### Option C: Inline API key (do not do this)

Never paste your Anthropic key into client-side JavaScript on a public site. Anyone viewing source can take it and run up your bill. Skip.

---

## Customising

All design tokens live at the top of `shared.css` in the `:root` block. Change palette, fonts, or grain density there and all 6 pages update.

```css
:root {
  --ink: #0d0c0a;       /* background */
  --paper: #f5f0e8;     /* primary text */
  --gold: #c9a84c;      /* accent, links, eyebrow text */
  --rust: #b85c38;      /* secondary accent, next-card */
  --teal: #3a7d74;      /* tertiary, used sparingly */
}
```

Per-page Sophia configuration lives in the inline `<script>` block near the bottom of each `part-X.html`. Edit the `systemPrompt` string to change how Sophia responds on that page.

---

## Sources

All Nag Hammadi citations from:

- The Nag Hammadi Library in English, James M. Robinson, ed. (HarperOne, revised 1990)
- The Nag Hammadi Scriptures, Marvin Meyer, ed. (HarperOne, 2007)
- The Gnostic Scriptures, Bentley Layton, ed. and trans. (Doubleday, 1987)
- Elaine Pagels, The Gnostic Gospels (Random House, 1979)
- Karen L. King, The Secret Revelation of John (Harvard, 2006)

Per-essay sources listed in each colophon.

---

## Licence

Content (essays, SVG illustrations, design) © 2026 Shama Thakur, all rights reserved.
Code (HTML/CSS/JS scaffolding) is MIT-licensed. Take the scaffolding, do something interesting with it, link back if you can.

---

A Sovereign by Source production. Built in Stockholm.
sovereignbysource.substack.com · ko-fi.com/shamathakur · @shama_thakur77
