# Ad bar setup guide

Cert Master includes an optional **fixed bottom ad bar** that:

- Shows on **all app views**, including during practice exams
- Stays in a **horizontal bar** fixed to the bottom of the viewport (content gets bottom padding so nothing is covered)
- Loads only after you enable it in `data/ads-config.json`
- Supports **Google AdSense** or a simple **custom text link**

---

## Quick start

1. Copy the example config:
   ```bash
   cp data/ads-config.example.json data/ads-config.json
   ```
   (`data/ads-config.json` already exists with ads **disabled**.)

2. Choose a provider and edit `data/ads-config.json` (see below).

3. Set `"enabled": true`.

4. Commit, push, and wait for GitHub Pages to redeploy.

5. Open your live site (not `file://`) and confirm the bar appears fixed along the bottom on every page.

---

## Configuration reference

File: **`data/ads-config.json`**

| Field | Description |
|--------|-------------|
| `enabled` | `true` to show ads; `false` to hide (default). |
| `placement` | `"bar"` — fixed horizontal bar at the bottom (legacy `"bottom"` / `"side"` are ignored). |
| `provider` | `"adsense"` or `"custom"`. |

### Google AdSense (`provider: "adsense"`)

```json
{
  "enabled": true,
  "placement": "bottom",
  "provider": "adsense",
  "adsense": {
    "client": "ca-pub-XXXXXXXXXXXXXXXX",
    "slot": "1234567890",
    "format": "auto",
    "fullWidthResponsive": true
  }
}
```

### Custom link (`provider: "custom"`)

Optional bar text when you are **not** using AdSense, or as a dev fallback if you add a `custom` block back to `ads-config.json`.

**Do not use “Sponsored” unless you have a paid sponsorship or affiliate relationship** with that brand. Cert Master is not affiliated with AWS, Microsoft, Google, or CompTIA — linking to their free training is fine in question feedback, but must not be labeled as sponsorship in the ad bar.

```json
{
  "enabled": true,
  "placement": "bar",
  "provider": "custom",
  "custom": {
    "label": "Study link",
    "text": "Your short description here",
    "href": "https://example.com/resource"
  }
}
```

---

## Full Google AdSense setup

### 1. Create an AdSense account

1. Go to [https://www.google.com/adsense/](https://www.google.com/adsense/).
2. Sign in with Google and add your site URL: `https://practicecert.com/`.
3. Complete verification (DNS, HTML file, or meta tag — Google will guide you).

GitHub Pages tip: use the **HTML tag** or **ads.txt** method in repo root if offered.

### 2. Add `ads.txt` (recommended)

Create **`ads.txt`** in the **repository root** (same level as `index.html`):

```
google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
```

Replace `pub-XXXXXXXXXXXXXXXX` with your publisher ID (the part after `ca-pub-` in your client ID).

After deploy, check: `https://your-site/ads.txt`

### 3. Create an ad unit

1. In AdSense: **Ads** → **By ad unit** → **Display ads**.
2. Choose a **responsive** display unit with a modest size (e.g. horizontal banner).
3. Copy:
   - **Publisher ID** → `ca-pub-XXXXXXXXXXXXXXXX` → `adsense.client`
   - **Ad unit ID** (data-ad-slot) → `adsense.slot`

### 4. Update `data/ads-config.json`

```json
{
  "enabled": true,
  "placement": "bottom",
  "provider": "adsense",
  "adsense": {
    "client": "ca-pub-XXXXXXXXXXXXXXXX",
    "slot": "1234567890",
    "format": "auto",
    "fullWidthResponsive": true
  }
}
```

### 5. Deploy and wait

- New sites often show **blank ads** or **placeholder** for 24–48 hours while AdSense reviews traffic.
- Ad blockers in your browser will hide ads during testing — try a private window with extensions off.

### 6. Policy checklist

- Do **not** click your own ads.
- Site should have enough content (your question bank + README helps).
- Include a **privacy policy** if AdSense requests it (cookies, personalized ads).
- This app is unofficial; do not imply AWS endorsement in ad surrounding text.

---

## Layout

The ad uses a **fixed horizontal bar** (`#ad-slot.ad-slot--bar`) pinned to the bottom of the viewport. When ads load, `body` gets `has-ad-bar` and extra bottom padding (`--ad-bar-h`, 90px) so exam controls and footer content stay above the bar.

AdSense uses `data-ad-format="horizontal"` for a wide banner-style unit.

---

## Files involved

| File | Purpose |
|------|---------|
| `data/ads-config.json` | Your live settings (commit or keep private). |
| `data/ads-config.example.json` | Template without secrets. |
| `js/ads.js` | Loads config, injects AdSense or custom link. |
| `index.html` | `#ad-slot` markup (sibling of `#page-shell`, fixed at bottom). |
| `css/styles.css` | `.ad-slot--bar`, `body.has-ad-bar`. |
| `docs/ADS_SETUP.md` | This guide. |

---

## Troubleshooting

| Issue | What to try |
|--------|-------------|
| No ad bar at all | Set `"enabled": true`. Check browser console. Ensure you use `http://localhost` or HTTPS, not `file://`. |
| Blank box | AdSense still approving site; wrong slot ID; ad blocker enabled. |
| Content hidden behind bar | Hard refresh; confirm `body.has-ad-bar` and `--ad-bar-h` padding in `css/styles.css`. |
| AdSense script error | Client ID must include `ca-pub-` prefix; site domain must match AdSense property. |
| Only want a text link | Use `"provider": "custom"` — no AdSense script loaded. |

---

## Disabling ads

Set `"enabled": false` in `data/ads-config.json` and redeploy. The slot stays in the DOM but never becomes visible.
